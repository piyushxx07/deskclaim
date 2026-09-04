import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { formatCurrency, StatusBadge, formatDate } from '../../utils/format';
import DirectorTour from '../../components/DirectorTour';

const TOUR_KEY = 'cd_director_tour_done_v1';

export default function DirectorDashboard() {
  const [data, setData] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(true);

  useEffect(() => {
    voucherApi.dashboard().then((r) => setData(r.data)).catch(() => {});
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTourDismissed(false);
      const t = setTimeout(() => setTourOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const closeTour = (markDone = true) => {
    setTourOpen(false);
    if (markDone) {
      localStorage.setItem(TOUR_KEY, '1');
      setTourDismissed(true);
    }
  };

  const restartTour = () => setTourOpen(true);

  const pendingCount = data?.counts.submitted || 0;

  const stats = [
    { label: 'Pending Approval',  value: data?.counts.submitted || 0,           icon: 'bi-hourglass-split' },
    { label: 'Approved Today',    value: data?.approvedToday || 0,              icon: 'bi-check-circle' },
    { label: 'Rejected Today',    value: data?.rejectedToday || 0,              icon: 'bi-x-circle' },
    { label: 'Total Pending',     value: formatCurrency(data?.pendingAmount || 0), icon: 'bi-cash-stack' },
    { label: 'Total Vouchers',    value: data?.counts.total || 0,               icon: 'bi-receipt' },
    { label: 'Approved (all)',    value: data?.counts.approved || 0,            icon: 'bi-trophy' },
  ];

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <h2>Director Dashboard</h2>
          <p>Vouchers awaiting your decision and recent activity across the organization.</p>
        </div>
        <Link to="/director/vouchers?status=submitted" className="btn cd-btn-primary">
          <i className="bi bi-hourglass-split me-1"></i>Review pending
        </Link>
      </div>

      {!tourDismissed && (
        <div className="cd-welcome" id="tour-pending">
          <span className="cd-welcome-arrow"><i className="bi bi-arrow-down-circle-fill"></i></span>
          <div className="cd-welcome-text">
            <strong>New here?</strong>
            <p>Take a 30-second tour to see how the AI risk panel and the approve flow work for you.</p>
          </div>
          <div className="cd-welcome-btn">
            <button className="btn btn-primary btn-sm" onClick={restartTour}>
              <i className="bi bi-play-circle me-1"></i>Start tour
            </button>
            <button className="btn btn-link btn-sm text-muted" onClick={() => closeTour(true)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4" id="tour-list">
        {stats.map((s) => (
          <div key={s.label} className="col-6 col-md-4 col-lg-2">
            <div className="cd-card cd-stat-card h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="cd-stat-label">{s.label}</div>
                  <div className="cd-stat-value">{s.value}</div>
                </div>
                <span className="cd-stat-icon"><i className={`bi ${s.icon}`}></i></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cd-card p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Recent voucher activity</h5>
          <div className="d-flex align-items-center gap-2">
            {tourDismissed && (
              <button className="btn btn-link btn-sm text-muted p-0" onClick={restartTour} title="Show tour again">
                <i className="bi bi-question-circle me-1"></i>Show tour
              </button>
            )}
            <Link to="/director/vouchers" className="text-decoration-none small">View all <i className="bi bi-arrow-right"></i></Link>
          </div>
        </div>
        {!data?.recent?.length ? (
          <div className="cd-empty-state">
            <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
            {pendingCount === 0 ? (
              <>
                <p className="mt-2 mb-2"><strong>All caught up.</strong> No vouchers are waiting on you right now.</p>
                <p className="small text-muted">When an employee submits a voucher it will appear here for review.</p>
              </>
            ) : (
              <p className="mt-2 mb-0">Nothing recent.</p>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table cd-table">
              <thead><tr><th>Voucher</th><th>Title</th><th>Employee</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {data.recent.map((v) => (
                  <tr key={v.id}>
                    <td><Link to={`/director/vouchers/${v.id}`} className="text-decoration-none">{v.voucher_number}</Link></td>
                    <td>{v.expense_title}</td>
                    <td>{v.employee?.name}</td>
                    <td>{formatCurrency(v.amount)}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DirectorTour open={tourOpen} onClose={() => closeTour(true)} />
    </div>
  );
}
