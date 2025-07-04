import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await login(formData);
      toast.success('Login successful');
      
      // Use React Router's navigate instead of window.location for better SPA experience
      window.location.replace('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <FaLock size={50} color="#1976D2" />
        </div>
        <h2 className="form-title">Sign in</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </form>
        
        <Link to="/register" className="auth-link">
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
