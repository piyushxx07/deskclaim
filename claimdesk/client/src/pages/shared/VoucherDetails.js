import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { formatCurrency, formatDate, formatDateTime, StatusBadge } from '../../utils/format';
import AiRiskPanel from '../../components/AiRiskPanel';
import { toast } from 'react-toastify';

export default function VoucherDetails({ role }) {
  const { id } = useParams();
  const [v, setV] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const back = role === 'employee' ? '/employee/vouchers' : role === 'director' ? '/director/vouchers' : '/accounts/vouchers';

  const load = () => voucherApi.get(id).then((r) => setV(r.data)).catch(() => toast.error('Failed to load'));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const approve = async () => {
    const input = document.getElementById('dir-sig-upload');
    const file = input?.files?.[0];
    if (!file) return toast.error('Please upload your signature before approving');
    setBusy(true);
    try {
      await voucherApi.approve(id, file);
      toast.success('Voucher approved');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Approval failed'); }
    finally { setBusy(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a rejection reason');
    setBusy(true);
    try {
      await voucherApi.reject(id, rejectReason);
      toast.success('Voucher rejected');
      setRejectOpen(false);
      setRejectReason('');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Rejection failed'); }
    finally { setBusy(false); }
  };

  if (!v) return <div>Loading...</div>;

  const canEdit = role === 'employee' && v.status === 'draft';
  const canAct = role === 'director' && v.status === 'submitted';

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">{v.voucher_number}</h2>
            <StatusBadge status={v.status} />
          </div>
          <p>{v.expense_title} &middot; submitted by {v.employee?.name}</p>
        </div>
        <Link to={back} className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="cd-card p-4">
            <h6 className="cd-section-title">Basic Information</h6>
            <div className="row g-3">
              <Field label="Voucher Date" value={formatDate(v.voucher_date)} />
              <Field label="Expense Date" value={formatDate(v.expense_date)} />
              <Field label="Department" value={v.department} />
              <Field label="Category" value={v.expense_category || '-'} />
              <Field label="Title" value={v.expense_title} />
              <Field label="Amount" value={formatCurrency(v.amount)} />
              <div className="col-12">
                <div className="text-muted small">Description</div>
                <div>{v.expense_description || <span className="text-muted">No description</span>}</div>
              </div>
            </div>

            <hr className="my-4" />
            <h6 className="cd-section-title">Approval</h6>
            {v.status === 'rejected' && (
              <div className="alert alert-danger">
                <strong>Rejected:</strong> {v.rejection_reason}
              </div>
            )}
            {v.status === 'approved' && (
              <div className="alert alert-success">
                <strong>Approved</strong> on {formatDateTime(v.approval_date)} by {v.director?.name}.
              </div>
            )}
            {v.status === 'submitted' && (
              <div className="alert alert-warning">
                This voucher is awaiting director approval.
              </div>
            )}

            {canAct && (
              <>
                <div className="mt-3" id="tour-ai">
                  <AiRiskPanel voucherId={id} />
                </div>
                <div className="mt-3" id="tour-act">
                <label className="form-label">Director Signature <span className="text-danger">*</span></label>
                <input id="dir-sig-upload" type="file" accept="image/png,image/jpeg,image/webp" className="form-control mb-3" />
                <div className="d-flex gap-2">
                  <button className="btn btn-success" onClick={approve} disabled={busy}>
                    <i className="bi bi-check-lg me-1"></i>Approve
                  </button>
                  <button className="btn btn-outline-danger" onClick={() => setRejectOpen((x) => !x)} disabled={busy}>
                    <i className="bi bi-x-lg me-1"></i>Reject
                  </button>
                </div>
                {rejectOpen && (
                  <div className="cd-reject-panel mt-3">
                    <label className="form-label">Rejection reason <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="3" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tell the employee why this was rejected..." />
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-danger" onClick={reject} disabled={busy}>Confirm reject</button>
                      <button className="btn btn-outline-secondary" onClick={() => setRejectOpen(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cd-card p-4 mb-3">
            <h6 className="cd-section-title">Employee</h6>
            <div className="mb-1 fw-semibold">{v.employee?.name}</div>
            <div className="text-muted small">{v.employee?.email}</div>
            <div className="text-muted small mb-3">{v.employee?.department}</div>
            <div className="cd-sig-preview">
              {v.employee_signature_url
                ? <img src={v.employee_signature_url} alt="Employee signature" />
                : <span className="text-muted small">No signature</span>}
            </div>
          </div>

          <div className="cd-card p-4 mb-3">
            <h6 className="cd-section-title">Director</h6>
            {v.director ? (
              <>
                <div className="mb-1 fw-semibold">{v.director.name}</div>
                <div className="text-muted small mb-3">{v.director.email}</div>
              </>
            ) : <div className="text-muted small mb-3">Not actioned yet</div>}
            <div className="cd-sig-preview">
              {v.director_signature_url
                ? <img src={v.director_signature_url} alt="Director signature" />
                : <span className="text-muted small">No signature</span>}
            </div>
          </div>

          <div className="cd-card p-4">
            <h6 className="cd-section-title">Audit</h6>
            <div className="small text-muted">Created: {formatDateTime(v.created_at)}</div>
            <div className="small text-muted">Updated: {formatDateTime(v.updated_at)}</div>
            {v.approval_date && <div className="small text-muted">Actioned: {formatDateTime(v.approval_date)}</div>}
            {canEdit && (
              <Link to={`/employee/vouchers/${v.id}/edit`} className="btn cd-btn-primary btn-sm mt-3 w-100">
                <i className="bi bi-pencil me-1"></i>Edit draft
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="col-md-6">
      <div className="text-muted small">{label}</div>
      <div>{value}</div>
    </div>
  );
}