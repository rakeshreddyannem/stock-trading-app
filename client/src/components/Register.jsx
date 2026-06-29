import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Register() {
  const {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    demoVerificationLink, setDemoVerificationLink,
    error, setError,
    success, setSuccess,
    loading,
    handleRegister,
    setIsRegister,
    setShowAuth
  } = useContext(GeneralContext);

  return (
    <div className="auth-card animate-fade">
      <div className="auth-header">
        <div className="auth-logo" style={{ overflow: 'hidden' }}>
          <img src="/logo.png" alt="SB Stocks Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1>Register Account</h1>
        <p>Access $10,000 cash balance instantly</p>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.
          </span>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>

      {demoVerificationLink && (
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
            <strong>[DEMO] Email Verification Link:</strong>
          </p>
          <a href={demoVerificationLink} style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all', textDecoration: 'underline' }}>
            {demoVerificationLink}
          </a>
        </div>
      )}

      <p className="auth-switch">
        Already have an account?{' '}
        <span onClick={() => { setIsRegister(false); setError(''); setSuccess(''); setDemoVerificationLink(''); }}>
          Sign In
        </span>
      </p>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <span 
          onClick={() => { setShowAuth(false); setError(''); setSuccess(''); setDemoVerificationLink(''); }} 
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
        >
          ← Back to Home Page
        </span>
      </div>
    </div>
  );
}
