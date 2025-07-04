import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Remove passwordConfirm before sending to API
      const { passwordConfirm, ...registerData } = formData;
      
      await register(registerData);
      toast.success('Registration successful');
      
      // Force page reload to ensure fresh data and start the auto-refresh cycle
      // This helps ensure a clean state when user registers
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <FaUserPlus size={50} color="#1976D2" />
        </div>
        <h2 className="form-title">Sign up</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
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
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">Confirm Password *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className="form-control"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'SIGN UP'}
          </button>
        </form>
        
        <Link to="/login" className="auth-link">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
