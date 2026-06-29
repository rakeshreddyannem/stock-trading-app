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

  // Premium Custom SVG Bar Chart comparing stock prices
  const generateChartBars = () => {
    if (stocks.length === 0) return null;
    const maxVal = maxPriceStock ? maxPriceStock.currentPrice : 100;
    
    return stocks.map((stock, idx) => {
      const height = (stock.currentPrice / maxVal) * 120 + 10;
      const x = idx * 60 + 40;
      const y = 150 - height;
      return (
        <g key={stock._id}>
          <rect
            x={x}
            y={y}
            width="30"
            height={height}
            fill="var(--accent-primary)"
            rx="4"
            style={{ opacity: 0.85 }}
          />
          <text
            x={x + 15}
            y="170"
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontWeight="bold"
          >
            {stock.ticker}
          </text>
          <text
            x={x + 15}
            y={y - 8}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="10"
            fontWeight="bold"
          >
            ${stock.currentPrice.toFixed(0)}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="card animate-fade">
      <div className="card-title-row">
        <h2>📊 Market Index Analytics</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          System-wide asset comparison and index metrics.
        </p>
      </div>

      <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0' }}>
        <div className="stat-card">
          <span className="label">Average Index Price</span>
          <span className="value" style={{ fontSize: '22px' }}>${averagePrice.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="label">Most Expensive Asset</span>
          <span className="value" style={{ fontSize: '22px', color: 'var(--accent-success)' }}>
            {maxPriceStock ? `${maxPriceStock.ticker} ($${maxPriceStock.currentPrice.toFixed(1)})` : 'N/A'}
          </span>
        </div>
        <div className="stat-card">
          <span className="label">Least Expensive Asset</span>
          <span className="value" style={{ fontSize: '22px', color: 'var(--accent-danger)' }}>
            {minPriceStock ? `${minPriceStock.ticker} ($${minPriceStock.currentPrice.toFixed(1)})` : 'N/A'}
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', alignSelf: 'flex-start', marginBottom: '20px', fontWeight: 600 }}>Comparative Asset Valuations</h3>
        <svg viewBox="0 0 600 200" width="100%" height="200" style={{ overflow: 'visible' }}>
          {generateChartBars()}
          {/* Baseline */}
          <line x1="20" y1="150" x2="580" y2="150" stroke="var(--border-color)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
