import { useEffect, useState } from 'react';

const FEATURES = [
  'Role-based dashboards',
  'Digital signatures on every voucher',
  'Search, filter and sort by status',
  'Full audit trail with timestamps',
];

export default function AuthHeroPanel() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="cd-login-side">
      <div>
        <div className={`cd-hero-anim cd-hero-brand ${shown ? 'in' : ''}`} style={{ transitionDelay: '150ms' }}>
          <div className="cd-brand-mark" style={{ background: '#fff', color: '#2b3a67' }}>CD</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>ClaimDesk</span>
        </div>

        <h1 className={`cd-hero-anim cd-hero-title ${shown ? 'in' : ''}`} style={{ transitionDelay: '300ms' }}>
          Welcome to ClaimDesk
        </h1>
        <p className={`cd-hero-anim cd-hero-lead ${shown ? 'in' : ''}`} style={{ transitionDelay: '500ms' }}>
          Expense vouchers, without the paperwork.
        </p>
        <p className={`cd-hero-anim cd-hero-desc ${shown ? 'in' : ''}`} style={{ transitionDelay: '700ms' }}>
          Submit, approve and track expense reimbursements in one place. Built for employees, directors and the accounts team.
        </p>
      </div>

      <ul className="cd-hero-features">
        {FEATURES.map((f, i) => (
          <li
            key={f}
            className={`cd-hero-anim cd-hero-feat ${shown ? 'in' : ''}`}
            style={{ transitionDelay: `${900 + i * 180}ms` }}
          >
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
