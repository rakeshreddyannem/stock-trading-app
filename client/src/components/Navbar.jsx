import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

const TABS = [
  { key: 'home',     label: 'Dashboard',     icon: '⊞' },
  { key: 'portfolio', label: 'Portfolio',    icon: '◈' },
  { key: 'funds',    label: 'Funds',         icon: '◎' },
  { key: 'chart',    label: 'Stock Chart',   icon: '↗' },
  { key: 'strategy', label: 'Strategy Lab',  icon: '⚗' },
  { key: 'history',  label: 'Ledger',        icon: '≡' },
];

export default function Navbar() {
  const {
    user,
    currentPage,
    setCurrentPage,
    setShowAuth,
    setIsRegister,
    setError,
    setSuccess,
    handleLogout,
  } = useContext(GeneralContext);

  const go = (page) => {
    setCurrentPage(page);
    setError('');
    setSuccess('');
  };

  const isAdminActive = ['admin', 'users', 'all-orders', 'all-transactions'].includes(currentPage);

  return (
    <nav className="navbar">
      {/* Brand */}
      <div
        className="nav-brand"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => go(user ? 'home' : 'landing')}
      >
        <div className="nav-logo" style={{ overflow: 'hidden' }}>
          <img
            src="/logo.png"
            alt="SB Stocks"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '-0.3px',
          background: 'linear-gradient(135deg, #fff 40%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SB Stocks
        </span>
      </div>

      {user ? (
        <>
          {/* Pill-style tab bar */}
          <div className="dashboard-nav-tabs">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`nav-tab-btn ${currentPage === key ? 'active' : ''}`}
                onClick={() => go(key)}
                title={label}
              >
                <span style={{ marginRight: '5px', opacity: 0.7, fontSize: '11px' }}>{icon}</span>
                {label}
              </button>
            ))}

            {/* Admin tab – only shown for admin users */}
            {user.userType === 'admin' && (
              <button
                className={`nav-tab-btn ${isAdminActive ? 'active' : ''}`}
                onClick={() => go('admin')}
                style={{
                  color: isAdminActive ? 'var(--accent-primary)' : 'var(--accent-primary)',
                  opacity: isAdminActive ? 1 : 0.7,
                }}
              >
                <span style={{ marginRight: '5px', fontSize: '11px' }}>👑</span>
                Admin
              </button>
            )}
          </div>

          {/* Right side – user tag + logout */}
          <div className="nav-user">
            <button
              className="user-tag"
              style={{
                cursor: 'pointer',
                border: currentPage === 'profile'
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
              }}
              onClick={() => go('profile')}
              title="View profile"
            >
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username}
              </span>
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <>
          <nav className="landing-nav">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowAuth(false);
                go('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => { setShowAuth(false); go('landing'); }}
            >
              About
            </a>
          </nav>

          <div className="landing-actions">
            <button
              className="landing-signin-btn"
              onClick={() => { setIsRegister(false); setShowAuth(true); setError(''); setSuccess(''); }}
            >
              Sign In
            </button>
            <button
              className="landing-cta-btn"
              onClick={() => { setIsRegister(true); setShowAuth(true); setError(''); setSuccess(''); }}
            >
              Join Now
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
