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

      {/* About & Workflow Section */}
      <section className="about-app-section" style={{ padding: '60px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'flex-start' }}>
          
          {/* Why This App */}
          <div>
            <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '16px', color: 'var(--accent-primary)' }}>Why SB Stocks?</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Investing in financial markets can be intimidating for beginners and challenging for seasoned traders looking to test new systems. SB Stocks was built to bridge this gap.
            </p>
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              We provide a fully simulated environment that mirrors the mechanics of real-world stock trading. By removing the financial risk, users can build confidence, understand market dynamics, test Dollar Cost Averaging (DCA), and explore strategic bracket orders without losing a single cent of real money.
            </p>
          </div>

          {/* How It Works */}
          <div>
            <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '24px' }}>How It Works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>1</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Create an Account</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Join SB Stocks instantly by choosing a username and password. No KYC, credit card, or verification needed.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-success)', fontWeight: 'bold', fontSize: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>2</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Get $10,000 Mock Balance</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Your account is instantly credited with $10,000 in virtual funds. Use it to buy and sell stocks in the simulator.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', height: '36px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>3</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Analyze & Build Portfolios</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Organize holdings into thematic portfolios, study price actions, and execute trades in our Strategy Lab.</p>
                </div>
              </div>
            </div>
          </div>

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
