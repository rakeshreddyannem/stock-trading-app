import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Users() {
  const { allUsers, setCurrentPage } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="card animate-fade">
      <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>👥 Registered User Directory</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Accounts registered in SB Stocks Database.</p>
        </div>
        <button onClick={() => setCurrentPage('admin')} className="logout-btn" style={{ padding: '6px 12px' }}>
          ← Back to Admin
        </button>
      </div>

      {allUsers.length === 0 ? (
        <p className="holdings-empty">No users registered.</p>
      ) : (
        <div className="holdings-table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Virtual Cash Balance</th>
                <th>Verified Status</th>
                <th>MFA (2FA) Status</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((userItem, idx) => (
                <tr key={idx}>
                  <td><strong>{userItem.username}</strong></td>
                  <td>{userItem.email}</td>
                  <td>
                    <span className="badge" style={{ background: userItem.userType === 'admin' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>
                      {userItem.userType}
                    </span>
                  </td>
                  <td>{formatCurrency(userItem.virtualCashBalance)}</td>
                  <td>
                    <span className="badge" style={{ background: userItem.isVerified ? 'var(--accent-success)' : 'var(--accent-danger)', color: '#fff' }}>
                      {userItem.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: userItem.isMfaEnabled ? 'var(--accent-success)' : 'rgba(255,255,255,0.05)', color: '#fff' }}>
                      {userItem.isMfaEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
