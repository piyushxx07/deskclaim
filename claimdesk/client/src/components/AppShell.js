import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="cd-shell">
      <Topbar />
      <div className="d-flex flex-grow-1">
        <Sidebar role={user.role} />
        <main className="cd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}