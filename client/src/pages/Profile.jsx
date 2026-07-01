import React, { useContext, useState, useMemo } from 'react';
import { GeneralContext } from '../context/GeneralContext';

/* ─── Tiny SVG Icon ─── */
const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/* ─── Info Row ─── */
const InfoRow = ({ label, value, accent }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 0',
    borderBottom: '1px solid var(--border-subtle)',
  }}>
    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontWeight: 700, fontSize: '14px', color: accent || 'var(--text-primary)' }}>{value}</span>
  </div>
);

/* ─── Section Card ─── */
const Section = ({ title, icon, children, accentColor = 'var(--accent-primary)' }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
  }}>
    {/* Card header */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 20px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        width: 32, height: 32,
        borderRadius: 'var(--radius-sm)',
        background: `${accentColor}18`,
        border: `1px solid ${accentColor}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={icon} size={15} color={accentColor} />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '15px',
        color: 'var(--text-primary)',
      }}>{title}</h3>
    </div>
    <div style={{ padding: '6px 20px 16px' }}>{children}</div>
  </div>
);

/* ─── Stat Chip ─── */
const StatChip = ({ label, value, color, bg }) => (
  <div style={{
    padding: '14px 16px',
    background: bg,
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    flex: 1,
    minWidth: 0,
  }}>
    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>
      {label}
    </div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '18px',
      color,
      lineHeight: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}>
      {value}
    </div>
  </div>
);

/* ─── Avatar initials ─── */
const Avatar = ({ username, size = 72 }) => {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '?';
  const hue = username
    ? (username.charCodeAt(0) * 37 + username.charCodeAt(1) * 13) % 360
    : 200;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `conic-gradient(from 135deg, hsl(${hue},70%,40%), hsl(${(hue + 60) % 360},80%,55%))`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: size * 0.35,
      color: '#fff',
      letterSpacing: '-1px',
      flexShrink: 0,
      boxShadow: `0 0 28px hsl(${hue},70%,40%)40`,
      border: '3px solid rgba(255,255,255,0.1)',
    }}>
      {initials}
    </div>
  );
};

/* ════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════ */
export default function Profile() {
  const {
    user,
    loading,
    error,
    success,
    setError,
    setSuccess,
    demoVerificationLink,
    handleResendVerification,
    portfolios,
    orders,
    transactions,
    portfolioHoldingsValue,
    totalPortfolioValue,
    setCurrentPage,
    handleChangePassword,
  } = useContext(GeneralContext);

  const [activeTab, setActiveTab] = useState('overview');   // 'overview' | 'security' | 'activity'
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currPwd || !newPwd) return;
    const ok = await handleChangePassword(currPwd, newPwd);
    if (ok) {
      setCurrPwd('');
      setNewPwd('');
    }
  };

  const fmt = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const fmtCompact = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  /* Activity stats */
  const buyOrders  = useMemo(() => orders.filter(o => o.orderType === 'BUY').length,  [orders]);
  const sellOrders = useMemo(() => orders.filter(o => o.orderType === 'SELL').length, [orders]);
  const totalTxVolume = useMemo(
    () => transactions.reduce((s, t) => s + (t.amount || 0), 0),
    [transactions]
  );

  /* Total holdings count across all portfolios */
  const totalHoldings = useMemo(
    () => portfolios.reduce((s, p) => s + (p.holdings?.length || 0), 0),
    [portfolios]
  );

  const accountAgeDays = useMemo(() => {
    if (!user?.createdAt) return null;
    const diff = Date.now() - new Date(user.createdAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [user]);

  if (!user) return null;

  const TABS = [
    { key: 'overview', label: 'Overview',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'activity', label: 'Activity',  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'security', label: 'Security',  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  return (
    <div className="animate-fade" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-color-active)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(99,102,241,0.08)',
      }}>
        {/* Decorative blob */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-20px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Avatar username={user.username} size={80} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '24px',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #fff, #c7d2fe)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user.username}
            </h1>
            {/* Role badge */}
            <span style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: user.userType === 'admin'
                ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(67,56,202,0.2))'
                : 'rgba(16,185,129,0.15)',
              color: user.userType === 'admin' ? '#a5b4fc' : 'var(--accent-success)',
              border: `1px solid ${user.userType === 'admin' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.25)'}`,
            }}>
              {user.userType === 'admin' ? '👑 Admin' : '● Member'}
            </span>
            {/* Verified badge */}
            {user.isVerified && (
              <span style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '10px',
                fontWeight: 700,
                background: 'rgba(6,182,212,0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6,182,212,0.2)',
              }}>
                ✓ Verified
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</p>
          {accountAgeDays !== null && (
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>
              Member for {accountAgeDays} day{accountAgeDays !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Quick cash display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Available Cash
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '26px',
            color: 'var(--accent-success)',
            lineHeight: 1,
          }}>
            {fmtCompact(user.virtualCashBalance)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Net Worth: <strong style={{ color: '#a5b4fc' }}>{fmtCompact(totalPortfolioValue)}</strong>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="status-message error">⚠ {error}</div>
      )}
      {success && (
        <div className="status-message success">✓ {success}</div>
      )}

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '5px',
      }}>
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '9px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'all 0.18s',
              background: activeTab === key ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === key ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Icon d={icon} size={14} color="currentColor" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: OVERVIEW
          ══════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Account Details */}
          <Section
            title="Account Details"
            icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            accentColor="var(--accent-primary)"
          >
            <InfoRow label="Username"      value={user.username} />
            <InfoRow label="Email"         value={user.email} />
            <InfoRow
              label="Account Role"
              value={user.userType === 'admin' ? '👑 Administrator' : '● Standard Member'}
              accent={user.userType === 'admin' ? '#a5b4fc' : 'var(--text-primary)'}
            />
            <InfoRow
              label="Email Verified"
              value={user.isVerified ? '✓ Verified' : '✗ Unverified'}
              accent={user.isVerified ? 'var(--accent-success)' : 'var(--accent-danger)'}
            />

            {/* Resend verification */}
            {!user.isVerified && (
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(6,182,212,0.1)',
                    border: '1px solid rgba(6,182,212,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ✉ Resend Verification Email
                </button>
                {demoVerificationLink && (
                  <a
                    href={demoVerificationLink}
                    style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: 'var(--accent-primary)', wordBreak: 'break-all', textDecoration: 'underline' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Demo: Click to verify →
                  </a>
                )}
              </div>
            )}
          </Section>

          {/* Financial Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Section
              title="Financial Summary"
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              accentColor="var(--accent-success)"
            >
              <InfoRow label="Cash Balance"    value={fmt(user.virtualCashBalance)}  accent="var(--accent-success)" />
              <InfoRow label="Holdings Value"  value={fmt(portfolioHoldingsValue)}   accent="var(--accent-primary)" />
              <InfoRow label="Total Net Worth" value={fmt(totalPortfolioValue)}       accent="#a5b4fc" />
              <InfoRow label="Portfolios"      value={portfolios.length} />
              <InfoRow label="Stock Holdings"  value={`${totalHoldings} position${totalHoldings !== 1 ? 's' : ''}`} />
            </Section>

            {/* Quick Actions */}
            <Section
              title="Quick Actions"
              icon="M13 10V3L4 14h7v7l9-11h-7z"
              accentColor="var(--accent-amber)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                {[
                  { label: 'Add / Withdraw Funds',    page: 'funds',     icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'var(--accent-success)' },
                  { label: 'Manage Portfolios',       page: 'portfolio', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', accent: 'var(--accent-primary)' },
                  { label: 'View Order History',      page: 'history',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', accent: 'var(--accent-amber)' },
                  { label: 'Open Stock Chart',        page: 'chart',     icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', accent: 'var(--accent-cyan)' },
                ].map(({ label, page, icon, accent }) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.18s, background 0.18s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${accent}50`;
                      e.currentTarget.style.background = `${accent}0d`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.background = '';
                    }}
                  >
                    <Icon d={icon} size={15} color={accent} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: '16px' }}>›</span>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Portfolios list – full width */}
          {portfolios.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Section
                title="Your Portfolios"
                icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                accentColor="var(--accent-primary)"
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', paddingTop: '6px' }}>
                  {portfolios.map((p, i) => {
                    const holdingsCount = p.holdings?.length || 0;
                    const hue = (i * 72) % 360;
                    return (
                      <div
                        key={p._id}
                        onClick={() => setCurrentPage('portfolio')}
                        style={{
                          padding: '16px',
                          background: `hsl(${hue},60%,18%)22`,
                          border: `1px solid hsl(${hue},60%,40%)28`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'transform 0.18s, box-shadow 0.18s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 6px 20px hsl(${hue},60%,40%)20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <div style={{
                            width: 36, height: 36,
                            borderRadius: 'var(--radius-sm)',
                            background: `hsl(${hue},65%,45%)25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 900,
                            fontSize: '16px',
                            color: `hsl(${hue},70%,65%)`,
                          }}>
                            {(p.portfolioName || 'P')[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.portfolioName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {holdingsCount} holding{holdingsCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        {holdingsCount > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {p.holdings.slice(0, 5).map(h => (
                              <span key={h.ticker} style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-xs)',
                                background: `hsl(${hue},60%,40%)20`,
                                color: `hsl(${hue},70%,65%)`,
                              }}>
                                {h.ticker}
                              </span>
                            ))}
                            {holdingsCount > 5 && (
                              <span style={{ fontSize: '10px', color: 'var(--text-faint)', padding: '2px 4px' }}>+{holdingsCount - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: ACTIVITY
          ══════════════════════════════════════ */}
      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Stat chips row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatChip label="Total Orders"       value={orders.length}        color="var(--accent-primary)"  bg="var(--accent-primary-subtle)" />
            <StatChip label="Buy Orders"          value={buyOrders}            color="var(--accent-success)"  bg="var(--accent-success-subtle)" />
            <StatChip label="Sell Orders"         value={sellOrders}           color="var(--accent-danger)"   bg="var(--accent-danger-subtle)"  />
            <StatChip label="Transactions"        value={transactions.length}  color="var(--accent-amber)"    bg="var(--accent-amber-subtle)"   />
            <StatChip label="Cash Turnover"       value={fmtCompact(totalTxVolume)} color="var(--accent-cyan)" bg="var(--accent-cyan-subtle)"  />
          </div>

          {/* Recent Orders */}
          <Section
            title="Recent Orders"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            accentColor="var(--accent-primary)"
          >
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                No orders yet. Start trading from the Stock Chart tab.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', paddingTop: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['Ticker', 'Type', 'Qty', 'Price', 'Total', 'Portfolio'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 15).map((o, i) => (
                      <tr
                        key={o._id || i}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{o.ticker}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: o.orderType === 'BUY' ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
                            color: o.orderType === 'BUY' ? 'var(--accent-success)' : 'var(--accent-danger)',
                            border: `1px solid ${o.orderType === 'BUY' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            {o.orderType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{o.count}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{o.price ? `$${o.price.toFixed(2)}` : '—'}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>
                          {o.price && o.count ? fmt(o.price * o.count) : '—'}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {o.portfolioId?.portfolioName || o.portfolioId || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length > 15 && (
                  <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Showing 15 of {orders.length} orders.{' '}
                    <span
                      style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setCurrentPage('history')}
                    >
                      View all →
                    </span>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Recent Transactions */}
          <Section
            title="Recent Transactions"
            icon="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            accentColor="var(--accent-amber)"
          >
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>💸</div>
                No fund transactions yet. Use the Funds tab to deposit or withdraw.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', paddingTop: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['Type', 'Amount', 'Mode', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((t, i) => (
                      <tr
                        key={t._id || i}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: t.transactionType === 'deposit' ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
                            color: t.transactionType === 'deposit' ? 'var(--accent-success)' : 'var(--accent-danger)',
                          }}>
                            {t.transactionType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{fmt(t.amount || 0)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>{t.paymentMode || '—'}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length > 10 && (
                  <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Showing 10 of {transactions.length} transactions.{' '}
                    <span
                      style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setCurrentPage('history')}
                    >
                      View all →
                    </span>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: SECURITY
          ══════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Security Score */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* Score ring */}
            {(() => {
              const score = user.isVerified ? 100 : 0;
              const color = score === 100 ? 'var(--accent-success)' : 'var(--accent-danger)';
              const label = score === 100 ? 'Strong' : 'Weak';
              return (
                <>
                  <div style={{
                    width: 72, height: 72, flexShrink: 0,
                    borderRadius: '50%',
                    background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 20px ${color}30`,
                  }}>
                    <div style={{
                      width: 54, height: 54,
                      borderRadius: '50%',
                      background: 'var(--bg-secondary)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '16px', color, lineHeight: 1 }}>{score}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color, marginBottom: '4px' }}>
                      Security Status: {label}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {score < 100
                        ? 'Please verify your email address to secure your account.'
                        : 'Your account is verified. Great job!'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Email Verification */}
          <Section
            title="Email Verification"
            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            accentColor="var(--accent-cyan)"
          >
            <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: user.isVerified ? 'var(--accent-success)' : 'var(--accent-danger)',
                  boxShadow: `0 0 8px ${user.isVerified ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                }} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Email <strong style={{ color: user.isVerified ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </strong>
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {user.isVerified
                  ? `Your email address (${user.email}) is verified and in good standing.`
                  : `Please verify your email (${user.email}) to unlock full platform features.`}
              </p>
              {!user.isVerified && (
                <div>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(6,182,212,0.12)',
                      border: '1px solid rgba(6,182,212,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-cyan)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    ✉ Resend Verification Email
                  </button>
                  {demoVerificationLink && (
                    <a
                      href={demoVerificationLink}
                      style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: 'var(--accent-primary)', wordBreak: 'break-all' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo: Click to verify →
                    </a>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Update Password Section */}
          <Section
            title="Update Password"
            icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            accentColor="var(--accent-primary)"
          >
            <form onSubmit={onPasswordSubmit} style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currPwd}
                  onChange={(e) => setCurrPwd(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                  Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 20px',
                  background: 'linear-gradient(135deg, var(--accent-primary), #4338ca)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Section>
        </div>
      )}
    </div>
  );
}
