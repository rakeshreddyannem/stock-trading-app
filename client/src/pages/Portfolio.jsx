import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Portfolio() {
  const {
    user,
    portfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,
    newPortfolioName,
    setNewPortfolioName,
    activePortfolio,
    stocks,
    setSelectedStock,
    setCurrentPage,
    handleCreatePortfolio,
    setError,
    setSuccess
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="portfolio-page animate-fade">
      {/* Portfolio Select / Create */}
      <div className="card animate-fade">
        <div className="card-title-row">
          <h2>My Portfolios</h2>
        </div>
        
        <form onSubmit={handleCreatePortfolio} className="portfolio-form" style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
          <input
            type="text"
            placeholder="E.g., Tech Stocks, Retirement Plan"
            className="form-input"
            value={newPortfolioName}
            onChange={(e) => setNewPortfolioName(e.target.value)}
            maxLength="40"
            required
          />
          <button type="submit" className="portfolio-btn" style={{ whiteSpace: 'nowrap' }}>Create Portfolio</button>
        </form>

        {portfolios.length === 0 ? (
          <p className="holdings-empty">Create a portfolio to start purchasing stocks.</p>
        ) : (
          <div className="portfolio-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
            {portfolios.map((portfolio) => (
              <div
                key={portfolio._id}
                className={`portfolio-item ${selectedPortfolioId === portfolio._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPortfolioId(portfolio._id);
                  setError('');
                  setSuccess('');
                }}
                style={{
                  padding: '12px 20px',
                  background: selectedPortfolioId === portfolio._id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  color: selectedPortfolioId === portfolio._id ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                <span className="name" style={{ marginRight: '10px' }}>{portfolio.portfolioName}</span>
                <span className="holdings-count" style={{ fontSize: '11px', opacity: 0.8 }}>({portfolio.holdings.length} stocks)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Portfolio Holdings */}
      <div className="card animate-fade" style={{ marginTop: '24px' }}>
        <div className="card-title-row">
          <h2>Active Holdings ({activePortfolio ? activePortfolio.portfolioName : 'None'})</h2>
        </div>
        
        {!activePortfolio || activePortfolio.holdings.length === 0 ? (
          <p className="holdings-empty">No shares held in this portfolio. Browse the market to purchase stocks.</p>
        ) : (
          <div className="holdings-table-wrapper" style={{ marginTop: '16px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Company Name</th>
                  <th>Shares</th>
                  <th>Avg Purchase</th>
                  <th>Current Price</th>
                  <th>Total Cost</th>
                  <th>Holdings Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePortfolio.holdings.map((holding, idx) => {
                  const currentStock = stocks.find(s => s.ticker === holding.ticker);
                  const currentPrice = currentStock ? currentStock.currentPrice : holding.avgPurchasePrice;
                  const totalCost = holding.quantity * holding.avgPurchasePrice;
                  const currentValue = holding.quantity * currentPrice;
                  return (
                    <tr key={idx}>
                      <td><strong>{holding.ticker}</strong></td>
                      <td>{holding.companyName}</td>
                      <td>{holding.quantity}</td>
                      <td>{formatCurrency(holding.avgPurchasePrice)}</td>
                      <td>{formatCurrency(currentPrice)}</td>
                      <td>{formatCurrency(totalCost)}</td>
                      <td style={{ color: currentValue >= totalCost ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
                        {formatCurrency(currentValue)}
                      </td>
                      <td>
                        <button 
                          className="logout-btn" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            const stock = stocks.find(s => s.ticker === holding.ticker);
                            if (stock) {
                              setSelectedStock(stock);
                              setCurrentPage('home');
                            }
                          }}
                        >
                          Select & Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
