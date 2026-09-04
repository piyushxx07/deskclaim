import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthHeroPanel from '../../components/AuthHeroPanel';
import { toast } from 'react-toastify';

const ROLES = [
  { value: 'employee', label: 'Employee', hint: 'Create and submit expense vouchers' },
  { value: 'director', label: 'Director', hint: 'Review and approve vouchers' },
  { value: 'accounts', label: 'Accounts',  hint: 'Track approved vouchers for payout' },
];

export default function SignupPage() {
  const { signup, user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee', department: '' });
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/', { replace: true }); return null; }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim() || null,
      });
      const u = await login(form.email.trim(), form.password);
      toast.success(`Account created. Welcome, ${u.name}!`);
      const dest = u.role === 'employee' ? '/employee/dashboard' : u.role === 'director' ? '/director/dashboard' : '/accounts/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cd-login-shell">
      <AuthHeroPanel />

      <div className="cd-login-form-wrap">
        <form className="cd-login-form cd-form-fade" onSubmit={handleSubmit}>
          <h3 className="mb-1 fw-bold">Create your account</h3>
          <p className="text-muted mb-4">Tell us a bit about yourself to get started.</p>

          <div className="mb-3">
            <label className="form-label">Full name <span className="text-danger">*</span></label>
            <input className="form-control" required value={form.name} onChange={set('name')} placeholder="e.g. Riya Sharma" />
          </div>

          <div className="row g-2">
            <div className="col-md-7 mb-3">
              <label className="form-label">Email <span className="text-danger">*</span></label>
              <input type="email" className="form-control" required value={form.email} onChange={set('email')} placeholder="you@company.com" />
            </div>
            <div className="col-md-5 mb-3">
              <label className="form-label">Department</label>
              <input className="form-control" value={form.department} onChange={set('department')} placeholder="e.g. Sales" />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password <span className="text-danger">*</span></label>
              <input type="password" className="form-control" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm <span className="text-danger">*</span></label>
              <input type="password" className="form-control" required minLength={6} value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Role <span className="text-danger">*</span></label>
            <div className="cd-role-grid">
              {ROLES.map((r) => (
                <label key={r.value} className={`cd-role-card ${form.role === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} className="d-none" />
                  <div className="cd-role-name">{r.label}</div>
                  <div className="cd-role-hint">{r.hint}</div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Already have an account? </span>
            <Link to="/login" className="fw-semibold">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
