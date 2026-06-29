import React, { useContext, useMemo } from 'react';
import { GeneralContext } from '../context/GeneralContext';
import AdminStockChart from './AdminStockChart';

export default function Admin() {
  const {
    allUsers,
    allOrders,
    allTransactions,
    setCurrentPage,
    fetchAdminData
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const totalVirtualCash = useMemo(() => {
    return allUsers.reduce((sum, u) => sum + (u.virtualCashBalance || 0), 0);
  }, [allUsers]);

  const totalTransactionVolume = useMemo(() => {
    return allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [allTransactions]);

  return (
    <div className="admin-dashboard animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Admin Action Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>👑 Control Center (Admin Console)</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System administration stats, user registries, and ledger logs.</p>
        </div>
        <button className="logout-btn" onClick={fetchAdminData} style={{ padding: '8px 16px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
          🔄 Sync Global Logs
        </button>
      </div>

      {/* Aggregate stats grid */}
      <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('users')}>
          <span className="label">Registered Users</span>
          <span className="value">{allUsers.length}</span>
          <span className="subtitle" style={{ textDecoration: 'underline' }}>Manage accounts →</span>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('all-orders')}>
          <span className="label">Global Order Book</span>
          <span className="value">{allOrders.length}</span>
          <span className="subtitle" style={{ textDecoration: 'underline' }}>View orders log →</span>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('all-transactions')}>
          <span className="label">Total Ledger Entries</span>
          <span className="value">{allTransactions.length}</span>
          <span className="subtitle" style={{ textDecoration: 'underline' }}>View transactions →</span>
        </div>
        <div className="stat-card">
          <span className="label">System Liquidity</span>
          <span className="value" style={{ color: 'var(--accent-success)' }}>{formatCurrency(totalVirtualCash)}</span>
          <span className="subtitle">Aggregate virtual cash</span>
        </div>
      </div>

      {/* Analytics chart and quick links row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* comparative chart */}
        <AdminStockChart />

        {/* Shortcuts card */}
        <div className="card">
          <h2>Quick Navigation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setCurrentPage('users')}
              className="portfolio-btn"
              style={{ width: '100%', padding: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'left' }}
            >
              👥 User Accounts Directory
            </button>
            <button
              onClick={() => setCurrentPage('all-orders')}
              className="portfolio-btn"
              style={{ width: '100%', padding: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'left' }}
            >
              📜 System Transaction Order Book
            </button>
            <button
              onClick={() => setCurrentPage('all-transactions')}
              className="portfolio-btn"
              style={{ width: '100%', padding: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'left' }}
            >
              💸 Cash Movement Ledger Logs
            </button>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Ledger Valuation:</strong> Total system cash turnover is <strong>{formatCurrency(totalTransactionVolume)}</strong>.
          </div>
        </div>
      </div>

    </div>
  );
}
