import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('aditya_library_token');
    localStorage.removeItem('aditya_library_user');
    setLoading(false);
  }, []);

  const login = async (identifier, password, role) => {
    const res = await api.login(identifier, password, role);
    if (res.success && res.data) {
      localStorage.setItem('aditya_library_token', res.data.token);
      localStorage.setItem('aditya_library_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem('aditya_library_token');
    localStorage.removeItem('aditya_library_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('aditya_library_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
