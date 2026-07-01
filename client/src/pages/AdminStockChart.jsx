import React, { useContext, useMemo } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function AdminStockChart() {
  const { stocks } = useContext(GeneralContext);

  const averagePrice = useMemo(() => {
    if (stocks.length === 0) return 0;
    return stocks.reduce((sum, s) => sum + s.currentPrice, 0) / stocks.length;
  }, [stocks]);

  const maxPriceStock = useMemo(() => {
    if (stocks.length === 0) return null;
    return [...stocks].sort((a, b) => b.currentPrice - a.currentPrice)[0];
  }, [stocks]);

  const minPriceStock = useMemo(() => {
    if (stocks.length === 0) return null;
    return [...stocks].sort((a, b) => a.currentPrice - b.currentPrice)[0];
  }, [stocks]);

  // Select top 10 highest priced stocks to keep chart clean and readable
  const topStocks = useMemo(() => {
    if (stocks.length === 0) return [];
    return [...stocks].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
  }, [stocks]);

  // Premium Custom SVG Bar Chart comparing top 10 stock prices
  const generateChartBars = () => {
    if (topStocks.length === 0) return null;
    const maxVal = maxPriceStock ? maxPriceStock.currentPrice : 100;
    
    return topStocks.map((stock, idx) => {
      const height = (stock.currentPrice / maxVal) * 110 + 10;
      const x = idx * 52 + 50;
      const y = 150 - height;
      return (
        <g key={stock._id}>
          <rect
            x={x}
            y={y}
            width="24"
            height={height}
            fill="var(--accent-primary)"
            rx="4"
            style={{ opacity: 0.85, transition: 'all 0.3s' }}
          />
          <text
            x={x + 12}
            y="170"
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="9"
            fontWeight="bold"
          >
            {stock.ticker}
          </text>
          <text
            x={x + 12}
            y={y - 8}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="9"
            fontWeight="bold"
          >
            ${stock.currentPrice.toFixed(0)}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="card animate-fade" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '24px' }}>
      <div className="card-title-row">
        <h2>📊 Market Index Analytics</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          System-wide asset comparison and index metrics.
        </p>
      </div>

      <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0' }}>
        <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <span className="label" style={{ fontSize: '10px' }}>Average Index Price</span>
          <span className="value" style={{ fontSize: '20px', fontWeight: 800 }}>${averagePrice.toFixed(2)}</span>
        </div>
        <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <span className="label" style={{ fontSize: '10px' }}>Most Expensive Asset</span>
          <span className="value" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-success)' }}>
            {maxPriceStock ? `${maxPriceStock.ticker} ($${maxPriceStock.currentPrice.toFixed(1)})` : 'N/A'}
          </span>
        </div>
        <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <span className="label" style={{ fontSize: '10px' }}>Least Expensive Asset</span>
          <span className="value" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-danger)' }}>
            {minPriceStock ? `${minPriceStock.ticker} ($${minPriceStock.currentPrice.toFixed(1)})` : 'N/A'}
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '13px', alignSelf: 'flex-start', marginBottom: '20px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Valuation Comparison (Top 10 Highest Priced Assets)
        </h3>
        <svg viewBox="0 0 600 200" width="100%" height="200" style={{ overflow: 'visible' }}>
          {generateChartBars()}
          {/* Baseline */}
          <line x1="20" y1="150" x2="580" y2="150" stroke="var(--border-color)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
