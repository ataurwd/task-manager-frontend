'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, getToken, removeToken, setToken } from '../lib/api';

interface AuthContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  authLoading: true,
  login: () => {},
  logout: () => {},
  checkAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setAuthLoading(true);
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const res = await api.auth.getMe();
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        removeToken();
        setCurrentUser(null);
      }
    } catch {
      removeToken();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (token: string, user: User) => {
    setToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    removeToken();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
