import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile if token is in storage
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth Load Error]', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success && res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success && res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const res = await authAPI.updateProfile(userData);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.data }));
      return res.data;
    }
    throw new Error(res.message || 'Update failed');
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
