import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Landing() {
  const { setShowAuth, setIsRegister, setError, setSuccess } = useContext(GeneralContext);

  const handleStartFree = () => {
    setIsRegister(true);
    setShowAuth(true);
    setError('');
    setSuccess('');
  };

  return (
    <div className="landing-wrapper animate-fade">
      {/* Index Ticker Marquee */}
      <div className="ticker-container">
        <div className="ticker-wrapper">
          <div className="ticker-slide">
            <span className="ticker-item">NASDAQ 16,420.50 <span className="up">▲ +1.24%</span></span>
            <span className="ticker-item">S&P 500 5,130.20 <span className="up">▲ +0.81%</span></span>
            <span className="ticker-item">DOW JONES 39,120.10 <span className="down">▼ -0.34%</span></span>
            <span className="ticker-item">NIFTY 50 22,450.30 <span className="up">▲ +0.55%</span></span>
            <span className="ticker-item">SENSEX 73,890.10 <span className="up">▲ +0.47%</span></span>
            <span className="ticker-item">FTSE 100 7,930.40 <span className="down">▼ -0.12%</span></span>
          </div>
          <div className="ticker-slide">
            <span className="ticker-item">NASDAQ 16,420.50 <span className="up">▲ +1.24%</span></span>
            <span className="ticker-item">S&P 500 5,130.20 <span className="up">▲ +0.81%</span></span>
            <span className="ticker-item">DOW JONES 39,120.10 <span className="down">▼ -0.34%</span></span>
            <span className="ticker-item">NIFTY 50 22,450.30 <span className="up">▲ +0.55%</span></span>
            <span className="ticker-item">SENSEX 73,890.10 <span className="up">▲ +0.47%</span></span>
            <span className="ticker-item">FTSE 100 7,930.40 <span className="down">▼ -0.12%</span></span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">STOCK TRADING SIMULATOR</div>
          <h1>Simulate your path to financial wealth</h1>
          <p>
            Learn trading, build diverse portfolios, and test backtesting strategies in a real-time risk-free environment. Get a <strong>$10,000 cash balance</strong> immediately upon signup.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={handleStartFree}>
              Start Trading Free
            </button>
            <a href="#features" className="hero-btn-secondary">
              Explore Features
            </a>
          </div>
        </div>
        
        <div className="hero-graphic">
          <img src="/hero-illustration.png" alt="Futuristic Stock Charts Isometric Illustration" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>A full suite for modern investors</h2>
          <p>Everything you need to master stock trading without financial risk</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            </div>
            <h3>Live Asset Brokerage</h3>
            <p>Buy and sell real stocks including AAPL, MSFT, GOOGL, AMZN, and TSLA under cash accounts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 18v2H3v-2h18zM17.5 4.5l-3 3H19v8h-6.5l-3-3H3v2h5.5l3 3H19c1.1 0 2-.9 2-2V7.5c0-1.1-.9-2-2-2h-1.5z"/></svg>
            </div>
            <h3>Multiple Portfolio Builders</h3>
            <p>Isolate your investments into thematic portfolios (Retirement, Test Trades) to track relative returns.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H7v-2h3V7h2v4h3v2h-3v4z"/></svg>
            </div>
            <h3>Strategy Backtester</h3>
            <p>Simulate financial models like Dollar Cost Averaging (DCA) and Bracket Orders on synthetic timelines before placing capital.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 SB Stocks Trading Simulation. For educational purposes only.</p>
      </footer>
    </div>
  );
}
