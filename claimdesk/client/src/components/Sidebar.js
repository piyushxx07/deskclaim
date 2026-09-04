import { NavLink } from 'react-router-dom';

const MENU = {
  employee: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/employee/vouchers',  label: 'My Vouchers', icon: 'bi-receipt' },
    { to: '/employee/vouchers/new', label: 'New Voucher', icon: 'bi-plus-circle' },
  ],
  director: [
    { to: '/director/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/director/vouchers',  label: 'All Vouchers', icon: 'bi-list-check' },
  ],
  accounts: [
    { to: '/accounts/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/accounts/vouchers',  label: 'All Vouchers', icon: 'bi-archive' },
  ],
};

export default function Sidebar({ role }) {
  const items = MENU[role] || [];
  return (
    <aside className="cd-sidebar">
      <div className="cd-sidebar-title">Menu</div>
      <nav className="d-flex flex-column gap-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className={({ isActive }) => `cd-nav-link ${isActive ? 'active' : ''}`}>
            <i className={`bi ${it.icon}`}></i>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}