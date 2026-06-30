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

  const [productType, setProductType] = useState('Intraday');
  const [candles, setCandles] = useState([]);

  // Generate mock intraday candlestick data aligned with the selected stock's current price
  useEffect(() => {
    if (!selectedStock) return;

    const basePrice = selectedStock.currentPrice;
    const count = 60;
    const data = [];
    
    // Seed random seed based on ticker to keep chart shapes stable but realistic
    let current = basePrice * 1.02; // Start slightly higher and trend down to reference image shape
    let time = new Date();
    // Set starting time at 9:30 AM of current day
    time.setHours(9, 30, 0, 0);

    for (let i = 0; i < count; i++) {
      // Create random price movement
      const multiplier = i < count / 2 ? -0.0015 : 0.001; // Trend down then slightly up/stable
      const variance = (Math.random() - 0.5) * (basePrice * 0.004);
      const open = current;
      const close = i === count - 1 ? basePrice : current + (basePrice * multiplier) + variance;
      
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.002);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.002);

      data.push({
        x: new Date(time.getTime()),
        y: [
          parseFloat(open.toFixed(2)),
          parseFloat(high.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(close.toFixed(2))
        ]
      });

      current = close;
      time.setTime(time.getTime() + 5 * 60 * 1000); // 5-minute intervals
    }
    setCandles(data);
  }, [selectedStock]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatPrice5 = (val) => {
    return typeof val === 'number' ? val.toFixed(5) : '0.00000';
  };

  const getHoldingQuantity = (ticker) => {
    if (!activePortfolio) return 0;
    const holding = activePortfolio.holdings.find(h => h.ticker === ticker);
    return holding ? holding.quantity : 0;
  };

  // ApexCharts Options configuration matching reference design
  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 380,
      background: 'transparent',
      toolbar: {
        show: true,
        autoSelected: 'zoom',
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      foreColor: '#9ca3af',
      fontFamily: 'Inter, sans-serif'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'HH:mm:ss',
        style: {
          colors: '#9ca3af',
          fontSize: '11px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: (val) => val.toFixed(5),
        style: {
          colors: '#9ca3af',
          fontSize: '11px'
        }
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 2
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22c55e',
          downward: '#ef4444'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const chartSeries = [{
    name: 'Price',
    data: candles
  }];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 1: Interactive Candlestick Chart & Buy/Sell Order Ticket */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left Column: Interactive Candlestick Chart */}
        <div className="card" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedStock ? (
            <>
              {/* Asset Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
                    {selectedStock.ticker} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>NASDAQ</span>
                  </h1>
                </div>
                
                {/* Stock Selector Dropdown */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="form-input" 
                    value={selectedStock.ticker}
                    onChange={(e) => {
                      const stock = stocks.find(s => s.ticker === e.target.value);
                      setSelectedStock(stock || null);
                      setError('');
                      setSuccess('');
                    }}
                    style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  >
                    {stocks.map(s => <option key={s._id} value={s.ticker}>{s.ticker} ({s.companyName})</option>)}
                  </select>
                </div>
              </div>

              {/* ApexCharts candlestick rendering */}
              <div style={{ flex: 1, minHeight: '380px', marginTop: '10px' }}>
                {candles.length > 0 && (
                  <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="candlestick"
                    height={380}
                  />
                )}
              </div>
            </>
          ) : (
            <p className="holdings-empty" style={{ margin: 'auto' }}>Loading interactive market data...</p>
          )}
        </div>

        {/* Right Column: Order Entry Widget matching reference image */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedStock ? (
            <div>
              {/* Buy/Sell Toggles with live prices (5 decimal places) */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setTradeType('BUY')}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    background: tradeType === 'BUY' ? 'var(--accent-primary)' : 'transparent',
                    color: '#fff',
                    border: tradeType === 'BUY' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color-active)'
                  }}
                >
                  Buy @ $ {formatPrice5(selectedStock.currentPrice)}
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('SELL')}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    background: tradeType === 'SELL' ? 'var(--accent-primary)' : 'transparent',
                    color: '#fff',
                    border: tradeType === 'SELL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color-active)'
                  }}
                >
                  Sell @ $ {formatPrice5(selectedStock.currentPrice)}
                </button>
              </div>

              {/* Order Entry Form */}
              <form onSubmit={handleTradeSubmit}>
                {/* Product Type Selector */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="product-type" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Product type</label>
                  <select
                    id="product-type"
                    className="form-input"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                {/* Trade Quantity */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="order-qty" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Quantity</label>
                  <input
                    id="order-qty"
                    type="number"
                    min="1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    required
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}
                  />
                </div>

                {/* Total Price Display */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Total price</label>
                  <div
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {formatPrice5(selectedStock.currentPrice * quantity)}
                  </div>
                </div>

                {/* Buy/Sell Action Button */}
                <button
                  type="submit"
                  disabled={
                    tradingLoading ||
                    !activePortfolio ||
                    (tradeType === 'BUY' && user.virtualCashBalance < selectedStock.currentPrice * quantity) ||
                    (tradeType === 'SELL' && getHoldingQuantity(selectedStock.ticker) < quantity)
                  }
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    border: 'none',
                    background: tradeType === 'BUY' ? 'var(--accent-success)' : 'var(--accent-danger)',
                    color: '#fff',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {tradingLoading ? 'Executing...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} now`}
                </button>

                {/* Validation Warnings */}
                {activePortfolio && tradeType === 'BUY' && user.virtualCashBalance < selectedStock.currentPrice * quantity && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
                    Insufficient cash balance to make this purchase.
                  </p>
                )}
                {activePortfolio && tradeType === 'SELL' && getHoldingQuantity(selectedStock.ticker) < quantity && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
                    You do not own enough shares of {selectedStock.ticker} to sell.
                  </p>
                )}
                {!activePortfolio && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
                    Please create a portfolio in "My Portfolio" tab to enable trade actions.
                  </p>
                )}
              </form>
            </div>
          ) : (
            <p className="holdings-empty" style={{ margin: 'auto' }}>Select an asset to trade.</p>
          )}
        </div>
      </div>

      {/* SECTION 2: Strategy backtester lab (DCA & Bracket Simulation) */}
      <div className="card animate-fade">
        <div className="card-title-row">
          <h2>Strategy Backtesting Lab</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Test financial blueprints against 90-day simulated historical price data.
          </p>
        </div>

        <form onSubmit={runStrategySimulation} style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', marginTop: '16px' }}>
          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Blueprint Type</label>
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

            <div className="form-group">
              <label>Asset for Backtesting</label>
              <input 
                type="text" 
                className="form-input" 
                value={selectedStock ? `${selectedStock.ticker} (${selectedStock.companyName})` : ''} 
                disabled 
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              />
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
                <span className="value" style={{ fontSize: '20px', color: simulationResult.profitLoss >= 0 || simulationResult.profitLossAmount >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
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

    </div>
  );
}
