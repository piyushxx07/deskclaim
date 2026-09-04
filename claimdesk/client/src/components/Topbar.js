import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    navigate('/login', { replace: true });
  };

  return (
    <nav className="cd-navbar d-flex align-items-center justify-content-between">
      <Link to="/" className="cd-brand text-decoration-none">
        <span className="cd-brand-mark">CD</span>
        <span>ClaimDesk</span>
      </Link>
      <div className="d-flex align-items-center gap-2">
        <div className="text-end d-none d-sm-block me-2">
          <div className="cd-topbar-name">{user?.name}</div>
          <div className="cd-topbar-role">{user?.role}</div>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </nav>
  );
}