import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage and verify with the server
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('pmt_token');
      const storedUser = localStorage.getItem('pmt_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const { user: freshUser } = await authService.getProfile();
          setUser(freshUser);
          localStorage.setItem('pmt_user', JSON.stringify(freshUser));
        } catch (err) {
          localStorage.removeItem('pmt_token');
          localStorage.removeItem('pmt_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('pmt_token', data.token);
    localStorage.setItem('pmt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const data = await authService.register({ name, email, password, role });
    localStorage.setItem('pmt_token', data.token);
    localStorage.setItem('pmt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    localStorage.removeItem('pmt_token');
    localStorage.removeItem('pmt_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pmt_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
