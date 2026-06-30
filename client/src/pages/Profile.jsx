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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="profile-page animate-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
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
              {formatCurrency(user.virtualCashBalance)}
            </strong>
          </div>
        </div>
      </div>

    </div>
  );
}
