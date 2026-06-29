import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function StockChart() {
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
    setSimulating
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
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

  const runStrategySimulation = (e) => {
    e.preventDefault();
    if (!selectedStock) return;
    
    setSimulating(true);
    setSimulationResult(null);

    // Simulate standard random walk / arithmetic brownian motion prices for next 90 days
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

  return (
    <div className="card animate-fade">
      <div className="card-title-row">
        <h2>Strategy Backtesting Lab</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Test financial strategies against 90-day simulated historical price data.
        </p>
      </div>

      <form onSubmit={runStrategySimulation} style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', marginTop: '16px' }}>
        <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Select Asset</label>
            <select 
              className="form-input" 
              value={selectedStock ? selectedStock.ticker : ''}
              onChange={(e) => {
                const stock = stocks.find(s => s.ticker === e.target.value);
                setSelectedStock(stock || null);
              }}
            >
              {stocks.map(s => <option key={s._id} value={s.ticker}>{s.ticker} ({s.companyName})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Strategy Blueprint</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`trade-type-btn ${strategyType === 'DCA' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px', background: strategyType === 'DCA' ? 'var(--accent-primary)' : 'var(--bg-primary)' }}
                onClick={() => { setStrategyType('DCA'); setSimulationResult(null); }}
              >
                DCA
              </button>
              <button
                type="button"
                className={`trade-type-btn ${strategyType === 'BRACKET' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px', background: strategyType === 'BRACKET' ? 'var(--accent-primary)' : 'var(--bg-primary)' }}
                onClick={() => { setStrategyType('BRACKET'); setSimulationResult(null); }}
              >
                Bracket Order
              </button>
            </div>
          </div>
        </div>

        {strategyType === 'DCA' ? (
          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Periodic Investment Amount ($)</label>
              <input 
                type="number" 
                min="10" 
                className="form-input" 
                value={dcaAmount} 
                onChange={(e) => setDcaAmount(parseInt(e.target.value) || 0)} 
              />
            </div>
            <div className="form-group">
              <label>Investment Interval</label>
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
          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Initial Investment ($)</label>
              <input 
                type="number" 
                min="100" 
                className="form-input" 
                value={bracketAmount} 
                onChange={(e) => setBracketAmount(parseInt(e.target.value) || 0)} 
              />
            </div>
            <div className="form-group">
              <label>Take Profit Trigger (%)</label>
              <input 
                type="number" 
                min="1" 
                className="form-input" 
                value={bracketProfit} 
                onChange={(e) => setBracketProfit(parseInt(e.target.value) || 0)} 
              />
            </div>
            <div className="form-group">
              <label>Stop Loss Trigger (%)</label>
              <input 
                type="number" 
                min="1" 
                className="form-input" 
                value={bracketLoss} 
                onChange={(e) => setBracketLoss(parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="portfolio-btn" 
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          disabled={simulating || !selectedStock}
        >
          {simulating ? 'Executing Simulation Model...' : 'Simulate Strategy Performance'}
        </button>
      </form>

      {/* Simulation Result Output Panel */}
      {simulationResult && (
        <div className="animate-fade" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', background: 'rgba(255, 255, 255, 0.02)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
            Simulation Summary: {simulationResult.stock} ({simulationResult.type})
          </h3>

          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <span className="label" style={{ fontSize: '11px' }}>Principal Capital</span>
              <span className="value" style={{ fontSize: '20px' }}>{formatCurrency(simulationResult.totalInvested)}</span>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <span className="label" style={{ fontSize: '11px' }}>Final Account Value</span>
              <span className="value" style={{ fontSize: '20px' }}>{formatCurrency(simulationResult.finalValue)}</span>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <span className="label" style={{ fontSize: '11px' }}>Net Return ($)</span>
              <span className="value" style={{ fontSize: '20px', color: (simulationResult.profitLoss || simulationResult.profitLossAmount) >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {(simulationResult.profitLoss || simulationResult.profitLossAmount) >= 0 ? '+' : ''}{formatCurrency(simulationResult.profitLoss || simulationResult.profitLossAmount)}
              </span>
            </div>
            <div className="stat-card" style={{ padding: '16px' }}>
              <span className="label" style={{ fontSize: '11px' }}>ROI Percentage</span>
              <span className="value" style={{ fontSize: '20px', color: simulationResult.profitLossPercent >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {simulationResult.profitLossPercent >= 0 ? '+' : ''}{simulationResult.profitLossPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {simulationResult.type === 'DCA' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <div>
                <p>Total Accumulation: <strong>{simulationResult.totalShares.toFixed(4)} shares</strong></p>
                <p style={{ marginTop: '8px' }}>Average Cost Share: <strong>{formatCurrency(simulationResult.avgPurchasePrice)}</strong></p>
              </div>
              <div>
                <p>Market Value Share: <strong>{formatCurrency(simulationResult.prices[simulationResult.prices.length - 1])}</strong></p>
              </div>
            </div>
          )}

          {simulationResult.type === 'BRACKET' && (
            <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '14px', marginBottom: '20px' }}>
              <p>
                Trigger Event: <strong style={{ color: simulationResult.triggerType === 'TAKE_PROFIT' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{simulationResult.triggerType}</strong>
              </p>
              <p style={{ marginTop: '8px' }}>
                Triggered on Day: <strong>{simulationResult.triggerDay}</strong> (at price {formatCurrency(simulationResult.triggerPrice)})
              </p>
            </div>
          )}

          {/* SVG Chart for simulation outcome path */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              <span>Start Simulation</span>
              <span>Asset Price Trend Line</span>
              <span>End Simulation (90d)</span>
            </div>
            <svg viewBox="0 0 500 150" width="100%" height="150" style={{ overflow: 'visible' }}>
              <polyline
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
                points={generateSvgPoints(simulationResult.prices, 500, 150)}
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
