import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">Secure File Share</Link>
        <nav className="nav-links">
          {user ? (
            <>
              <div className="welcome-message">Welcome, {user.name}</div>
              <Link to="/dashboard" className="nav-link">DASHBOARD</Link>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">SIGN IN</Link>
              <Link to="/register" className="nav-link">SIGN UP</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
