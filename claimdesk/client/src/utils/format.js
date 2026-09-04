export const STATUS_LABEL = {
  draft: 'Draft',
  submitted: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const STATUS_VARIANT = {
  draft: 'draft',
  submitted: 'submitted',
  approved: 'approved',
  rejected: 'rejected',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n || 0));

export const formatDate = (d) => {
  if (!d) return '-';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (d) => {
  if (!d) return '-';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function StatusBadge({ status }) {
  return <span className={`cd-status ${STATUS_VARIANT[status] || ''}`}>{STATUS_LABEL[status] || status}</span>;
}