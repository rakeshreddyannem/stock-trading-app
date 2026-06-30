import React, { useContext } from 'react';
import { GeneralContext, GeneralContextProvider } from './context/GeneralContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import History from './pages/History';
import StockChart from './pages/StockChart';
import Funds from './pages/Funds';
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
                <div className="label">Cash Balance</div>
                <div className="value" style={{ fontSize: '28px' }}>{formatCurrency(user.virtualCashBalance)}</div>
              </div>
              <div className="subtitle">Available to place trades</div>
            </div>
          </div>

          {/* Page Routing */}
          {currentPage === 'home' && <Home />}
          {currentPage === 'portfolio' && <Portfolio />}
          {currentPage === 'funds' && <Funds />}
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
