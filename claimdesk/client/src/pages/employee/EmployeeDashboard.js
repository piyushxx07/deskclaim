import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { formatCurrency, StatusBadge, formatDate } from '../../utils/format';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    voucherApi.dashboard().then((r) => setData(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Vouchers',     value: data?.counts.total || 0,        icon: 'bi-receipt' },
    { label: 'Draft',              value: data?.counts.draft || 0,        icon: 'bi-pencil-square' },
    { label: 'Pending Approval',   value: data?.counts.submitted || 0,    icon: 'bi-hourglass-split' },
    { label: 'Approved',           value: data?.counts.approved || 0,     icon: 'bi-check-circle' },
    { label: 'Rejected',           value: data?.counts.rejected || 0,     icon: 'bi-x-circle' },
    { label: 'Total Claimed',      value: formatCurrency(data?.totalAmount || 0), icon: 'bi-cash-stack' },
  ];

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <h2>Welcome back</h2>
          <p>Here's a quick look at your expense claims.</p>
        </div>
        <Link to="/employee/vouchers/new" className="btn cd-btn-primary">
          <i className="bi bi-plus-lg me-1"></i>New Voucher
        </Link>
      </div>

      <div className="row g-3 mb-4">
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
          <h5 className="mb-0">Recent vouchers</h5>
          <Link to="/employee/vouchers" className="text-decoration-none">View all <i className="bi bi-arrow-right"></i></Link>
        </div>
        {!data?.recent?.length ? (
          <div className="cd-empty-state">
            <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">No vouchers yet</p>
            <Link to="/employee/vouchers/new" className="btn cd-btn-primary btn-sm">Create your first voucher</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table cd-table">
              <thead><tr><th>Voucher</th><th>Title</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {data.recent.map((v) => (
                  <tr key={v.id}>
                    <td><Link to={`/employee/vouchers/${v.id}`} className="text-decoration-none">{v.voucher_number}</Link></td>
                    <td>{v.expense_title}</td>
                    <td>{formatDate(v.expense_date)}</td>
                    <td>{formatCurrency(v.amount)}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}