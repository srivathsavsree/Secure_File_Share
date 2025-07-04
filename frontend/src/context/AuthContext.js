import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setAuthToken(token);
    }
    
    setLoading(false);
  }, []);

  // Set auth token for all API requests
  const setAuthToken = (token) => {
    // No need to manually set the header here since we have interceptors in api.js
    // This function is kept for compatibility
    return;
  };

  // Register new user
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      
      if (res.data.status === 'success') {
        const { token, user } = res.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthToken(token);
        setUser(user);
      }
      
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await api.post('/auth/login', userData);
      
      if (res.data.status === 'success') {
        const { token, user } = res.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthToken(token);
        setUser(user);
      }
      
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/users/profile', userData);
      
      if (res.data.status === 'success') {
        const updatedUser = res.data.data.user;
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const res = await api.put('/users/password', passwordData);
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
