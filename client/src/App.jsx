import React, { useState, useEffect, useMemo } from 'react'
import {
  registerUser,
  loginUser,
  getPortfolios,
  createPortfolio,
  getStocks,
  placeOrder,
  getOrders,
  getTransactions
} from './api'
import './App.css'

function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_session')
    return saved ? JSON.parse(saved) : null
  })
  const [showAuth, setShowAuth] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // App data state
  const [portfolios, setPortfolios] = useState([])
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('')
  const [newPortfolioName, setNewPortfolioName] = useState('')
  
  const [stocks, setStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  
  const [tradeType, setTradeType] = useState('BUY') // BUY or SELL
  const [quantity, setQuantity] = useState(1)
  
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  
  // Tabs: 'dashboard', 'stocks', 'strategy', 'history'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [historyTab, setHistoryTab] = useState('orders') // orders or transactions

  // Strategy Sandbox State
  const [strategyType, setStrategyType] = useState('DCA') // DCA or BRACKET
  const [dcaAmount, setDcaAmount] = useState(500)
  const [dcaInterval, setDcaInterval] = useState('monthly') // weekly or monthly
  const [dcaDuration, setDcaDuration] = useState(12) // months
  const [bracketProfit, setBracketProfit] = useState(15) // %
  const [bracketLoss, setBracketLoss] = useState(5) // %
  const [bracketAmount, setBracketAmount] = useState(2000) // $
  const [simulationResult, setSimulationResult] = useState(null)

  // UI state
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tradingLoading, setTradingLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)

  // Save session
  useEffect(() => {
    if (user) {
      localStorage.setItem('user_session', JSON.stringify(user))
    } else {
      localStorage.removeItem('user_session')
    }
  }, [user])

  // Load app data once logged in
  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchStocksData()
    } else {
      // Clear data when logged out
      setPortfolios([])
      setSelectedPortfolioId('')
      setStocks([])
      setSelectedStock(null)
      setOrders([])
      setTransactions([])
      setSimulationResult(null)
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    try {
      setError('')
      const userPortfolios = await getPortfolios(user._id, user.token)
      setPortfolios(userPortfolios)
      
      if (userPortfolios.length > 0) {
        setSelectedPortfolioId((prev) => prev || userPortfolios[0]._id)
      }
      
      const ordersList = await getOrders(user.token)
      setOrders(ordersList)

      const transactionsList = await getTransactions(user.token)
      setTransactions(transactionsList)
    } catch (err) {
      setError(err.message || 'Failed to fetch user data')
    }
  }

  const fetchStocksData = async () => {
    try {
      const allStocks = await getStocks()
      setStocks(allStocks)
      if (allStocks.length > 0) {
        setSelectedStock((prev) => prev || allStocks[0])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stocks list')
    }
  }

  // Derived portfolio value calculations
  const activePortfolio = useMemo(() => {
    return portfolios.find(p => p._id === selectedPortfolioId) || null
  }, [portfolios, selectedPortfolioId])

  const portfolioHoldingsValue = useMemo(() => {
    if (!activePortfolio || stocks.length === 0) return 0
    return activePortfolio.holdings.reduce((total, holding) => {
      const currentStock = stocks.find(s => s.ticker === holding.ticker)
      const currentPrice = currentStock ? currentStock.currentPrice : holding.avgPurchasePrice
      return total + (holding.quantity * currentPrice)
    }, 0)
  }, [activePortfolio, stocks])

  const totalPortfolioValue = useMemo(() => {
    if (!user) return 0
    return user.virtualCashBalance + portfolioHoldingsValue
  }, [user, portfolioHoldingsValue])

  // Simulated 7-day price history for selected stock details
  const stockHistory = useMemo(() => {
    if (!selectedStock) return []
    const price = selectedStock.currentPrice
    // Simple mock historical values for visualization
    return [
      price * 0.94,
      price * 0.97,
      price * 0.95,
      price * 1.02,
      price * 0.98,
      price * 1.03,
      price
    ]
  }, [selectedStock])

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        const data = await registerUser(username, email, password)
        setUser(data)
        setSuccess('Registration successful!')
      } else {
        const data = await loginUser(email, password)
        setUser(data)
        setSuccess('Logged in successfully!')
      }
      // Reset fields
      setUsername('')
      setEmail('')
      setPassword('')
      setShowAuth(false)
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user_session')
    setSuccess('Logged out successfully.')
    setError('')
    setActiveTab('dashboard')
    setShowAuth(false)
  }

  // Portfolio Handlers
  const handleCreatePortfolio = async (e) => {
    e.preventDefault()
    if (!newPortfolioName.trim()) return
    setError('')
    try {
      const portfolio = await createPortfolio(newPortfolioName, user.token)
      setPortfolios([...portfolios, portfolio])
      setSelectedPortfolioId(portfolio._id)
      setNewPortfolioName('')
      setSuccess(`Portfolio "${portfolio.portfolioName}" created!`)
    } catch (err) {
      setError(err.message || 'Failed to create portfolio')
    }
  }

  // Trading Handlers
  const handleTradeSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!selectedPortfolioId) {
      setError('Please select or create a portfolio first')
      return
    }
    if (!selectedStock) {
      setError('Please select a stock to trade')
      return
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero')
      return
    }

    setTradingLoading(true)
    try {
      const orderData = {
        portfolioId: selectedPortfolioId,
        ticker: selectedStock.ticker,
        companyName: selectedStock.companyName,
        price: selectedStock.currentPrice,
        count: parseInt(quantity),
        stockType: 'COMMON',
        orderType: tradeType
      }
      
      const completedOrder = await placeOrder(orderData, user.token)
      
      const tradeAmount = selectedStock.currentPrice * parseInt(quantity)
      setUser(current => ({
        ...current,
        virtualCashBalance: tradeType === 'BUY' 
          ? current.virtualCashBalance - tradeAmount 
          : current.virtualCashBalance + tradeAmount
      }))

      setSuccess(`Order executed: ${tradeType} ${quantity} shares of ${selectedStock.ticker}`)
      setQuantity(1)
      await fetchUserData()
    } catch (err) {
      setError(err.message || 'Order failed to execute')
    } finally {
      setTradingLoading(false)
    }
  }

  // Strategy Sandbox Simulators
  const runStrategySimulation = (e) => {
    e.preventDefault()
    if (!selectedStock) return
    
    setSimulating(true)
    setSimulationResult(null)

    // Simulate standard random walk / arithmetic brownian motion prices for next 365 steps
    const currentPrice = selectedStock.currentPrice
    const prices = [currentPrice]
    const steps = 90 // 90 days simulation
    let price = currentPrice
    
    // Seed variance based on volume/price
    const dailyVolatility = 0.02 // 2% daily volatility
    const drift = 0.0008 // positive bias for simulated stocks
    
    for (let i = 1; i <= steps; i++) {
      const changePercent = (Math.random() - 0.48) * dailyVolatility + drift
      price = price * (1 + changePercent)
      prices.push(price)
    }

    setTimeout(() => {
      if (strategyType === 'DCA') {
        // DCA Calculations
        const intervalDays = dcaInterval === 'weekly' ? 7 : 30
        const totalPeriods = Math.floor(steps / intervalDays)
        const periodAmount = dcaAmount
        const totalInvested = totalPeriods * periodAmount
        
        let totalShares = 0
        const purchaseLog = []

        for (let period = 1; period <= totalPeriods; period++) {
          const dayIndex = period * intervalDays
          const purchasePrice = prices[dayIndex]
          const sharesBought = periodAmount / purchasePrice
          totalShares += sharesBought
          purchaseLog.push({
            period,
            day: dayIndex,
            price: purchasePrice,
            shares: sharesBought,
            value: totalShares * purchasePrice
          })
        }

        const finalPrice = prices[steps]
        const finalValue = totalShares * finalPrice
        const profitLoss = finalValue - totalInvested
        const profitLossPercent = (profitLoss / totalInvested) * 100

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
        })
      } else {
        // Bracket Order Calculations (Profit / Loss bounds)
        let triggerDay = -1
        let triggerType = ''
        let triggerPrice = 0
        const upperLimit = currentPrice * (1 + bracketProfit / 100)
        const lowerLimit = currentPrice * (1 - bracketLoss / 100)

        for (let day = 0; day < prices.length; day++) {
          const dayPrice = prices[day]
          if (dayPrice >= upperLimit) {
            triggerDay = day
            triggerType = 'TAKE_PROFIT'
            triggerPrice = dayPrice
            break
          } else if (dayPrice <= lowerLimit) {
            triggerDay = day
            triggerType = 'STOP_LOSS'
            triggerPrice = dayPrice
            break
          }
        }

        if (triggerDay === -1) {
          triggerDay = steps
          triggerType = 'HOLDING_EXPIRED'
          triggerPrice = prices[steps]
        }

        const profitLossPercent = ((triggerPrice - currentPrice) / currentPrice) * 100
        const returnAmount = bracketAmount * (1 + profitLossPercent / 100)
        const profitLossAmount = returnAmount - bracketAmount

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
        })
      }
      setSimulating(false)
    }, 800)
  }

  // Helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  const getHoldingQuantity = (ticker) => {
    if (!activePortfolio) return 0
    const holding = activePortfolio.holdings.find(h => h.ticker === ticker)
    return holding ? holding.quantity : 0
  }

  // Draw SVG lines for stock histories
  const generateSvgPoints = (data, width = 300, height = 100) => {
    if (data.length === 0) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 20) - 10
      return `${x},${y}`
    }).join(' ')
  }

  // Unauthenticated Flow
  if (!user) {
    if (!showAuth) {
      // LANDING PAGE VIEW
      return (
        <div className="landing-wrapper">
          {/* Header */}
          <header className="landing-header">
            <div className="landing-brand">
              <div className="landing-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M3 3v18h18v-2H5V3H3zm4 11l4-4 4 4 6-6-1.41-1.41L15 11l-4-4-4 4H7v3z" />
                </svg>
              </div>
              <span>SB Stocks</span>
            </div>
            
            <nav className="landing-nav">
              <a href="#features">Features</a>
              <a href="#market">Simulator</a>
              <a href="#strategy">Strategy Lab</a>
            </nav>

            <div className="landing-actions">
              <button className="landing-signin-btn" onClick={() => { setIsRegister(false); setShowAuth(true); }}>Sign In</button>
              <button className="landing-cta-btn" onClick={() => { setIsRegister(true); setShowAuth(true); }}>Get Started</button>
            </div>
          </header>

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
              <div className="hero-badge">VIRTUAL STOCK TRADING SIMULATOR</div>
              <h1>Simulate your path to financial wealth</h1>
              <p>
                Learn trading, build diverse portfolios, and test backtesting strategies in a real-time risk-free environment. Get a <strong>$10,000 virtual cash balance</strong> immediately upon signup.
              </p>
              <div className="hero-buttons">
                <button className="hero-btn-primary" onClick={() => { setIsRegister(true); setShowAuth(true); }}>
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
              <h2>A full suite for virtual investors</h2>
              <p>Everything you need to master stock trading without financial risk</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon bg-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                </div>
                <h3>Live Asset Brokerage</h3>
                <p>Buy and sell real stocks including AAPL, MSFT, GOOGL, AMZN, and TSLA under virtual cash accounts.</p>
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
                <h3>Strategy backtester</h3>
                <p>Simulate financial models like Dollar Cost Averaging (DCA) and Bracket Orders on synthetic timelines before placing capital.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="landing-footer">
            <p>© 2026 SB Stocks Virtual Trading Simulation. For educational purposes only.</p>
          </footer>
        </div>
      )
    }

    // AUTH VIEW (LOGIN / REGISTER CARD)
    return (
      <main className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h1>{isRegister ? 'Register Account' : 'Sign In'}</h1>
            <p>{isRegister ? 'Access $10,000 virtual cash instantly' : 'Resume simulating trades'}</p>
          </div>

          {error && <div className="status-message error">{error}</div>}
          {success && <div className="status-message success">{success}</div>}

          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </p>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span 
              onClick={() => { setShowAuth(false); setError(''); setSuccess(''); }} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              ← Back to Home Page
            </span>
          </div>
        </div>
      </main>
    )
  }

  // Authenticated Dashboard Layout
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 3v18h18v-2H5V3H3zm4 11l4-4 4 4 6-6-1.41-1.41L15 11l-4-4-4 4H7v3z" />
            </svg>
          </div>
          <span>SB Stocks</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="dashboard-nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setError(''); setSuccess(''); }}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stocks'); setError(''); setSuccess(''); }}
          >
            Browse Market
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
            onClick={() => { setActiveTab('strategy'); setError(''); setSuccess(''); }}
          >
            Strategy Lab
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setError(''); setSuccess(''); }}
          >
            Ledger History
          </button>
        </div>

        <div className="nav-user">
          <span className="user-tag">{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="dashboard">
        <section className="main-section">
          {error && <div className="status-message error">{error}</div>}
          {success && <div className="status-message success">{success}</div>}

          {/* Quick Stats Banner (Visible everywhere) */}
          <div className="hero-stats">
            <div className="stat-card accent">
              <div>
                <div className="label">Total Net Worth</div>
                <div className="value">{formatCurrency(totalPortfolioValue)}</div>
              </div>
              <div className="subtitle">Cash Balance + Holdings Valuation</div>
            </div>
            
            <div className="stat-card">
              <div>
                <div className="label">Virtual Cash</div>
                <div className="value">{formatCurrency(user.virtualCashBalance)}</div>
              </div>
              <div className="subtitle">Available to place trades</div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD VIEW (Portfolios & Active Holdings) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Portfolio Select / Create */}
              <div className="card animate-fade">
                <div className="card-title-row">
                  <h2>My Portfolios</h2>
                </div>
                
                <form onSubmit={handleCreatePortfolio} className="portfolio-form">
                  <input
                    type="text"
                    placeholder="E.g., Tech Stocks, Retirement Plan"
                    className="form-input"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    maxLength="40"
                    required
                  />
                  <button type="submit" className="portfolio-btn">Create Portfolio</button>
                </form>

                {portfolios.length === 0 ? (
                  <p className="holdings-empty">Create a portfolio to start purchasing stocks.</p>
                ) : (
                  <div className="portfolio-list">
                    {portfolios.map((portfolio) => (
                      <div
                        key={portfolio._id}
                        className={`portfolio-item ${selectedPortfolioId === portfolio._id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPortfolioId(portfolio._id)
                          setError('')
                          setSuccess('')
                        }}
                      >
                        <span className="name">{portfolio.portfolioName}</span>
                        <span className="holdings-count">{portfolio.holdings.length} stocks owned</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Portfolio Holdings */}
              <div className="card animate-fade">
                <div className="card-title-row">
                  <h2>Active Holdings ({activePortfolio ? activePortfolio.portfolioName : 'None'})</h2>
                </div>
                
                {!activePortfolio || activePortfolio.holdings.length === 0 ? (
                  <p className="holdings-empty">No shares held in this portfolio. Browse the market to purchase stocks.</p>
                ) : (
                  <div className="holdings-table-wrapper">
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
                          const currentStock = stocks.find(s => s.ticker === holding.ticker)
                          const currentPrice = currentStock ? currentStock.currentPrice : holding.avgPurchasePrice
                          const totalCost = holding.quantity * holding.avgPurchasePrice
                          const currentValue = holding.quantity * currentPrice
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
                                  style={{ padding: '4px 8px' }}
                                  onClick={() => {
                                    const stock = stocks.find(s => s.ticker === holding.ticker)
                                    if (stock) {
                                      setSelectedStock(stock)
                                      setActiveTab('stocks')
                                    }
                                  }}
                                >
                                  Select & Trade
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: BROWSE STOCKS (Markets feed) */}
          {activeTab === 'stocks' && (
            <div className="card animate-fade">
              <div className="card-title-row">
                <h2>Market Assets Feed</h2>
                <button className="logout-btn" onClick={fetchStocksData}>Update Feed Prices</button>
              </div>

              {stocks.length === 0 ? (
                <p className="holdings-empty">Loading market feed data...</p>
              ) : (
                <div className="stocks-grid">
                  {stocks.map((stock) => (
                    <div
                      key={stock._id}
                      className={`stock-card ${selectedStock?.ticker === stock.ticker ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStock(stock)
                        setError('')
                        setSuccess('')
                      }}
                    >
                      <div className="stock-card-head">
                        <div>
                          <div className="stock-ticker">{stock.ticker}</div>
                          <div className="stock-name">{stock.companyName}</div>
                        </div>
                      </div>
                      <div>
                        <div className="stock-price">{formatCurrency(stock.currentPrice)}</div>
                        <div className="stock-stats">
                          <span>Cap: ${(stock.marketCap / 1e9).toFixed(1)}B</span>
                          <span>Vol: ${(stock.volume / 1e6).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STRATEGY LAB (DCA & Bracket Simulation Sandbox) */}
          {activeTab === 'strategy' && (
            <div className="card animate-fade">
              <div className="card-title-row">
                <h2>Strategy backtesting Lab</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Test financial strategies against 90-day simulated historical price data.
                </p>
              </div>

              <form onSubmit={runStrategySimulation} style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div className="hero-stats" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Select Asset</label>
                    <select 
                      className="form-input" 
                      value={selectedStock ? selectedStock.ticker : ''}
                      onChange={(e) => {
                        const stock = stocks.find(s => s.ticker === e.target.value)
                        setSelectedStock(stock || null)
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
                        style={{ background: strategyType === 'DCA' ? 'var(--accent-primary)' : 'var(--bg-primary)' }}
                        onClick={() => { setStrategyType('DCA'); setSimulationResult(null); }}
                      >
                        Dollar Cost Averaging (DCA)
                      </button>
                      <button
                        type="button"
                        className={`trade-type-btn ${strategyType === 'BRACKET' ? 'active' : ''}`}
                        style={{ background: strategyType === 'BRACKET' ? 'var(--accent-primary)' : 'var(--bg-primary)' }}
                        onClick={() => { setStrategyType('BRACKET'); setSimulationResult(null); }}
                      >
                        Bracket Order
                      </button>
                    </div>
                  </div>
                </div>

                {strategyType === 'DCA' ? (
                  <div className="hero-stats" style={{ gap: '16px', marginBottom: '20px' }}>
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
                  <div className="hero-stats" style={{ gap: '16px', marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                  {simulating ? 'Executing Simulation Model...' : 'Simulate Strategy performance'}
                </button>
              </form>

              {/* Simulation Result Output Panel */}
              {simulationResult && (
                <div className="animate-fade" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
                    Simulation Summary: {simulationResult.stock} ({simulationResult.type})
                  </h3>

                  <div className="hero-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
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
                      <span className="value" style={{ fontSize: '20px', color: simulationResult.profitLoss >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {simulationResult.profitLoss >= 0 ? '+' : ''}{formatCurrency(simulationResult.profitLoss || simulationResult.profitLossAmount)}
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
          )}

          {/* TAB 4: LEDGER HISTORY */}
          {activeTab === 'history' && (
            <div className="history-card animate-fade">
              <div className="tabs-header">
                <button
                  className={`tab-btn ${historyTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('orders')}
                >
                  Order Book Logs
                </button>
                <button
                  className={`tab-btn ${historyTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setHistoryTab('transactions')}
                >
                  Cash Transactions
                </button>
              </div>

              {historyTab === 'orders' ? (
                orders.length === 0 ? (
                  <p className="holdings-empty">No orders placed yet.</p>
                ) : (
                  <div className="holdings-table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Ticker</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total Amount</th>
                          <th>Execution Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{new Date(order.orderDate || Date.now()).toLocaleDateString()}</td>
                            <td><strong>{order.ticker}</strong></td>
                            <td>
                              <span className={`badge ${order.orderType.toLowerCase()}`}>
                                {order.orderType}
                              </span>
                            </td>
                            <td>{order.count}</td>
                            <td>{formatCurrency(order.price)}</td>
                            <td>{formatCurrency(order.totalPrice)}</td>
                            <td><span className="badge" style={{background: 'rgba(255, 255, 255, 0.05)'}}>{order.orderStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                transactions.length === 0 ? (
                  <p className="holdings-empty">No cash transactions logged yet.</p>
                ) : (
                  <div className="holdings-table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date/Time</th>
                          <th>Transaction Type</th>
                          <th>Amount</th>
                          <th>Payment Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, idx) => (
                          <tr key={idx}>
                            <td>{new Date(tx.time || Date.now()).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${tx.transactionType.toLowerCase()}`}>
                                {tx.transactionType}
                              </span>
                            </td>
                            <td>{formatCurrency(tx.amount)}</td>
                            <td>{tx.paymentMode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Selected Stock Details & Terminal Sidebar */}
        <section className="sidebar-section">
          {selectedStock ? (
            <div className="trade-card animate-fade">
              {/* Stock Details Panel (with dynamic SVG trend chart) */}
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
                    <span className="label" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Market Cap</span>
                    <strong style={{ fontSize: '14px' }}>${(selectedStock.marketCap / 1e9).toFixed(2)} Billion</strong>
                  </div>
                  <div>
                    <span className="label" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Volume (24h)</span>
                    <strong style={{ fontSize: '14px' }}>{(selectedStock.volume / 1e6).toFixed(2)} Million</strong>
                  </div>
                </div>
              </div>

              {/* Trading terminal panel */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                  Trading Terminal ({activePortfolio ? activePortfolio.portfolioName : 'No Portfolio'})
                </h3>

                <div className="trade-type-toggle">
                  <button
                    type="button"
                    className={`trade-type-btn buy ${tradeType === 'BUY' ? 'active' : ''}`}
                    onClick={() => setTradeType('BUY')}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className={`trade-type-btn sell ${tradeType === 'SELL' ? 'active' : ''}`}
                    onClick={() => setTradeType('SELL')}
                  >
                    Sell
                  </button>
                </div>

                <form onSubmit={handleTradeSubmit}>
                  <div className="trade-info-row">
                    <span className="label">Current Market Price</span>
                    <span className="value">{formatCurrency(selectedStock.currentPrice)}</span>
                  </div>
                  {tradeType === 'SELL' && (
                    <div className="trade-info-row">
                      <span className="label">Owned Shares</span>
                      <span className="value">{getHoldingQuantity(selectedStock.ticker)}</span>
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

                  <div className="trade-info-row divider total">
                    <span className="label">{tradeType === 'BUY' ? 'Est. Capital Cost' : 'Est. Account Return'}</span>
                    <span className="value">{formatCurrency(selectedStock.currentPrice * quantity)}</span>
                  </div>

                  <button
                    type="submit"
                    className={`trade-submit-btn ${tradeType.toLowerCase()}`}
                    disabled={
                      tradingLoading ||
                      !activePortfolio ||
                      (tradeType === 'BUY' && user.virtualCashBalance < selectedStock.currentPrice * quantity) ||
                      (tradeType === 'SELL' && getHoldingQuantity(selectedStock.ticker) < quantity)
                    }
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
                      Please create a portfolio in "Dashboard" tab to enable trade actions.
                    </p>
                  )}
                </form>

                {/* Direct anchor link to strategy lab backtester */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center' }}>
                  <button 
                    className="logout-btn" 
                    style={{ width: '100%', color: 'var(--accent-primary)', borderColor: 'var(--border-color-active)' }}
                    onClick={() => {
                      setActiveTab('strategy');
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
        </section>
      </main>
    </div>
  )
}

export default App
