import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cd_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cd_token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => setUser(res.user))
      .catch(() => { localStorage.removeItem('cd_token'); localStorage.removeItem('cd_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('cd_token', res.token);
    localStorage.setItem('cd_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const signup = async (payload) => {
    const res = await authApi.register(payload);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('cd_token');
    localStorage.removeItem('cd_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isRole: (r) => user?.role === r }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);