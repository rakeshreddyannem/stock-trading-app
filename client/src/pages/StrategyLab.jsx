import React, { useContext, useState, useEffect } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function StrategyLab() {
  const {
    stocks,
    selectedStock,
    setSelectedStock,
    strategyType,
    setStrategyType,
    dcaAmount,
    setDcaAmount,
    dcaInterval,
    setDcaInterval,
    bracketProfit,
    setBracketProfit,
    bracketLoss,
    setBracketLoss,
    bracketAmount,
    setBracketAmount,
    simulationResult,
    setSimulationResult,
    simulating,
    setSimulating,
    setError,
    setSuccess
  } = useContext(GeneralContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const filteredStocks = stocks.filter(stock => 
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // DCA / Bracket Backtester Simulator logic
  const runStrategySimulation = (e) => {
    e.preventDefault();
    if (!selectedStock) return;
    
    setSimulating(true);
    setSimulationResult(null);

    const currentPrice = selectedStock.currentPrice;
    const prices = [currentPrice];
    const steps = 90;
    let price = currentPrice;
    
    const dailyVolatility = 0.02;
    const drift = 0.0008;
    
    for (let i = 1; i <= steps; i++) {
      const changePercent = (Math.random() - 0.48) * dailyVolatility + drift;
      price = price * (1 + changePercent);
      prices.push(price);
    }

    setTimeout(() => {
      if (strategyType === 'DCA') {
        const intervalDays = dcaInterval === 'weekly' ? 7 : 30;
        const totalPeriods = Math.floor(steps / intervalDays);
        const periodAmount = dcaAmount;
        const totalInvested = totalPeriods * periodAmount;
        
        let totalShares = 0;
        const purchaseLog = [];

        for (let period = 1; period <= totalPeriods; period++) {
          const dayIndex = period * intervalDays;
          const purchasePrice = prices[dayIndex];
          const sharesBought = periodAmount / purchasePrice;
          totalShares += sharesBought;
          purchaseLog.push({
            period,
            day: dayIndex,
            price: purchasePrice,
            shares: sharesBought,
            value: totalShares * purchasePrice
          });
        }

        const finalPrice = prices[steps];
        const finalValue = totalShares * finalPrice;
        const profitLoss = finalValue - totalInvested;
        const profitLossPercent = (profitLoss / totalInvested) * 100;

        setSimulationResult({
          type: 'DCA',
          stock: selectedStock.ticker,
          totalInvested,
          finalValue,
          profitLoss,
          profitLossPercent,
          avgPurchasePrice: totalInvested / totalShares,
          totalShares,
          prices,
          purchaseLog
        });
      } else {
        let triggerDay = -1;
        let triggerType = '';
        let triggerPrice = 0;
        const upperLimit = currentPrice * (1 + bracketProfit / 100);
        const lowerLimit = currentPrice * (1 - bracketLoss / 100);

        for (let day = 0; day < prices.length; day++) {
          const dayPrice = prices[day];
          if (dayPrice >= upperLimit) {
            triggerDay = day;
            triggerType = 'TAKE_PROFIT';
            triggerPrice = dayPrice;
            break;
          } else if (dayPrice <= lowerLimit) {
            triggerDay = day;
            triggerType = 'STOP_LOSS';
            triggerPrice = dayPrice;
            break;
          }
        }

        if (triggerDay === -1) {
          triggerDay = steps;
          triggerType = 'HOLDING_EXPIRED';
          triggerPrice = prices[steps];
        }

        const profitLossPercent = ((triggerPrice - currentPrice) / currentPrice) * 100;
        const returnAmount = bracketAmount * (1 + profitLossPercent / 100);
        const profitLossAmount = returnAmount - bracketAmount;

        setSimulationResult({
          type: 'BRACKET',
          stock: selectedStock.ticker,
          initialPrice: currentPrice,
          triggerDay,
          triggerType,
          triggerPrice,
          profitLossPercent,
          profitLossAmount,
          finalValue: returnAmount,
          totalInvested: bracketAmount,
          prices: prices.slice(0, triggerDay + 1)
        });
      }
      setSimulating(false);
    }, 800);
  };

  const generateSvgPoints = (data, width = 500, height = 150) => {
    if (data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-color-active)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 0 28px rgba(99,102,241,0.06)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>⚗️</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '20px',
              background: 'linear-gradient(135deg, #fff, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Strategy Backtesting Lab
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Simulate DCA or Bracket Order models against 90-day mock market data.
          </p>
        </div>
        {selectedStock && (
          <div style={{
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--border-color-active)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Active Target</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: '#a5b4fc' }}>
              {selectedStock.ticker} · ${selectedStock.currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* ── Search Row ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
      }}>
        <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          Select Asset to Backtest
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '13px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by ticker or company name…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="form-input"
            style={{ paddingLeft: '36px', fontSize: '14px', width: '100%' }}
          />
          {showSearchDropdown && searchQuery && (
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
              {filteredStocks.length === 0 ? (
                <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No results</div>
              ) : filteredStocks.map((s) => (
                <div
                  key={s._id}
                  onMouseDown={() => {
                    setSelectedStock(s);
                    setSearchQuery(`${s.ticker} – ${s.companyName}`);
                    setShowSearchDropdown(false);
                    setSimulationResult(null);
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
      </div>

      {/* ── Strategy Form ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={runStrategySimulation}>

          {/* Strategy selector */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Simulation Blueprint
            </label>
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '4px', gap: '4px', border: '1px solid var(--border-color)' }}>
              {[{ val: 'DCA', label: '📊 DCA – Dollar Cost Average' }, { val: 'BRACKET', label: '🎯 Bracket Order Limits' }].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => { setStrategyType(val); setSimulationResult(null); }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.18s',
                    background: strategyType === val
                      ? 'linear-gradient(135deg, var(--accent-primary), #4338ca)'
                      : 'transparent',
                    color: strategyType === val ? '#fff' : 'var(--text-muted)',
                    boxShadow: strategyType === val ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          {strategyType === 'DCA' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>Periodic Budget ($)</label>
                <input
                  type="number" min="10"
                  className="form-input"
                  value={dcaAmount}
                  onChange={(e) => setDcaAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>Buy Interval</label>
                <select
                  className="form-input"
                  value={dcaInterval}
                  onChange={(e) => setDcaInterval(e.target.value)}
                >
                  <option value="weekly">Every Week</option>
                  <option value="monthly">Every Month</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Starting Investment ($)', val: bracketAmount, set: setBracketAmount, min: 100 },
                { label: 'Take Profit Trigger (%)', val: bracketProfit, set: setBracketProfit, min: 1 },
                { label: 'Stop Loss Trigger (%)',   val: bracketLoss,   set: setBracketLoss,   min: 1 },
              ].map(({ label, val, set, min }) => (
                <div key={label}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'block' }}>{label}</label>
                  <input
                    type="number" min={min}
                    className="form-input"
                    value={val}
                    onChange={(e) => set(parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={simulating || !selectedStock}
            style={{
              width: '100%',
              padding: '13px',
              background: simulating || !selectedStock
                ? 'var(--bg-tertiary)'
                : 'linear-gradient(135deg, var(--accent-primary), #4338ca)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: simulating || !selectedStock ? 'var(--text-muted)' : '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '15px',
              cursor: simulating || !selectedStock ? 'not-allowed' : 'pointer',
              boxShadow: simulating || !selectedStock ? 'none' : '0 4px 18px rgba(99,102,241,0.3)',
              letterSpacing: '0.3px',
            }}
          >
            {simulating ? '⟳ Running Simulation…' : '▶ Run Strategy Simulation'}
          </button>

          {!selectedStock && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>Search & select an asset above first.</p>
          )}
        </form>
      </div>

      {/* ── Simulation Results ── */}
      {simulationResult && (
        <div className="animate-fade" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', lineHeight: 1 }}>
                Simulation Report
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {simulationResult.stock} · {simulationResult.type} Strategy · 90-day Mock Run
              </p>
            </div>
            <span style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: 700,
              background: simulationResult.profitLossPercent >= 0 ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
              color: simulationResult.profitLossPercent >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
              border: `1px solid ${simulationResult.profitLossPercent >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {simulationResult.profitLossPercent >= 0 ? '▲' : '▼'} {Math.abs(simulationResult.profitLossPercent).toFixed(2)}% ROI
            </span>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
            {[
              { label: 'Principal', val: formatCurrency(simulationResult.totalInvested), accent: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
              { label: 'Final Value', val: formatCurrency(simulationResult.finalValue), accent: 'var(--accent-primary)', bg: 'var(--accent-primary-subtle)' },
              {
                label: 'Net Return',
                val: `${(simulationResult.profitLoss ?? simulationResult.profitLossAmount) >= 0 ? '+' : ''}${formatCurrency(simulationResult.profitLoss ?? simulationResult.profitLossAmount)}`,
                accent: (simulationResult.profitLoss ?? simulationResult.profitLossAmount) >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                bg: (simulationResult.profitLoss ?? simulationResult.profitLossAmount) >= 0 ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
              },
              {
                label: 'ROI %',
                val: `${simulationResult.profitLossPercent >= 0 ? '+' : ''}${simulationResult.profitLossPercent.toFixed(2)}%`,
                accent: simulationResult.profitLossPercent >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                bg: simulationResult.profitLossPercent >= 0 ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
              },
            ].map(({ label, val, accent, bg }) => (
              <div key={label} style={{
                padding: '16px',
                background: bg,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '17px', color: accent, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* DCA extras */}
          {simulationResult.type === 'DCA' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Shares Accumulated', val: `${simulationResult.totalShares.toFixed(4)} shs` },
                { label: 'Avg Cost / Share',   val: formatCurrency(simulationResult.avgPurchasePrice) },
                { label: 'Final Price',         val: formatCurrency(simulationResult.prices[simulationResult.prices.length - 1]) },
              ].map(({ label, val }) => (
                <div key={label} style={{ padding: '13px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bracket extras */}
          {simulationResult.type === 'BRACKET' && (
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Trigger Event</span>
                <div style={{
                  fontWeight: 800, marginTop: '4px', fontSize: '15px',
                  color: simulationResult.triggerType === 'TAKE_PROFIT' ? 'var(--accent-success)' : 'var(--accent-danger)',
                }}>
                  {simulationResult.triggerType.replace('_', ' ')}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Day Triggered</span>
                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '15px' }}>Day {simulationResult.triggerDay}</div>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Trigger Price</span>
                <div style={{ fontWeight: 700, marginTop: '4px', fontSize: '15px' }}>{formatCurrency(simulationResult.triggerPrice)}</div>
              </div>
            </div>
          )}

          {/* SVG price chart */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600 }}>
              <span>{formatCurrency(simulationResult.prices[0])}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Price Movement · {simulationResult.prices.length} data points</span>
              <span>{formatCurrency(simulationResult.prices[simulationResult.prices.length - 1])}</span>
            </div>
            <svg viewBox="0 0 500 140" width="100%" height="140" style={{ overflow: 'visible' }}>
              {/* Gradient area fill */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </linearGradient>
              </defs>
              <polygon
                fill="url(#chartGrad)"
                points={`0,140 ${generateSvgPoints(simulationResult.prices, 500, 130)} 500,140`}
              />
              <polyline
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={generateSvgPoints(simulationResult.prices, 500, 130)}
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
