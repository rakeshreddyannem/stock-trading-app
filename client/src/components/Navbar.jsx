import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Navbar() {
  const {
    user,
    currentPage,
    setCurrentPage,
    setShowAuth,
    setIsRegister,
    setError,
    setSuccess,
    handleLogout
  } = useContext(GeneralContext);

  const handleTabChange = (page) => {
    setCurrentPage(page);
    setError('');
    setSuccess('');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => handleTabChange(user ? 'home' : 'landing')}>
        <div className="nav-logo" style={{ overflow: 'hidden' }}>
          <img src="/logo.png" alt="SB Stocks Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span>SB Stocks</span>
      </div>

      {user ? (
        <>
          {/* Navigation Tabs */}
          <div className="dashboard-nav-tabs">
            <button 
              className={`nav-tab-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleTabChange('home')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-tab-btn ${currentPage === 'portfolio' ? 'active' : ''}`}
              onClick={() => handleTabChange('portfolio')}
            >
              My Portfolio
            </button>
            <button 
              className={`nav-tab-btn ${currentPage === 'strategy' ? 'active' : ''}`}
              onClick={() => handleTabChange('strategy')}
            >
              Strategy Lab
            </button>
            <button 
              className={`nav-tab-btn ${currentPage === 'history' ? 'active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              Ledger History
            </button>
            {user.userType === 'admin' && (
              <button 
                className={`nav-tab-btn ${['admin', 'users', 'all-orders', 'all-transactions'].includes(currentPage) ? 'active' : ''}`}
                onClick={() => handleTabChange('admin')}
                style={{ color: 'var(--accent-primary)', borderBottomColor: 'var(--accent-primary)' }}
              >
                Admin Panel
              </button>
            )}
          </div>

          <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span 
              className="user-tag" 
              style={{ cursor: 'pointer', border: currentPage === 'profile' ? '1px solid var(--accent-primary)' : 'none' }}
              onClick={() => handleTabChange('profile')}
            >
              👤 {user.username}
            </span>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </>
      ) : (
        <>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#market" onClick={() => { setShowAuth(true); setIsRegister(false); }}>Simulator</a>
            <a href="#strategy" onClick={() => { setShowAuth(true); setIsRegister(false); }}>Strategy Lab</a>
          </nav>

          <div className="landing-actions">
            <button className="landing-signin-btn" onClick={() => { setIsRegister(false); setShowAuth(true); setError(''); setSuccess(''); }}>Sign In</button>
            <button className="landing-cta-btn" onClick={() => { setIsRegister(true); setShowAuth(true); setError(''); setSuccess(''); }}>Get Started</button>
          </div>
        </>
      )}
    </nav>
  );
}
