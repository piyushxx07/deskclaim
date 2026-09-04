import { useEffect, useState } from 'react';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const SORTS = [
  { value: 'created_at', label: 'Created date' },
  { value: 'expense_date', label: 'Expense date' },
  { value: 'amount', label: 'Amount' },
  { value: 'voucher_date', label: 'Voucher date' },
  { value: 'status', label: 'Status' },
];

export default function SearchFilterBar({ params, setParams, onApply }) {
  const [local, setLocal] = useState(params);

  useEffect(() => { setLocal(params); /* eslint-disable-next-line */ }, JSON.stringify(params));

  const set = (k) => (e) => setLocal({ ...local, [k]: e.target.value });
  const reset = () => {
    const empty = { search: '', status: '', department: '', category: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', sortBy: 'created_at', order: 'desc' };
    setLocal(empty); setParams(empty); onApply?.();
  };

  return (
    <div className="mb-3">
      <div className="row g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Search voucher #, title..." value={local.search} onChange={set('search')} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={local.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={local.sortBy} onChange={set('sortBy')}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={local.order} onChange={set('order')}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button className="btn cd-btn-primary" onClick={() => { setParams(local); onApply?.(); }}>
            <i className="bi bi-funnel me-1"></i>Apply
          </button>
          <button className="btn btn-outline-secondary" onClick={reset}>Reset</button>
        </div>

        <div className="col-md-3">
          <input className="form-control" placeholder="Department" value={local.department} onChange={set('department')} />
        </div>
        <div className="col-md-2">
          <input className="form-control" placeholder="Category" value={local.category} onChange={set('category')} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" value={local.dateFrom} onChange={set('dateFrom')} title="From date" />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" value={local.dateTo} onChange={set('dateTo')} title="To date" />
        </div>
        <div className="col-md-1">
          <input type="number" className="form-control" placeholder="Min ₹" value={local.minAmount} onChange={set('minAmount')} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Max ₹" value={local.maxAmount} onChange={set('maxAmount')} />
        </div>
      </div>
    </div>
  );
}