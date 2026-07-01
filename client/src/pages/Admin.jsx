import React, { useContext, useMemo } from 'react';
import { GeneralContext } from '../context/GeneralContext';
import AdminStockChart from './AdminStockChart';

/* Icon components */
const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STAT_CARDS = [
  {
    key: 'users',
    label: 'Registered Users',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    accent: '#6366f1',
    accentBg: 'rgba(99,102,241,0.1)',
    link: 'users',
    sub: 'View accounts →',
  },
  {
    key: 'orders',
    label: 'Total Orders',
    icon: 'M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.1)',
    link: 'all-orders',
    sub: 'View order book →',
  },
  {
    key: 'txns',
    label: 'Ledger Entries',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.1)',
    link: 'all-transactions',
    sub: 'View transactions →',
  },
  {
    key: 'liquidity',
    label: 'System Liquidity',
    icon: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 6v6l4 2',
    accent: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.1)',
    link: null,
    sub: 'Aggregate virtual cash',
  },
];

const NAV_LINKS = [
  {
    page: 'users',
    label: 'User Accounts Directory',
    desc: 'View & manage all registered users',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    accent: '#6366f1',
  },
  {
    page: 'all-orders',
    label: 'System Order Book',
    desc: 'All buy & sell orders across the platform',
    icon: 'M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8',
    accent: '#10b981',
  },
  {
    page: 'all-transactions',
    label: 'Cash Movement Ledger',
    desc: 'Deposits, withdrawals & fund transfers',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    accent: '#f59e0b',
  },
];

export default function Admin() {
  const {
    allUsers,
    allOrders,
    allTransactions,
    setCurrentPage,
    fetchAdminData,
  } = useContext(GeneralContext);

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const totalVirtualCash = useMemo(
    () => allUsers.reduce((s, u) => s + (u.virtualCashBalance || 0), 0),
    [allUsers]
  );

  const totalTransactionVolume = useMemo(
    () => allTransactions.reduce((s, t) => s + (t.amount || 0), 0),
    [allTransactions]
  );

  const statValues = {
    users:     allUsers.length,
    orders:    allOrders.length,
    txns:      allTransactions.length,
    liquidity: fmt(totalVirtualCash),
  };

  return (
    <div className="admin-dashboard animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header Bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-color-active)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 0 32px rgba(99,102,241,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute', top: '-40px', right: '60px',
          width: '160px', height: '160px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>👑</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '22px',
              background: 'linear-gradient(135deg, #fff, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
            }}>
              Admin Control Center
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            System-wide stats, user registry, and ledger oversight
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          style={{
            padding: '9px 18px',
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--border-color-glow)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ↻ Sync Data
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {STAT_CARDS.map(({ key, label, icon, accent, accentBg, link, sub }) => (
          <div
            key={key}
            className="stat-card"
            onClick={link ? () => setCurrentPage(link) : undefined}
            style={{
              cursor: link ? 'pointer' : 'default',
              background: `linear-gradient(140deg, ${accentBg} 0%, var(--bg-card) 100%)`,
              border: `1px solid ${accent}25`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              if (link) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${accent}22`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 38, height: 38,
              borderRadius: 'var(--radius-sm)',
              background: accentBg,
              border: `1px solid ${accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Icon d={icon} size={17} color={accent} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: key === 'liquidity' ? '20px' : '30px',
              fontWeight: 900,
              color: accent,
              lineHeight: 1,
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {statValues[key]}
            </div>
            {link ? (
              <div style={{ fontSize: '11px', color: accent, fontWeight: 600, opacity: 0.8 }}>{sub}</div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Chart + Quick Nav Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Comparative chart */}
        <AdminStockChart />

        {/* Quick Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Nav links */}
          {NAV_LINKS.map(({ page, label, desc, icon, accent }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: '100%',
                padding: '16px 18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${accent}50`;
                e.currentTarget.style.background = `${accent}08`;
                e.currentTarget.style.boxShadow = `0 4px 16px ${accent}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                borderRadius: 'var(--radius-sm)',
                background: `${accent}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d={icon} size={16} color={accent} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: '16px' }}>›</span>
            </button>
          ))}

          {/* Ledger summary */}
          <div style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
              Total Cash Turnover
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 900,
              color: 'var(--accent-success)',
            }}>
              {fmt(totalTransactionVolume)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across all platform transactions
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
