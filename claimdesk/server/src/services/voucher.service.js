const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const ALLOWED_STATUSES = ['draft', 'submitted', 'approved', 'rejected'];
const PUBLIC_SELECT =
  'id, voucher_number, voucher_date, expense_date, department, expense_title, expense_category, expense_description, amount, status, employee_signature_url, director_signature_url, approval_date, rejection_reason, created_by, approved_by, created_at, updated_at, employee:users!vouchers_created_by_fkey(id, name, email, department), director:users!vouchers_approved_by_fkey(id, name, email)';

function generateVoucherNumber() {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `VCH-${ts}-${rand}`;
}

class VoucherService {
  async createAsDraft(payload) {
    const required = ['department', 'expense_title', 'expense_date', 'amount'];
    for (const k of required) {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
        throw new ApiError(400, `Field '${k}' is required`);
      }
    }
    if (Number(payload.amount) <= 0) throw new ApiError(400, 'Amount must be greater than zero');

    const row = {
      voucher_number: generateVoucherNumber(),
      voucher_date: new Date().toISOString().slice(0, 10),
      department: payload.department,
      expense_title: payload.expense_title,
      expense_category: payload.expense_category || null,
      expense_description: payload.expense_description || null,
      expense_date: payload.expense_date,
      amount: Number(payload.amount),
      status: 'draft',
      created_by: payload.userId,
    };

    const { data, error } = await supabase
      .from('vouchers')
      .insert([row])
      .select(PUBLIC_SELECT)
      .single();
    if (error) throw new ApiError(500, 'Failed to create voucher', error.message);
    return data;
  }

  async update(id, payload, userId) {
    const existing = await this._getOrThrow(id);
    if (existing.created_by !== userId) throw new ApiError(403, 'Not your voucher');
    if (existing.status !== 'draft') throw new ApiError(400, 'Only draft vouchers can be edited');

    if (payload.amount !== undefined && Number(payload.amount) <= 0) {
      throw new ApiError(400, 'Amount must be greater than zero');
    }

    const allowed = ['department', 'expense_title', 'expense_category', 'expense_description', 'expense_date', 'amount'];
    const updates = {};
    for (const k of allowed) if (payload[k] !== undefined) updates[k] = payload[k];

    const { data, error } = await supabase
      .from('vouchers')
      .update(updates)
      .eq('id', id)
      .select(PUBLIC_SELECT)
      .single();
    if (error) throw new ApiError(500, 'Failed to update voucher', error.message);
    return data;
  }

  async submit(id, userId, signatureUrl) {
    const v = await this._getOrThrow(id);
    if (v.created_by !== userId) throw new ApiError(403, 'Not your voucher');
    if (v.status !== 'draft') throw new ApiError(400, 'Only draft vouchers can be submitted');
    if (!signatureUrl) throw new ApiError(400, 'Employee signature is required before submission');

    const { data, error } = await supabase
      .from('vouchers')
      .update({ status: 'submitted', employee_signature_url: signatureUrl })
      .eq('id', id)
      .select(PUBLIC_SELECT)
      .single();
    if (error) throw new ApiError(500, 'Failed to submit voucher', error.message);
    return data;
  }

  async remove(id, userId) {
    const v = await this._getOrThrow(id);
    if (v.created_by !== userId) throw new ApiError(403, 'Not your voucher');
    if (v.status !== 'draft') throw new ApiError(400, 'Only draft vouchers can be deleted');

    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) throw new ApiError(500, 'Failed to delete voucher', error.message);
    return { id };
  }

  async approve(id, directorId, signatureUrl) {
    if (!signatureUrl) throw new ApiError(400, 'Director signature is required before approval');
    const v = await this._getOrThrow(id);
    if (v.status !== 'submitted') throw new ApiError(400, 'Only submitted vouchers can be approved');

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        status: 'approved',
        director_signature_url: signatureUrl,
        approval_date: new Date().toISOString(),
        approved_by: directorId,
        rejection_reason: null,
      })
      .eq('id', id)
      .select(PUBLIC_SELECT)
      .single();
    if (error) throw new ApiError(500, 'Failed to approve voucher', error.message);
    return data;
  }

  async reject(id, directorId, reason) {
    if (!reason || !reason.trim()) throw new ApiError(400, 'Rejection reason is required');
    const v = await this._getOrThrow(id);
    if (v.status !== 'submitted') throw new ApiError(400, 'Only submitted vouchers can be rejected');

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        approved_by: directorId,
        approval_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select(PUBLIC_SELECT)
      .single();
    if (error) throw new ApiError(500, 'Failed to reject voucher', error.message);
    return data;
  }

  async getById(id, user) {
    const v = await this._getOrThrow(id);
    if (user.role === 'employee' && v.created_by !== user.id) {
      throw new ApiError(403, 'You can only view your own vouchers');
    }
    return v;
  }

  async listForUser(user, query = {}) {
    let q = supabase.from('vouchers').select(PUBLIC_SELECT);

    if (user.role === 'employee') q = q.eq('created_by', user.id);

    const { search, status, department, category, dateFrom, dateTo, minAmount, maxAmount, sortBy = 'created_at', order = 'desc' } = query;

    if (search) {
      const term = `%${search}%`;
      q = q.or(`voucher_number.ilike.${term},expense_title.ilike.${term},expense_description.ilike.${term}`);
    }
    if (status && ALLOWED_STATUSES.includes(status)) q = q.eq('status', status);
    if (department) q = q.ilike('department', `%${department}%`);
    if (category) q = q.ilike('expense_category', `%${category}%`);
    if (dateFrom) q = q.gte('expense_date', dateFrom);
    if (dateTo) q = q.lte('expense_date', dateTo);
    if (minAmount) q = q.gte('amount', Number(minAmount));
    if (maxAmount) q = q.lte('amount', Number(maxAmount));

    const allowedSort = ['created_at', 'amount', 'expense_date', 'voucher_date', 'status'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order === 'asc' ? 'asc' : 'desc';
    q = q.order(safeSort, { ascending: safeOrder === 'asc' });

    const { data, error } = await q;
    if (error) throw new ApiError(500, 'Failed to fetch vouchers', error.message);
    return data || [];
  }

  async dashboard(user) {
    const all = await this.listForUser(user);
    const today = new Date().toISOString().slice(0, 10);
    const counts = { total: all.length, draft: 0, submitted: 0, approved: 0, rejected: 0 };
    let totalAmount = 0;
    let totalApprovedAmount = 0;
    let pendingAmount = 0;
    let approvedToday = 0;
    let rejectedToday = 0;
    for (const v of all) {
      counts[v.status] = (counts[v.status] || 0) + 1;
      totalAmount += Number(v.amount);
      if (v.status === 'approved') totalApprovedAmount += Number(v.amount);
      if (v.status === 'submitted') pendingAmount += Number(v.amount);
      if (v.status === 'approved' && v.approval_date?.slice(0, 10) === today) approvedToday++;
      if (v.status === 'rejected' && v.approval_date?.slice(0, 10) === today) rejectedToday++;
    }
    const recent = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    return { counts, totalAmount, totalApprovedAmount, pendingAmount, approvedToday, rejectedToday, recent };
  }

  async _getOrThrow(id) {
    const { data, error } = await supabase
      .from('vouchers')
      .select(PUBLIC_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new ApiError(500, 'Failed to load voucher', error.message);
    if (!data) throw new ApiError(404, 'Voucher not found');
    return data;
  }
}

module.exports = new VoucherService();