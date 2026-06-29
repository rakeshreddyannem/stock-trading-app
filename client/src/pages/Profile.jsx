import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Profile() {
  const {
    user,
    loading,
    mfaCode,
    setMfaCode,
    mfaSecret,
    mfaQrCode,
    demoVerificationLink,
    handleResendVerification,
    handleSetupMfa,
    handleVerifyEnableMfa,
    handleDisableMfa
  } = useContext(GeneralContext);

  return (
    <div className="profile-page animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* Account Info Card */}
      <div className="card">
        <h2>👤 Account Profile Info</h2>
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Username</span>
            <strong style={{ fontSize: '18px' }}>{user.username}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
            <strong style={{ fontSize: '18px' }}>{user.email}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Account Type</span>
            <strong style={{ fontSize: '18px', textTransform: 'uppercase', color: user.userType === 'admin' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
              {user.userType}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Cash Balance</span>
            <strong style={{ fontSize: '18px', color: 'var(--accent-success)' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user.virtualCashBalance)}
            </strong>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!user.isVerified && (
          <div className="status-message error" style={{ color: '#ffb300', background: 'rgba(255, 179, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', padding: '16px', marginTop: '10px', border: '1px solid rgba(255, 179, 0, 0.2)' }}>
            <div>
              <strong>⚠️ Verification Required:</strong> Please verify your email to unlock trading features.
            </div>
            <button onClick={handleResendVerification} className="logout-btn" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255, 179, 0, 0.4)' }} disabled={loading}>
              Resend Verification Link
            </button>
            {demoVerificationLink && (
              <div style={{ width: '100%' }}>
                <span style={{ fontSize: '13px' }}>
                  <strong>[DEMO] Link:</strong>{' '}
                  <a href={demoVerificationLink} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                    Click here to verify
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security settings card */}
      <div className="card">
        <div className="card-title-row">
          <h2>🛡️ Two-Factor Security</h2>
        </div>

        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Protect your virtual trading account from unauthorized access by adding an extra layer of security.
          </p>

          {user.isMfaEnabled ? (
            <div>
              <div className="status-message success" style={{ display: 'inline-block', marginBottom: '16px' }}>
                ✓ Two-Factor Authentication is currently ENABLED.
              </div>
              
              <form onSubmit={handleDisableMfa} style={{ maxWidth: '400px', marginTop: '10px' }}>
                <div className="form-group">
                  <label htmlFor="disable-mfa-code" style={{ marginBottom: '8px', display: 'block' }}>Enter 2FA Code to Disable</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      id="disable-mfa-code"
                      type="text"
                      maxLength="6"
                      pattern="\d{6}"
                      className="form-input"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="123456"
                      required
                    />
                    <button type="submit" className="logout-btn" style={{ whiteSpace: 'nowrap' }} disabled={loading}>
                      Disable 2FA
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="status-message error" style={{ display: 'inline-block', marginBottom: '16px', color: '#ffb300', background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.2)' }}>
                ⚠️ Two-Factor Authentication is currently DISABLED.
              </div>

              {!mfaQrCode ? (
                <div style={{ marginTop: '10px' }}>
                  <button onClick={handleSetupMfa} className="portfolio-btn">
                    Setup Two-Factor Authentication
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                    <strong>Step 1:</strong> Scan the QR code below using your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
                      <img src={mfaQrCode} alt="MFA QR Code" style={{ display: 'block', width: '180px', height: '180px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Or manually enter this secret key:
                      </p>
                      <code style={{ display: 'block', padding: '10px', background: 'var(--bg-primary)', borderRadius: '4px', margin: '8px 0', fontSize: '14px', letterSpacing: '1px', fontWeight: 'bold', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                        {mfaSecret}
                      </code>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                    <strong>Step 2:</strong> Verify your setup by typing the 6-digit verification code generated in your app:
                  </p>
                  <form onSubmit={handleVerifyEnableMfa} style={{ maxWidth: '400px' }}>
                    <div className="form-group">
                      <label htmlFor="verify-mfa-code" style={{ marginBottom: '8px', display: 'block' }}>Verification Code</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          id="verify-mfa-code"
                          type="text"
                          maxLength="6"
                          pattern="\d{6}"
                          className="form-input"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="123456"
                          required
                        />
                        <button type="submit" className="portfolio-btn" style={{ whiteSpace: 'nowrap' }} disabled={loading}>
                          Verify & Enable
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
