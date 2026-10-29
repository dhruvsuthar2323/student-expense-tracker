import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages authentication state across the app.
 *
 * On mount, calls GET /api/auth/me to check if the user is already
 * authenticated (cookie-based session persistence).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True until initial auth check completes

  // Check if user is already authenticated (on page load / refresh)
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register a new user
  const register = async (fullName, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    setUser(response.data.data.user);
    return response.data;
  };

  // Log in
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.data.user);
    return response.data;
  };

  // Log out
  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  // Refresh user data (for after profile updates, etc.)
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
