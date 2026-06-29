import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Home() {
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
    setCurrentPage,
    fetchStocksData,
    handleTradeSubmit,
    setError,
    setSuccess
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getHoldingQuantity = (ticker) => {
    if (!activePortfolio) return 0;
    const holding = activePortfolio.holdings.find(h => h.ticker === ticker);
    return holding ? holding.quantity : 0;
  };

  const stockHistory = React.useMemo(() => {
    if (!selectedStock) return [];
    const price = selectedStock.currentPrice;
    return [
      price * 0.94,
      price * 0.97,
      price * 0.95,
      price * 1.02,
      price * 0.98,
      price * 1.03,
      price
    ];
  }, [selectedStock]);

  const generateSvgPoints = (data, width = 300, height = 80) => {
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
    <div className="home-dashboard animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* Main Column */}
      <div>
        <div className="card">
          <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Market Assets Feed</h2>
            <button className="logout-btn" onClick={fetchStocksData} style={{ padding: '6px 12px' }}>Update Feed Prices</button>
          </div>

          {stocks.length === 0 ? (
            <p className="holdings-empty">Loading market feed data...</p>
          ) : (
            <div className="stocks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {stocks.map((stock) => (
                <div
                  key={stock._id}
                  className={`stock-card ${selectedStock?.ticker === stock.ticker ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedStock(stock);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: selectedStock?.ticker === stock.ticker ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div className="stock-card-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div className="stock-ticker" style={{ fontWeight: 'bold', fontSize: '18px' }}>{stock.ticker}</div>
                      <div className="stock-name" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stock.companyName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="stock-price" style={{ fontSize: '20px', fontWeight: 600 }}>{formatCurrency(stock.currentPrice)}</div>
                    <div className="stock-stats" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                      <span>Cap: ${(stock.marketCap / 1e9).toFixed(1)}B</span>
                      <span>Vol: ${(stock.volume / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar (Trading Terminal & Chart) */}
      <div>
        {selectedStock ? (
          <div className="trade-card animate-fade">
            {/* Stock details & SVG trend chart */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
                    {selectedStock.ticker}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedStock.companyName}
                  </p>
                </div>
                <span className="badge buy" style={{ fontSize: '12px' }}>Active Asset</span>
              </div>
              
              {/* Simulated SVG Trend Chart */}
              <div style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>7-Day Trend</span>
                  <span style={{ color: 'var(--accent-success)' }}>+3.2%</span>
                </div>
                <svg viewBox="0 0 300 80" width="100%" height="80">
                  <polyline
                    fill="none"
                    stroke="var(--accent-success)"
                    strokeWidth="2.5"
                    points={generateSvgPoints(stockHistory, 300, 80)}
                  />
                </svg>
              </div>

              <div className="stock-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px', border: 'none', padding: 0 }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Market Cap</span>
                  <strong style={{ fontSize: '14px' }}>${(selectedStock.marketCap / 1e9).toFixed(2)} Billion</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Volume (24h)</span>
                  <strong style={{ fontSize: '14px' }}>{(selectedStock.volume / 1e6).toFixed(2)} Million</strong>
                </div>
              </div>
            </div>

            {/* Trading terminal panel */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                Trading Terminal ({activePortfolio ? activePortfolio.portfolioName : 'No Portfolio'})
              </h3>

              <div className="trade-type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`trade-type-btn buy ${tradeType === 'BUY' ? 'active' : ''}`}
                  onClick={() => setTradeType('BUY')}
                  style={{ flex: 1, padding: '10px', background: tradeType === 'BUY' ? 'var(--accent-success)' : 'var(--bg-primary)' }}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`trade-type-btn sell ${tradeType === 'SELL' ? 'active' : ''}`}
                  onClick={() => setTradeType('SELL')}
                  style={{ flex: 1, padding: '10px', background: tradeType === 'SELL' ? 'var(--accent-danger)' : 'var(--bg-primary)' }}
                >
                  Sell
                </button>
              </div>

              <form onSubmit={handleTradeSubmit}>
                <div className="trade-info-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px' }}>
                  <span className="label" style={{ color: 'var(--text-secondary)' }}>Current Market Price</span>
                  <span className="value" style={{ fontWeight: 600 }}>{formatCurrency(selectedStock.currentPrice)}</span>
                </div>
                {tradeType === 'SELL' && (
                  <div className="trade-info-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px' }}>
                    <span className="label" style={{ color: 'var(--text-secondary)' }}>Owned Shares</span>
                    <span className="value" style={{ fontWeight: 600 }}>{getHoldingQuantity(selectedStock.ticker)}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label htmlFor="qty-input">Trade Quantity</label>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    required
                  />
                </div>

                <div className="trade-info-row divider total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                  <span className="label">{tradeType === 'BUY' ? 'Est. Capital Cost' : 'Est. Account Return'}</span>
                  <span className="value" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(selectedStock.currentPrice * quantity)}</span>
                </div>

                <button
                  type="submit"
                  className={`trade-submit-btn ${tradeType.toLowerCase()}`}
                  disabled={
                    tradingLoading ||
                    !activePortfolio ||
                    !user.isVerified ||
                    (tradeType === 'BUY' && user.virtualCashBalance < selectedStock.currentPrice * quantity) ||
                    (tradeType === 'SELL' && getHoldingQuantity(selectedStock.ticker) < quantity)
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    background: tradeType === 'BUY' ? 'var(--accent-success)' : 'var(--accent-danger)',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  {tradingLoading ? 'Executing Trade...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} Shares`}
                </button>
                
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

              {/* Direct anchor link to strategy lab backtester */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center' }}>
                <button 
                  className="logout-btn" 
                  style={{ width: '100%', color: 'var(--accent-primary)', borderColor: 'var(--border-color-active)' }}
                  onClick={() => {
                    setCurrentPage('strategy');
                    setError('');
                    setSuccess('');
                  }}
                >
                  🧪 Analyze {selectedStock.ticker} in Strategy Lab
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="trade-card">
            <p className="holdings-empty" style={{ padding: '20px 0' }}>Select an asset card from the market grid to enable actions.</p>
          </div>
        )}
      </div>

    </div>
  );
}
