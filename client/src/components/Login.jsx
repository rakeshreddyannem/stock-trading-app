import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Login() {
  const {
    email, setEmail,
    password, setPassword,
    mfaCode, setMfaCode,
    tempMfaToken, setTempMfaToken,
    showMfaLogin, setShowMfaLogin,
    showForgotPassword, setShowForgotPassword,
    forgotEmail, setForgotEmail,
    demoResetLink, setDemoResetLink,
    error, setError,
    success, setSuccess,
    loading,
    handleLogin,
    handleMfaLogin,
    handleForgotPassword,
    setIsRegister,
    setShowAuth
  } = useContext(GeneralContext);

  return (
    <div className="auth-card animate-fade">
      <div className="auth-header">
        <div className="auth-logo" style={{ overflow: 'hidden' }}>
          <img src="/logo.png" alt="SB Stocks Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        {showMfaLogin ? (
          <>
            <h1>2-Step Verification</h1>
            <p>Enter the 6-digit verification code from your authenticator app.</p>
          </>
        ) : showForgotPassword ? (
          <>
            <h1>Recover Password</h1>
            <p>Enter your email to receive a password reset link.</p>
          </>
        ) : (
          <>
            <h1>Sign In</h1>
            <p>Resume simulating virtual trades</p>
          </>
        )}
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      {/* MFA Challenge Login Form */}
      {showMfaLogin && (
        <form onSubmit={handleMfaLogin}>
          <div className="form-group">
            <label htmlFor="mfa-code">Authenticator 2FA Code</label>
            <input
              id="mfa-code"
              type="text"
              maxLength="6"
              pattern="\d{6}"
              className="form-input"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span 
              onClick={() => { setShowMfaLogin(false); setTempMfaToken(''); setError(''); setSuccess(''); }} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Back to Sign In
            </span>
          </div>
        </form>
      )}

      {/* Forgot Password Request Form */}
      {!showMfaLogin && showForgotPassword && (
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Request Reset Link'}
          </button>

          {demoResetLink && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                <strong>[DEMO] Simulated Reset Link:</strong>
              </p>
              <a href={demoResetLink} style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all', textDecoration: 'underline' }}>
                {demoResetLink}
              </a>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span 
              onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); setDemoResetLink(''); }} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Back to Sign In
            </span>
          </div>
        </form>
      )}

      {/* Normal Login Form */}
      {!showMfaLogin && !showForgotPassword && (
        <>
          <form onSubmit={handleLogin}>
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
              <label htmlFor="password" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <span 
                  onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }} 
                  style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                >
                  Forgot?
                </span>
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}>
              Sign Up
            </span>
          </p>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span 
              onClick={() => { setShowAuth(false); setError(''); setSuccess(''); }} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              ← Back to Home Page
            </span>
          </div>
        </>
      )}
    </div>
  );
}
