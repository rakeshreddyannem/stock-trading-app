import React, { useContext, useState, useMemo } from 'react';
import { GeneralContext } from '../context/GeneralContext';

/* ─── Sector config ─── */
const SECTOR_COLOURS = {
  Tech:     { bg: 'rgba(99,102,241,0.12)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.25)'  },
  Finance:  { bg: 'rgba(16,185,129,0.10)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.22)'  },
  Retail:   { bg: 'rgba(245,158,11,0.10)',  color: '#fcd34d', border: 'rgba(245,158,11,0.22)'  },
  Auto:     { bg: 'rgba(239,68,68,0.10)',   color: '#fca5a5', border: 'rgba(239,68,68,0.22)'   },
  Energy:   { bg: 'rgba(6,182,212,0.10)',   color: '#67e8f9', border: 'rgba(6,182,212,0.22)'   },
  Health:   { bg: 'rgba(168,85,247,0.10)',  color: '#d8b4fe', border: 'rgba(168,85,247,0.22)'  },
  Media:    { bg: 'rgba(236,72,153,0.10)',  color: '#f9a8d4', border: 'rgba(236,72,153,0.22)'  },
  Payments: { bg: 'rgba(59,130,246,0.10)',  color: '#93c5fd', border: 'rgba(59,130,246,0.22)'  },
};

const TICKER_SECTOR = {
  AAPL:'Tech', MSFT:'Tech', GOOGL:'Tech', AMZN:'Retail', TSLA:'Auto',
  META:'Media', NVDA:'Tech', AMD:'Tech', INTC:'Tech', CRM:'Tech',
  NFLX:'Media', DIS:'Media', ORCL:'Tech', QCOM:'Tech', ADBE:'Tech',
  PYPL:'Payments', V:'Payments', MA:'Payments', JPM:'Finance', BAC:'Finance',
  GS:'Finance', WMT:'Retail', PG:'Retail', JNJ:'Health', UNH:'Health',
  PFE:'Health', MRNA:'Health', XOM:'Energy', CVX:'Energy', PLTR:'Tech',
  COIN:'Finance', HOOD:'Finance', LYFT:'Tech', UBER:'Tech',
};

const TICKER_DOMAINS = {
  AAPL:'apple.com', MSFT:'microsoft.com', GOOGL:'google.com', AMZN:'amazon.com', TSLA:'tesla.com',
  META:'meta.com', NVDA:'nvidia.com', AMD:'amd.com', INTC:'intel.com', CRM:'salesforce.com',
  NFLX:'netflix.com', DIS:'disney.com', ORCL:'oracle.com', QCOM:'qualcomm.com', ADBE:'adobe.com',
  PYPL:'paypal.com', V:'visa.com', MA:'mastercard.com', JPM:'jpmorganchase.com', BAC:'bankofamerica.com',
  GS:'goldmansachs.com', WMT:'walmart.com', PG:'pg.com', JNJ:'jnj.com', UNH:'unitedhealthgroup.com',
  PFE:'pfizer.com', MRNA:'modernatx.com', XOM:'exxonmobil.com', CVX:'chevron.com', PLTR:'palantir.com',
  COIN:'coinbase.com', HOOD:'robinhood.com', LYFT:'lyft.com', UBER:'uber.com'
};

/* ─── Mini sparkline ─── */
function Sparkline({ seed, isPos, width = 80, height = 32 }) {
  const pts = useMemo(() => {
    const arr = [];
    let v = 50;
    for (let i = 0; i < 18; i++) {
      const rnd = Math.sin(seed * (i + 1) * 0.7) * 12 + Math.cos(seed * i * 1.3) * 8;
      v = Math.min(90, Math.max(10, v + rnd));
      arr.push(v);
    }
    // Force endpoint direction to match isPos
    if (isPos) arr[arr.length - 1] = Math.min(90, arr[0] + Math.abs(arr[arr.length - 1] - arr[0]) + 5);
    else       arr[arr.length - 1] = Math.max(10, arr[0] - Math.abs(arr[arr.length - 1] - arr[0]) - 5);
    return arr;
  }, [seed, isPos]);

  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const fillCoords = `0,${height} ${coords} ${width},${height}`;
  const color = isPos ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg-${seed})`} points={fillCoords} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords}
      />
    </svg>
  );
}

/* ─── Company Avatar ─── */
function CompanyAvatar({ ticker }) {
  const [imgErr, setImgErr] = useState(false);
  const sector = TICKER_SECTOR[ticker] || 'Tech';
  const col    = SECTOR_COLOURS[sector] || SECTOR_COLOURS.Tech;
  const domain = TICKER_DOMAINS[ticker];

  if (domain && !imgErr) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${ticker} Logo`}
        onError={() => setImgErr(true)}
        style={{
          width: 36, height: 36,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          background: '#fff',
          objectFit: 'contain',
          padding: '2px',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div style={{
      width: 36, height: 36,
      borderRadius: 'var(--radius-sm)',
      background: col.bg,
      border: `1px solid ${col.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '12px',
      color: col.color,
      flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {ticker.slice(0, 3)}
    </div>
  );
}

/* ─── Sector pill ─── */
function SectorTag({ ticker }) {
  const sector = TICKER_SECTOR[ticker] || 'Tech';
  const col    = SECTOR_COLOURS[sector] || SECTOR_COLOURS.Tech;
  return (
    <span style={{
      padding: '2px 7px', borderRadius: '4px',
      fontSize: '9px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      background: col.bg, color: col.color, border: `1px solid ${col.border}`,
    }}>
      {sector}
    </span>
  );
}

/* ─── Column header ─── */
const COL_HEADER = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-color)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

export default function Home() {
  const {
    stocks,
    selectedStock,
    setSelectedStock,
    fetchStocksData,
    setCurrentPage,
    setError,
    setSuccess,
  } = useContext(GeneralContext);

  const [searchQuery, setSearchQuery]  = useState('');
  const [sortKey,    setSortKey]       = useState('ticker');
  const [sortDir,    setSortDir]       = useState(1); // 1=asc -1=desc

  const fmt  = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const fmtC = (v) => `$${(v / 1e9).toFixed(2)}B`;
  const fmtV = (v) => `${(v / 1e6).toFixed(1)}M`;

  /* Deterministic 1D change % from price */
  const getChange = (stock) => {
    const seed = (stock.currentPrice * 37 + stock.ticker.charCodeAt(0) * 7) % 10 - 4.5;
    return parseFloat(seed.toFixed(2));
  };

  /* Sparkline seed */
  const getSeed = (stock) =>
    stock.ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) +
    Math.floor(stock.currentPrice);

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'ticker')      return sortDir * a.ticker.localeCompare(b.ticker);
    if (sortKey === 'price')       return sortDir * (a.currentPrice - b.currentPrice);
    if (sortKey === 'change')      return sortDir * (getChange(a) - getChange(b));
    if (sortKey === 'volume')      return sortDir * (a.volume - b.volume);
    if (sortKey === 'marketCap')   return sortDir * (a.marketCap - b.marketCap);
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const SortArrow = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3, marginLeft: '3px' }}>⇅</span>;
    return <span style={{ marginLeft: '3px', color: 'var(--accent-primary)' }}>{sortDir === 1 ? '↑' : '↓'}</span>;
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Top bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Title */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '17px', letterSpacing: '-0.3px', lineHeight: 1 }}>
            Market Assets
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {sorted.length} asset{sorted.length !== 1 ? 's' : ''} · Live Prices
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', opacity: 0.45 }}>🔍</span>
          <input
            type="text"
            placeholder="Search ticker or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', width: '240px', fontSize: '13px' }}
          />
        </div>

        {/* Refresh */}
        <button
          onClick={fetchStocksData}
          style={{
            padding: '9px 16px',
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--border-color-glow)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}>
        {stocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📡</div>
            <p>Loading market data…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔎</div>
            <p>No results for <strong style={{ color: 'var(--text-primary)' }}>"{searchQuery}"</strong></p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>

              {/* ─ Column headers ─ */}
              <thead>
                <tr>
                  <th style={{ ...COL_HEADER, paddingLeft: '22px', textAlign: 'left', width: '260px' }}>Company</th>
                  <th style={{ ...COL_HEADER, textAlign: 'center', width: '96px' }}>Chart</th>
                  <th
                    style={{ ...COL_HEADER, textAlign: 'right', cursor: 'pointer' }}
                    onClick={() => toggleSort('price')}
                  >
                    Market price <SortArrow col="price" />
                  </th>
                  <th
                    style={{ ...COL_HEADER, textAlign: 'right', cursor: 'pointer' }}
                    onClick={() => toggleSort('change')}
                  >
                    1D change <SortArrow col="change" />
                  </th>
                  <th
                    style={{ ...COL_HEADER, textAlign: 'right', cursor: 'pointer' }}
                    onClick={() => toggleSort('volume')}
                  >
                    1D volume <SortArrow col="volume" />
                  </th>
                  <th
                    style={{ ...COL_HEADER, textAlign: 'right', cursor: 'pointer' }}
                    onClick={() => toggleSort('marketCap')}
                  >
                    Market cap <SortArrow col="marketCap" />
                  </th>
                  <th style={{ ...COL_HEADER, textAlign: 'center', width: '130px' }}>Action</th>
                </tr>
              </thead>

              {/* ─ Rows ─ */}
              <tbody>
                {sorted.map((stock, i) => {
                  const chg   = getChange(stock);
                  const isPos = chg >= 0;
                  const isSel = selectedStock?.ticker === stock.ticker;
                  const seed  = getSeed(stock);

                  return (
                    <tr
                      key={stock._id}
                      onClick={() => { setSelectedStock(stock); setError(''); setSuccess(''); }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isSel
                          ? 'rgba(99,102,241,0.07)'
                          : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSel
                          ? 'rgba(99,102,241,0.07)'
                          : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)';
                      }}
                    >
                      {/* ── Company ── */}
                      <td style={{ padding: '14px 14px 14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <CompanyAvatar ticker={stock.ticker} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '14px',
                              lineHeight: 1.1,
                              display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'nowrap',
                            }}>
                              {stock.companyName.length > 22 ? stock.companyName.slice(0, 22) + '…' : stock.companyName}
                              {isSel && (
                                <span style={{
                                  width: 6, height: 6,
                                  borderRadius: '50%',
                                  background: '#a5b4fc',
                                  boxShadow: '0 0 6px #a5b4fc',
                                  flexShrink: 0,
                                }} />
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {stock.ticker}
                              </span>
                              <SectorTag ticker={stock.ticker} />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ── Sparkline ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-block' }}>
                          <Sparkline seed={seed} isPos={isPos} width={80} height={30} />
                        </div>
                      </td>

                      {/* ── Market Price ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}>
                          {fmt(stock.currentPrice)}
                        </span>
                      </td>

                      {/* ── 1D Change ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '1px',
                        }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '13px',
                            color: isPos ? 'var(--accent-success)' : 'var(--accent-danger)',
                          }}>
                            {isPos ? '+' : ''}{(chg / 100 * stock.currentPrice).toFixed(2)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isPos ? 'var(--accent-success)' : 'var(--accent-danger)',
                          }}>
                            {isPos ? '+' : ''}{chg}%
                          </span>
                        </div>
                      </td>

                      {/* ── Volume ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {new Intl.NumberFormat('en-US').format(stock.volume)}
                        </span>
                      </td>

                      {/* ── Market Cap ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {fmtC(stock.marketCap)}
                        </span>
                      </td>

                      {/* ── View Chart button ── */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStock(stock);
                            setCurrentPage('chart');
                            setError(''); setSuccess('');
                          }}
                          style={{
                            padding: '7px 14px',
                            background: isSel
                              ? 'linear-gradient(135deg, var(--accent-primary), #4338ca)'
                              : 'rgba(99,102,241,0.1)',
                            border: `1px solid ${isSel ? 'transparent' : 'rgba(99,102,241,0.25)'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: isSel ? '#fff' : 'var(--accent-primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.18s',
                            boxShadow: isSel ? '0 2px 10px rgba(99,102,241,0.35)' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-primary), #4338ca)';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.35)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel) {
                              e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          📈 View Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row */}
        {sorted.length > 0 && (
          <div style={{
            padding: '10px 22px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-faint)',
          }}>
            <span>Showing {sorted.length} of {stocks.length} assets</span>
            <span>Click any row to highlight · Click <strong style={{ color: 'var(--accent-primary)' }}>View Chart</strong> to open the trading view</span>
          </div>
        )}
      </div>
    </div>
  );
}
