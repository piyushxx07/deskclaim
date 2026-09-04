import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthHeroPanel from '../../components/AuthHeroPanel';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      const redirect = location.state?.from?.pathname || (u.role === 'employee' ? '/employee/dashboard' : u.role === 'director' ? '/director/dashboard' : '/accounts/dashboard');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'employee') { setEmail('employee@claimdesk.com'); setPassword('password123'); }
    if (role === 'director') { setEmail('director@claimdesk.com'); setPassword('password123'); }
    if (role === 'accounts') { setEmail('accounts@claimdesk.com'); setPassword('password123'); }
  };

  return (
    <div className="cd-login-shell">
      <AuthHeroPanel />

      <div className="cd-login-form-wrap">
        <form className="cd-login-form cd-form-fade" onSubmit={handleSubmit}>
          <h3 className="mb-1 fw-bold">Sign in</h3>
          <p className="text-muted mb-4">Use your work email to continue.</p>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>New here? </span>
            <Link to="/signup" className="fw-semibold">Create an account</Link>
          </div>

          <div className="cd-demo-panel">
            <div className="cd-demo-panel-title">Demo accounts</div>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo('employee')}>Employee</button>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo('director')}>Director</button>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fillDemo('accounts')}>Accounts</button>
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>Password for all demo accounts: <strong>password123</strong></div>
          </div>
        </form>
      </div>
    </div>
  );
}
