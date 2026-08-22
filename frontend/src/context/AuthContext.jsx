import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dayflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('dayflow_user', JSON.stringify(res.user));
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dayflow_token', data.token);
      localStorage.setItem('dayflow_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dayflow_token', data.token);
      localStorage.setItem('dayflow_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      console.log("BEFORE USER in AuthContext:", prev);
      console.log("NEW DATA in AuthContext:", updatedData);
      const mergedUser = {
        ...prev,
        ...updatedData,
        employee: updatedData?.employee
          ? { ...(prev?.employee || {}), ...updatedData.employee }
          : prev?.employee
      };
      console.log("AFTER MERGE User in AuthContext:", mergedUser);
      console.log("avatar_url after merge:", mergedUser?.employee?.avatar_url);
      localStorage.setItem('dayflow_user', JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
