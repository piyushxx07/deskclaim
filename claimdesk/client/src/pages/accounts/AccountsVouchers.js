import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { formatCurrency, StatusBadge, formatDate } from '../../utils/format';
import SearchFilterBar from '../../components/SearchFilterBar';

export default function AccountsVouchers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ search: '', status: '', sortBy: 'created_at', order: 'desc' });

  const load = (p = params) => {
    setLoading(true);
    voucherApi.list(p).then((r) => setRows(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(params); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <h2>All Vouchers</h2>
          <p>Read-only view of all vouchers for reimbursement processing.</p>
        </div>
        <Link to="/accounts/vouchers?status=approved" className="btn cd-btn-primary">
          <i className="bi bi-cash-coin me-1"></i>Approved for payout
        </Link>
      </div>

      <div className="cd-card p-3">
        <SearchFilterBar params={params} setParams={setParams} onApply={() => load(params)} />

        {loading ? (
          <div className="text-center py-4 text-muted">Loading...</div>
        ) : !rows.length ? (
          <div className="cd-empty-state"><i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i><p className="mt-2 mb-0">No vouchers found.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table cd-table align-middle">
              <thead>
                <tr><th>Voucher #</th><th>Employee</th><th>Title</th><th>Department</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td><Link to={`/accounts/vouchers/${v.id}`} className="text-decoration-none">{v.voucher_number}</Link></td>
                    <td>{v.employee?.name}</td>
                    <td>{v.expense_title}</td>
                    <td>{v.department}</td>
                    <td>{formatDate(v.expense_date)}</td>
                    <td>{formatCurrency(v.amount)}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td className="text-end">
                      <Link to={`/accounts/vouchers/${v.id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-eye"></i>
                      </Link>
                    </td>
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