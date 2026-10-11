import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('interview_ai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('interview_ai_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('interview_ai_token', jwtToken);
    localStorage.setItem('interview_ai_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const signup = async (userDataInput) => {
    const res = await authApi.signup(userDataInput);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('interview_ai_token', jwtToken);
    localStorage.setItem('interview_ai_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const loginDemo = async () => {
    return await login('demo@interviewai.com', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('interview_ai_token');
    localStorage.removeItem('interview_ai_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('interview_ai_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        loginDemo,
        logout,
        updateUserProfile,
        isAuthenticated: Boolean(token && user),
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
