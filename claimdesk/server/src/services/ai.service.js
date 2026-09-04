const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const HIGH_AMOUNT_THRESHOLD = 25000;
const VERY_HIGH_AMOUNT_THRESHOLD = 75000;
const MAX_REJECTION_RATE = 0.4;
const RECENT_WINDOW_DAYS = 90;

function withinDays(iso, days) {
  if (!iso) return false;
  const d = new Date(iso);
  const cutoff = Date.now() - days * 86400000;
  return d.getTime() >= cutoff;
}

function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

class AiService {
  async analyzeVoucher(voucherId) {
    const { data: v, error } = await supabase
      .from('vouchers')
      .select('id, voucher_number, amount, status, department, expense_title, expense_category, expense_description, expense_date, created_by, created_at')
      .eq('id', voucherId)
      .maybeSingle();
    if (error) throw new ApiError(500, 'Failed to load voucher for analysis', error.message);
    if (!v) throw new ApiError(404, 'Voucher not found');

    const { data: history, error: hErr } = await supabase
      .from('vouchers')
      .select('id, amount, status, created_at')
      .eq('created_by', v.created_by)
      .neq('id', v.id);
    if (hErr) throw new ApiError(500, 'Failed to load employee history', hErr.message);

    const recent = (history || []).filter((h) => withinDays(h.created_at, RECENT_WINDOW_DAYS));
    const pastSubmitted = recent.filter((h) => h.status === 'submitted' || h.status === 'approved' || h.status === 'rejected');
    const pastRejected = recent.filter((h) => h.status === 'rejected');
    const pastApproved = recent.filter((h) => h.status === 'approved');
    const rejectionRate = pastSubmitted.length > 0 ? pastRejected.length / pastSubmitted.length : 0;
    const avgAmount = pastSubmitted.length > 0
      ? pastSubmitted.reduce((s, h) => s + Number(h.amount), 0) / pastSubmitted.length
      : 0;

    const signals = [];
    let score = 0;

    if (Number(v.amount) >= VERY_HIGH_AMOUNT_THRESHOLD) {
      signals.push({ kind: 'high-amount', tone: 'high', text: `Amount is very high (INR ${Number(v.amount).toLocaleString('en-IN')}) - well above the typical range for this role.` });
      score += 35;
    } else if (Number(v.amount) >= HIGH_AMOUNT_THRESHOLD) {
      signals.push({ kind: 'medium-amount', tone: 'medium', text: `Amount is above average (INR ${Number(v.amount).toLocaleString('en-IN')}) - worth a closer look at supporting details.` });
      score += 15;
    } else if (avgAmount > 0 && Number(v.amount) > avgAmount * 1.5) {
      signals.push({ kind: 'spike', tone: 'medium', text: `Amount is roughly ${(Number(v.amount) / avgAmount).toFixed(1)}x this employee's recent average (INR ${avgAmount.toFixed(0)}).` });
      score += 12;
    } else if (pastSubmitted.length === 0) {
      signals.push({ kind: 'new-employee', tone: 'low', text: 'No prior voucher history found for this employee.' });
      score += 5;
    }

    if (!v.expense_description || v.expense_description.trim().length < 15) {
      signals.push({ kind: 'thin-description', tone: 'medium', text: 'Description is missing or very short - difficult to verify business purpose.' });
      score += 18;
    }
    if (!v.expense_category) {
      signals.push({ kind: 'no-category', tone: 'low', text: 'No expense category selected.' });
      score += 4;
    }
    if (isWeekend(v.expense_date)) {
      signals.push({ kind: 'weekend', tone: 'low', text: 'Expense date falls on a weekend - confirm it relates to a sanctioned work activity.' });
      score += 6;
    }
    if (rejectionRate > MAX_REJECTION_RATE) {
      signals.push({ kind: 'rejection-rate', tone: 'high', text: `Rejection rate of ${(rejectionRate * 100).toFixed(0)}% over the last ${RECENT_WINDOW_DAYS} days is high.` });
      score += 22;
    }
    if (pastApproved.length >= 3 && rejectionRate === 0) {
      signals.push({ kind: 'clean-record', tone: 'low', text: `Clean record: ${pastApproved.length} prior vouchers approved without any rejections.` });
      score -= 8;
    }

    if (signals.length === 0) {
      signals.push({ kind: 'all-good', tone: 'low', text: 'No unusual patterns detected for this voucher.' });
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let level, recommendation, label;
    if (score >= 50)      { level = 'high';     recommendation = 'reject';     label = 'High risk'; }
    else if (score >= 25) { level = 'medium';   recommendation = 'review';     label = 'Worth a closer look'; }
    else                  { level = 'low';      recommendation = 'approve';    label = 'Looks routine'; }

    return {
      voucherId: v.id,
      voucherNumber: v.voucher_number,
      score,
      level,
      label,
      recommendation,
      employeeHistory: {
        totalCount: (history || []).length,
        recentCount: recent.length,
        approvedCount: pastApproved.length,
        rejectedCount: pastRejected.length,
        rejectionRate: Number(rejectionRate.toFixed(2)),
        avgAmount: Number(avgAmount.toFixed(2)),
        windowDays: RECENT_WINDOW_DAYS,
      },
      signals,
      summary: this._summaryFor(v, level, score, rejectionRate, avgAmount, pastApproved.length, pastRejected.length),
    };
  }

  _summaryFor(v, level, score, rejectionRate, avgAmount, approvedCount, rejectedCount) {
    const name = 'This voucher';
    if (level === 'high') {
      return `${name} shows several risk signals (score ${score}/100). Recommend rejecting or asking the employee for additional context before approving.`;
    }
    if (level === 'medium') {
      if (avgAmount > 0 && Number(v.amount) > avgAmount * 1.5) {
        return `${name} is materially higher than this employee's recent average. A quick sanity check on the description and category is advised.`;
      }
      return `${name} has a few minor signals. Skim the description and supporting context before approving.`;
    }
    if (approvedCount >= 3 && rejectionRate === 0) {
      return `${name} is routine and the employee has a clean approval history. Safe to approve.`;
    }
    return `${name} is consistent with normal patterns. Safe to approve.`;
  }
}

module.exports = new AiService();
