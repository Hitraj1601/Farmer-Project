import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await authService.getProfile();
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Immediately fetch full profile (which includes buyerProfile / deliveryAddress)
    try {
      const profileRes = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      setUser(profileRes.data);
      return profileRes.data;
    } catch {
      return userData;
    }
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { user: userData, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Fetch full profile immediately on registration
    try {
      const profileRes = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      setUser(profileRes.data);
      return profileRes.data;
    } catch {
      return userData;
    }
  }, []);

  const googleLogin = useCallback(async (idToken, role) => {
    const res = await authService.googleLogin({ idToken, role });
    const { user: userData, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    try {
      const profileRes = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      setUser(profileRes.data);
      return profileRes.data;
    } catch {
      return userData;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, refreshProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
