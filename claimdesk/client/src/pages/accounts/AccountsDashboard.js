import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { formatCurrency, StatusBadge, formatDate } from '../../utils/format';

export default function AccountsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { voucherApi.dashboard().then((r) => setData(r.data)).catch(() => {}); }, []);

  const stats = [
    { label: 'Total Vouchers',        value: data?.counts.total || 0,                      icon: 'bi-receipt' },
    { label: 'Pending Approval',      value: data?.counts.submitted || 0,                  icon: 'bi-hourglass-split' },
    { label: 'Approved',              value: data?.counts.approved || 0,                   icon: 'bi-check-circle' },
    { label: 'Rejected',              value: data?.counts.rejected || 0,                   icon: 'bi-x-circle' },
    { label: 'Total Approved Amount', value: formatCurrency(data?.totalApprovedAmount || 0), icon: 'bi-cash-stack' },
    { label: 'Pending Amount',        value: formatCurrency(data?.pendingAmount || 0),     icon: 'bi-wallet2' },
  ];

  const recentApproved = (data?.recent || []).filter((v) => v.status === 'approved').slice(0, 5);

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <h2>Accounts Dashboard</h2>
          <p>Monitor approved vouchers and prepare reimbursements.</p>
        </div>
        <Link to="/accounts/vouchers?status=approved" className="btn cd-btn-primary">
          <i className="bi bi-cash-coin me-1"></i>View approved
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
        <h5 className="mb-3">Recent approved vouchers</h5>
        {!recentApproved.length ? (
          <div className="cd-empty-state"><i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i><p className="mt-2 mb-0">No approved vouchers yet.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table cd-table">
              <thead><tr><th>Voucher</th><th>Employee</th><th>Approved On</th><th>Amount</th></tr></thead>
              <tbody>
                {recentApproved.map((v) => (
                  <tr key={v.id}>
                    <td><Link to={`/accounts/vouchers/${v.id}`} className="text-decoration-none">{v.voucher_number}</Link></td>
                    <td>{v.employee?.name}</td>
                    <td>{formatDate(v.approval_date)}</td>
                    <td>{formatCurrency(v.amount)}</td>
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