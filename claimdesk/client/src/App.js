import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeVouchers from './pages/employee/EmployeeVouchers';
import VoucherForm from './pages/employee/VoucherForm';
import DirectorDashboard from './pages/director/DirectorDashboard';
import DirectorVouchers from './pages/director/DirectorVouchers';
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import AccountsVouchers from './pages/accounts/AccountsVouchers';
import VoucherDetails from './pages/shared/VoucherDetails';

import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  if (user.role === 'director') return <Navigate to="/director/dashboard" replace />;
  if (user.role === 'accounts') return <Navigate to="/accounts/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute roles={['employee']}><AppShell /></ProtectedRoute>}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/vouchers" element={<EmployeeVouchers />} />
        <Route path="/employee/vouchers/new" element={<VoucherForm mode="create" />} />
        <Route path="/employee/vouchers/:id/edit" element={<VoucherForm mode="edit" />} />
        <Route path="/employee/vouchers/:id" element={<VoucherDetails role="employee" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['director']}><AppShell /></ProtectedRoute>}>
        <Route path="/director/dashboard" element={<DirectorDashboard />} />
        <Route path="/director/vouchers" element={<DirectorVouchers />} />
        <Route path="/director/vouchers/:id" element={<VoucherDetails role="director" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['accounts']}><AppShell /></ProtectedRoute>}>
        <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
        <Route path="/accounts/vouchers" element={<AccountsVouchers />} />
        <Route path="/accounts/vouchers/:id" element={<VoucherDetails role="accounts" />} />
      </Route>

      <Route path="/" element={<RoleHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}