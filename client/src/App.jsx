import React, { useContext } from 'react';
import { GeneralContext, GeneralContextProvider } from './context/GeneralContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import History from './pages/History';
import StockChart from './pages/StockChart';
import Admin from './pages/Admin';
import Users from './pages/Users';
import AllOrders from './pages/AllOrders';
import AllTransactions from './pages/AllTransactions';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function AppContent() {
  const {
    user,
    showAuth,
    isRegister,
    currentPage,
    error,
    success,
    loading,
    totalPortfolioValue,
    demoVerificationLink,
    handleResendVerification
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Unauthenticated Flow
  if (!user) {
    if (!showAuth) {
      return (
        <div className="landing-wrapper">
          <Navbar />
          <Landing />
        </div>
      );
    }

    // AUTH VIEW (LOGIN / REGISTER CARD)
    return (
      <div className="landing-wrapper">
        <Navbar />
        <main className="auth-wrapper" style={{ flex: 1, minHeight: 'auto' }}>
          {isRegister ? <Register /> : <Login />}
        </main>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="app-container">
      <Navbar />

      {/* Main Container */}
      <main className="dashboard">
        <section className="main-section animate-fade">
          {error && <div className="status-message error">{error}</div>}
          {success && <div className="status-message success">{success}</div>}

          {/* Email Verification Required banner */}
          {user && !user.isVerified && (
            <div className="status-message error" style={{ color: '#ffb300', background: 'rgba(255, 179, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255, 179, 0, 0.2)' }}>
              <div>
                <strong>⚠️ Email Verification Required:</strong> Please verify your email address to unlock portfolio creation and stock trading.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <button onClick={handleResendVerification} className="logout-btn" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255, 179, 0, 0.4)' }} disabled={loading}>
                  Resend Verification Link
                </button>
                {demoVerificationLink && (
                  <span style={{ fontSize: '13px' }}>
                    <strong>[DEMO] Verification Link:</strong>{' '}
                    <a href={demoVerificationLink} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                      Click here to verify
                    </a>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats Banner (Visible everywhere) */}
          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="stat-card accent">
              <div>
                <div className="label">Total Net Worth</div>
                <div className="value" style={{ fontSize: '28px' }}>{formatCurrency(totalPortfolioValue)}</div>
              </div>
              <div className="subtitle">Cash Balance + Holdings Valuation</div>
            </div>
            
            <div className="stat-card">
              <div>
                <div className="label">Virtual Cash</div>
                <div className="value" style={{ fontSize: '28px' }}>{formatCurrency(user.virtualCashBalance)}</div>
              </div>
              <div className="subtitle">Available to place trades</div>
            </div>
          </div>

          {/* Page Routing */}
          {currentPage === 'home' && <Home />}
          {currentPage === 'portfolio' && <Portfolio />}
          {currentPage === 'strategy' && <StockChart />}
          {currentPage === 'history' && <History />}
          {currentPage === 'profile' && <Profile />}
          {currentPage === 'admin' && <Admin />}
          {currentPage === 'users' && <Users />}
          {currentPage === 'all-orders' && <AllOrders />}
          {currentPage === 'all-transactions' && <AllTransactions />}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <GeneralContextProvider>
      <AppContent />
    </GeneralContextProvider>
  );
}

export default App;
