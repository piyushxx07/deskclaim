import { useEffect, useState } from 'react';
import { voucherApi } from '../api';
import { formatCurrency } from '../utils/format';

const LEVEL_META = {
  low:    { tone: 'low',    icon: 'bi-check2-circle', title: 'Looks routine' },
  medium: { tone: 'medium', icon: 'bi-exclamation-circle', title: 'Worth a closer look' },
  high:   { tone: 'high',   icon: 'bi-shield-exclamation', title: 'High risk' },
};

const RECOMMEND_TEXT = {
  approve: { icon: 'bi-hand-thumbs-up', text: 'Recommendation: Safe to approve' },
  review:  { icon: 'bi-search',         text: 'Recommendation: Review details before deciding' },
  reject:  { icon: 'bi-hand-thumbs-down', text: 'Recommendation: Likely reject - request more context' },
};

export default function AiRiskPanel({ voucherId, onAfterDecision }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(true);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voucherApi.analyze(voucherId);
      setAnalysis(res.data);
      if (onAfterDecision) onAfterDecision(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); /* eslint-disable-next-line */ }, [voucherId]);

  if (error) {
    return (
      <div className="cd-ai-panel cd-ai-error">
        <div className="cd-ai-head">
          <i className="bi bi-cpu"></i>
          <span>AI Risk Analysis</span>
        </div>
        <div className="cd-ai-body small">{error}</div>
        <button className="btn btn-sm btn-outline-primary mt-2" onClick={run}>Try again</button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="cd-ai-panel">
        <div className="cd-ai-head">
          <i className="bi bi-cpu"></i>
          <span>AI Risk Analysis</span>
        </div>
        <div className="cd-ai-body cd-ai-skel">
          <div className="skel skel-line"></div>
          <div className="skel skel-line w-75"></div>
          <div className="skel skel-line w-50"></div>
        </div>
      </div>
    );
  }

  const meta = LEVEL_META[analysis.level] || LEVEL_META.low;
  const rec = RECOMMEND_TEXT[analysis.recommendation] || RECOMMEND_TEXT.review;

  return (
    <div className={`cd-ai-panel cd-ai-${meta.tone}`}>
      <div className="cd-ai-head">
        <span className="cd-ai-mark"><i className="bi bi-cpu"></i></span>
        <div className="flex-grow-1">
          <div className="cd-ai-title">AI Risk Analysis</div>
          <div className="cd-ai-sub">Demo rule-based scoring for {analysis.voucherNumber}</div>
        </div>
        <button className="cd-ai-toggle" onClick={() => setOpen((x) => !x)} aria-label="Toggle panel">
          <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      </div>

      {open && (
        <div className="cd-ai-body">
          <div className="cd-ai-summary">
            <div className="cd-ai-score">
              <div className="cd-ai-score-num">{analysis.score}</div>
              <div className="cd-ai-score-label">/ 100 risk score</div>
            </div>
            <div className="cd-ai-verdict">
              <div className={`cd-ai-pill cd-ai-pill-${meta.tone}`}>
                <i className={`bi ${meta.icon}`}></i> {meta.title}
              </div>
              <div className="cd-ai-rec">
                <i className={`bi ${rec.icon}`}></i> {rec.text}
              </div>
              <p className="cd-ai-sum-text">{analysis.summary}</p>
            </div>
          </div>

          <div className="cd-ai-signals">
            <div className="cd-ai-section-title">Signals considered</div>
            <ul className="cd-ai-signal-list">
              {analysis.signals.map((s, i) => (
                <li key={i} className={`cd-ai-signal tone-${s.tone}`}>
                  <i className={`bi ${s.tone === 'high' ? 'bi-exclamation-triangle-fill' : s.tone === 'medium' ? 'bi-exclamation-circle' : 'bi-check-circle'}`}></i>
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cd-ai-history">
            <div className="cd-ai-section-title">Employee history ({analysis.employeeHistory.windowDays} days)</div>
            <div className="cd-ai-mini-stats">
              <Mini label="Prior vouchers" value={analysis.employeeHistory.recentCount} />
              <Mini label="Approved" value={analysis.employeeHistory.approvedCount} />
              <Mini label="Rejected" value={analysis.employeeHistory.rejectedCount} />
              <Mini label="Avg amount" value={analysis.employeeHistory.avgAmount > 0 ? formatCurrency(analysis.employeeHistory.avgAmount) : '-'} />
            </div>
          </div>

          <div className="cd-ai-footer">
            <span className="cd-ai-disclaimer">
              <i className="bi bi-info-circle"></i> Demo only - rules-based, not a real ML model.
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={run} disabled={loading}>
              <i className="bi bi-arrow-clockwise me-1"></i>Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="cd-ai-mini">
      <div className="cd-ai-mini-val">{value}</div>
      <div className="cd-ai-mini-lbl">{label}</div>
    </div>
  );
}
