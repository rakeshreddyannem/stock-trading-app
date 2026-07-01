import React, { useContext, useState, useEffect } from 'react';
import { GeneralContext } from '../context/GeneralContext';
import Chart from 'react-apexcharts';

export default function StockChart() {
  const {
    user,
    stocks,
    selectedStock,
    setSelectedStock,
    tradeType,
    setTradeType,
    quantity,
    setQuantity,
    activePortfolio,
    tradingLoading,
    handleTradeSubmit,
    setError,
    setSuccess,
  } = useContext(GeneralContext);

  const [productType, setProductType] = useState('Intraday');
  const [candles, setCandles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  /* Generate mock candlestick data */
  useEffect(() => {
    if (!selectedStock) return;
    const base  = selectedStock.currentPrice;
    const count = 60;
    const data  = [];
    let cur  = base * 1.02;
    let time = new Date();
    time.setHours(9, 30, 0, 0);

    for (let i = 0; i < count; i++) {
      const dir      = i < count / 2 ? -0.0015 : 0.001;
      const variance = (Math.random() - 0.5) * base * 0.004;
      const open     = cur;
      const close    = i === count - 1 ? base : cur + base * dir + variance;
      const high     = Math.max(open, close) + Math.random() * base * 0.002;
      const low      = Math.min(open, close) - Math.random() * base * 0.002;

      data.push({
        x: new Date(time.getTime()),
        y: [
          parseFloat(open.toFixed(2)),
          parseFloat(high.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(close.toFixed(2)),
        ],
      });
      cur = close;
      time.setTime(time.getTime() + 5 * 60 * 1000);
    }
    setCandles(data);
  }, [selectedStock]);

  const fmt  = (v) => (typeof v === 'number' ? v.toFixed(2) : '0.00');
  const fmt5 = (v) => (typeof v === 'number' ? v.toFixed(5) : '0.00000');

  const getHeld = (ticker) => {
    if (!activePortfolio) return 0;
    const h = activePortfolio.holdings.find((h) => h.ticker === ticker);
    return h ? h.quantity : 0;
  };

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 420,
      background: 'transparent',
      toolbar: { show: true, autoSelected: 'zoom' },
      foreColor: '#9ca3af',
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true, speed: 400 },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'HH:mm',
        style: { colors: '#6b7280', fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (v) => `$${v.toFixed(2)}`,
        style: { colors: '#6b7280', fontSize: '11px' },
      },
      opposite: true,
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.04)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10b981', downward: '#ef4444' },
        wick: { useFillColor: true },
      },
    },
    tooltip: { theme: 'dark' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade">

      {/* ── Search Bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Select Asset
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by ticker or company name…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '14px' }}
            />
          </div>

          {/* Dropdown */}
          {showDropdown && searchQuery && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              zIndex: 50,
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No results</div>
              ) : filtered.map((s) => (
                <div
                  key={s._id}
                  onMouseDown={() => {
                    setSelectedStock(s);
                    setSearchQuery(`${s.ticker} – ${s.companyName}`);
                    setShowDropdown(false);
                    setError(''); setSuccess('');
                  }}
                  style={{
                    padding: '11px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <strong style={{ color: 'var(--accent-primary)', marginRight: '8px' }}>{s.ticker}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.companyName}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${s.currentPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected pill */}
        {selectedStock && (
          <div style={{
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--border-color-active)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            minWidth: '200px',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Selected</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px' }}>
              {selectedStock.ticker}
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#a5b4fc', marginLeft: '8px' }}>${selectedStock.currentPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Grid: Chart + Trade Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'stretch' }}>

        {/* Candlestick Chart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          {selectedStock ? (
            <>
              {/* Chart header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
                    {selectedStock.ticker}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px', letterSpacing: 0 }}>NASDAQ</span>
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>{selectedStock.companyName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: '#a5b4fc', lineHeight: 1 }}>
                    ${fmt(selectedStock.currentPrice)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    MCap: ${(selectedStock.marketCap / 1e9).toFixed(1)}B · Vol: {(selectedStock.volume / 1e6).toFixed(1)}M
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ marginTop: '8px' }}>
                {candles.length > 0 && (
                  <Chart
                    options={chartOptions}
                    series={[{ name: 'Price', data: candles }]}
                    type="candlestick"
                    height={420}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ height: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>No Asset Selected</p>
              <p style={{ fontSize: '13px' }}>Search and select a stock above to view the chart.</p>
            </div>
          )}
        </div>

        {/* Trade Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(12px)',
        }}>
          {selectedStock ? (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', marginBottom: '20px' }}>Place Order</h3>

              {/* Buy / Sell Toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '4px', gap: '4px', marginBottom: '22px', border: '1px solid var(--border-color)' }}>
                {['BUY', 'SELL'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTradeType(t)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.18s',
                      background:
                        tradeType === t
                          ? t === 'BUY'
                            ? 'var(--accent-success)'
                            : 'var(--accent-danger)'
                          : 'transparent',
                      color:
                        tradeType === t
                          ? '#fff'
                          : 'var(--text-muted)',
                      boxShadow:
                        tradeType === t
                          ? t === 'BUY'
                            ? '0 2px 10px rgba(16,185,129,0.3)'
                            : '0 2px 10px rgba(239,68,68,0.3)'
                          : 'none',
                    }}
                  >
                    {t === 'BUY' ? '▲ Buy' : '▼ Sell'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleTradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {/* Product type */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>Product Type</label>
                  <select
                    className="form-input"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>Market Price</label>
                  <div style={{
                    padding: '11px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: tradeType === 'BUY' ? 'var(--accent-success)' : 'var(--accent-danger)',
                  }}>
                    ${fmt5(selectedStock.currentPrice)}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="qty-input" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>Quantity</label>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    style={{ width: '100%' }}
                  />
                  {tradeType === 'SELL' && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      You hold: <strong style={{ color: 'var(--text-secondary)' }}>{getHeld(selectedStock.ticker)}</strong> shares
                    </p>
                  )}
                </div>

                {/* Total */}
                <div style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>Estimated Total</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: 'var(--accent-primary)' }}>
                    ${fmt5(selectedStock.currentPrice * quantity)}
                  </div>
                </div>

                {/* Cash balance */}
                {tradeType === 'BUY' && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Available</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>${(user?.virtualCashBalance || 0).toFixed(2)}</strong>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    tradingLoading ||
                    !activePortfolio ||
                    (tradeType === 'BUY' && (user?.virtualCashBalance || 0) < selectedStock.currentPrice * quantity) ||
                    (tradeType === 'SELL' && getHeld(selectedStock.ticker) < quantity)
                  }
                  style={{
                    padding: '13px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    border: 'none',
                    color: '#fff',
                    background: tradeType === 'BUY'
                      ? 'linear-gradient(135deg, var(--accent-success), var(--accent-success-hover))'
                      : 'linear-gradient(135deg, var(--accent-danger), var(--accent-danger-hover))',
                    boxShadow: tradeType === 'BUY'
                      ? '0 4px 16px var(--accent-success-glow)'
                      : '0 4px 16px var(--accent-danger-glow)',
                    marginTop: 'auto',
                  }}
                >
                  {tradingLoading ? 'Executing…' : `${tradeType === 'BUY' ? '▲ Buy' : '▼ Sell'} ${quantity} share${quantity !== 1 ? 's' : ''}`}
                </button>

                {/* Warnings */}
                {!activePortfolio && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>
                    Create a portfolio in the <strong>My Portfolio</strong> tab to trade.
                  </p>
                )}
                {activePortfolio && tradeType === 'BUY' && (user?.virtualCashBalance || 0) < selectedStock.currentPrice * quantity && (
                  <p style={{ fontSize: '12px', color: 'var(--accent-danger)', textAlign: 'center', marginTop: '4px' }}>
                    Insufficient cash balance.
                  </p>
                )}
                {activePortfolio && tradeType === 'SELL' && getHeld(selectedStock.ticker) < quantity && (
                  <p style={{ fontSize: '12px', color: 'var(--accent-danger)', textAlign: 'center', marginTop: '4px' }}>
                    Not enough shares to sell.
                  </p>
                )}
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛒</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Order Panel</p>
              <p style={{ fontSize: '13px', lineHeight: 1.6 }}>Select an asset above to unlock buy & sell controls.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
