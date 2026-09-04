import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import { toast } from 'react-toastify';

const CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Meeting', 'Internet & Phone', 'Training', 'Other'];

const EMPTY = {
  department: '',
  expense_title: '',
  expense_category: '',
  expense_description: '',
  expense_date: new Date().toISOString().slice(0, 10),
  amount: '',
};

export default function VoucherForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      voucherApi.get(id).then((r) => {
        setExisting(r.data);
        setForm({
          department: r.data.department || '',
          expense_title: r.data.expense_title || '',
          expense_category: r.data.expense_category || '',
          expense_description: r.data.expense_description || '',
          expense_date: r.data.expense_date || '',
          amount: r.data.amount || '',
        });
      }).catch(() => navigate('/employee/vouchers', { replace: true }));
    }
  }, [mode, id, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.department) return 'Department is required';
    if (!form.expense_title) return 'Expense title is required';
    if (!form.expense_date) return 'Expense date is required';
    if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than zero';
    return null;
  };

  const saveDraft = async (e) => {
    e.preventDefault();
    const err = validate(); if (err) return toast.error(err);
    setLoading(true);
    try {
      const res = mode === 'edit'
        ? await voucherApi.update(id, { ...form, amount: Number(form.amount) })
        : await voucherApi.create({ ...form, amount: Number(form.amount) });
      toast.success(mode === 'edit' ? 'Draft updated' : 'Draft saved');
      navigate(`/employee/vouchers/${res.data.id}`, { replace: true });
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const submit = async () => {
    const err = validate(); if (err) return toast.error(err);
    const input = document.getElementById('sig-upload');
    const file = input?.files?.[0];
    if (!file) return toast.error('Please attach your signature before submitting');

    setLoading(true);
    try {
      let voucherId = id;
      if (mode === 'edit') {
        await voucherApi.update(id, { ...form, amount: Number(form.amount) });
      } else {
        const created = await voucherApi.create({ ...form, amount: Number(form.amount) });
        voucherId = created.data.id;
      }
      await voucherApi.submit(voucherId, file);
      toast.success('Voucher submitted for approval');
      navigate(`/employee/vouchers/${voucherId}`, { replace: true });
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this draft voucher?')) return;
    try {
      await voucherApi.remove(id);
      toast.success('Draft deleted');
      navigate('/employee/vouchers', { replace: true });
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };

  if (mode === 'edit' && !existing) return <div>Loading...</div>;

  return (
    <div>
      <div className="cd-page-header">
        <div>
          <h2>{mode === 'edit' ? 'Edit Voucher' : 'Create Voucher'}</h2>
          <p>Fill in the details below. You can save as draft or submit for approval.</p>
        </div>
        <Link to="/employee/vouchers" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="cd-card p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Department <span className="text-danger">*</span></label>
            <input className="form-control" value={form.department} onChange={set('department')} placeholder="e.g. Sales" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Expense Title <span className="text-danger">*</span></label>
            <input className="form-control" value={form.expense_title} onChange={set('expense_title')} placeholder="e.g. Client travel to Mumbai" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Expense Category</label>
            <select className="form-select" value={form.expense_category} onChange={set('expense_category')}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Expense Date <span className="text-danger">*</span></label>
            <input type="date" className="form-control" value={form.expense_date} onChange={set('expense_date')} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Amount (INR) <span className="text-danger">*</span></label>
            <input type="number" min="0" step="0.01" className="form-control" value={form.amount} onChange={set('amount')} placeholder="0.00" />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" value={form.expense_description} onChange={set('expense_description')} placeholder="Add any details that help the approver..." />
          </div>

          <div className="col-12">
            <label className="form-label">Employee Signature <span className="text-danger">*</span> <small className="text-muted">(required to submit)</small></label>
            <input id="sig-upload" type="file" accept="image/png,image/jpeg,image/webp" className="form-control" />
            <div className="form-text">Upload a PNG / JPG of your signature (max 2MB).</div>
          </div>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-outline-secondary" onClick={saveDraft} disabled={loading}>
            <i className="bi bi-save me-1"></i>{mode === 'edit' ? 'Save changes' : 'Save as draft'}
          </button>
          <button className="btn cd-btn-primary" onClick={submit} disabled={loading}>
            <i className="bi bi-send me-1"></i>Submit for approval
          </button>
          {mode === 'edit' && (
            <button className="btn btn-outline-danger ms-auto" onClick={remove} disabled={loading}>
              <i className="bi bi-trash me-1"></i>Delete draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}