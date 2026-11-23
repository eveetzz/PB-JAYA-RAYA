import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../features/auth/api/auth.api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await authApi.me();
        if (!cancelled) setUser(res.data.data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
  };

  const login = async (email, password) => {
    await authApi.login(email, password);
    await loadUser();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
