import React, { createContext, useState, useEffect, useMemo } from 'react';
import axiosInstance from '../components/axiosInstance';

export const GeneralContext = createContext();

export function GeneralContextProvider({ children }) {
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

  // MFA states
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaQrCode, setMfaQrCode] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [tempMfaToken, setTempMfaToken] = useState('')
  const [showMfaLogin, setShowMfaLogin] = useState(false)

  // Forgot / Reset password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetPasswordVal, setResetPasswordVal] = useState('')
  const [resetPasswordConfirmVal, setResetPasswordConfirmVal] = useState('')
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false)

  // Demo feedback links
  const [demoVerificationLink, setDemoVerificationLink] = useState('')
  const [demoResetLink, setDemoResetLink] = useState('')

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
  
  // Navigation Routing: 'landing', 'home', 'portfolio', 'history', 'profile', 'admin', 'users', 'all-orders', 'all-transactions', 'strategy'
  const [currentPage, setCurrentPage] = useState('landing')
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

  // Admin Data states
  const [allUsers, setAllUsers] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [allTransactions, setAllTransactions] = useState([])

  // Save session
  useEffect(() => {
    if (user) {
      localStorage.setItem('user_session', JSON.stringify(user))
      // Redirect to home if on landing
      if (currentPage === 'landing') {
        setCurrentPage('home')
      }
    } else {
      localStorage.removeItem('user_session')
      setCurrentPage('landing')
    }
  }, [user])

  // Load app data once logged in
  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchStocksData()
      if (user.userType === 'admin') {
        fetchAdminData()
      }
    } else {
      setPortfolios([])
      setSelectedPortfolioId('')
      setStocks([])
      setSelectedStock(null)
      setOrders([])
      setTransactions([])
      setSimulationResult(null)
      setDemoVerificationLink('')
      setDemoResetLink('')
      setShowMfaLogin(false)
      setAllUsers([])
      setAllOrders([])
      setAllTransactions([])
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    try {
      setError('')
      const portRes = await axiosInstance.get(`/api/auth/portfolios/${user._id}`);
      setPortfolios(portRes.data);
      if (portRes.data.length > 0) {
        setSelectedPortfolioId((prev) => prev || portRes.data[0]._id)
      }
      
      const ordersRes = await axiosInstance.get('/api/trade/order');
      setOrders(ordersRes.data);

      const txRes = await axiosInstance.get('/api/transactions');
      setTransactions(txRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user data')
    }
  }

  const fetchStocksData = async () => {
    try {
      const res = await axiosInstance.get('/api/stocks');
      setStocks(res.data);
      if (res.data.length > 0) {
        setSelectedStock((prev) => prev || res.data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch stocks list')
    }
  }

  const fetchAdminData = async () => {
    try {
      const usersRes = await axiosInstance.get('/api/auth/users');
      setAllUsers(usersRes.data);

      const ordersRes = await axiosInstance.get('/api/trade/order/all');
      setAllOrders(ordersRes.data);

      const txRes = await axiosInstance.get('/api/transactions/all');
      setAllTransactions(txRes.data);
    } catch (err) {
      console.warn("Failed to load admin stats:", err.response?.data?.message || err.message);
    }
  }

  // Derived calculations
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

  // Authentication Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password });
      if (res.data.requiresMfa) {
        setTempMfaToken(res.data.mfaToken);
        setShowMfaLogin(true);
        setSuccess('Please enter your 2-Factor Authentication code.');
      } else {
        setUser(res.data);
        setSuccess('Logged in successfully!');
        setShowAuth(false);
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/register', { username, email, password, userType: 'user' });
      setSuccess('Registration successful! Please check the server console for your verification link.');
      if (res.data.demoVerificationLink) {
        setDemoVerificationLink(res.data.demoVerificationLink);
      }
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const handleMfaLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/mfa/login-verify', { mfaToken: tempMfaToken, code: mfaCode });
      setUser(res.data);
      setSuccess('Logged in successfully with 2FA!');
      setShowMfaLogin(false);
      setTempMfaToken('');
      setMfaCode('');
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/forgot-password', { email: forgotEmail });
      setSuccess(res.data.message || 'Password reset link sent!');
      if (res.data.demoResetLink) {
        setDemoResetLink(res.data.demoResetLink);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (resetPasswordVal !== resetPasswordConfirmVal) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/api/auth/reset-password/${resetToken}`, { password: resetPasswordVal });
      setSuccess(res.data.message || 'Password reset successful! You can now log in.');
      setResetPasswordVal('');
      setResetPasswordConfirmVal('');
      setResetToken('');
      setShowResetPasswordForm(false);
      setIsRegister(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  const handleResendVerification = async () => {
    if (!user) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/resend-verification');
      setSuccess(res.data.message || 'Verification link resent!');
      if (res.data.demoVerificationLink) {
        setDemoVerificationLink(res.data.demoVerificationLink);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend verification');
    } finally {
      setLoading(false);
    }
  }

  const handleSetupMfa = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/api/auth/mfa/setup');
      setMfaSecret(res.data.secret);
      setMfaQrCode(res.data.qrCode);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initiate MFA setup');
    }
  }

  const handleVerifyEnableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/api/auth/mfa/verify', { code: mfaCode });
      setSuccess(res.data.message || 'MFA enabled successfully!');
      setUser(current => {
        const updated = { ...current, isMfaEnabled: true };
        localStorage.setItem('user_session', JSON.stringify(updated));
        return updated;
      });
      setMfaSecret('');
      setMfaQrCode('');
      setMfaCode('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify MFA code');
    }
  }

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/api/auth/mfa/disable', { code: mfaCode });
      setSuccess(res.data.message || 'MFA disabled successfully!');
      setUser(current => {
        const updated = { ...current, isMfaEnabled: false };
        localStorage.setItem('user_session', JSON.stringify(updated));
        return updated;
      });
      setMfaCode('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable MFA');
    }
  }

  // App handlers
  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    setError('');
    try {
      const res = await axiosInstance.post('/api/auth/portfolios', { portfolioName: newPortfolioName });
      setPortfolios([...portfolios, res.data]);
      setSelectedPortfolioId(res.data._id);
      setNewPortfolioName('');
      setSuccess(`Portfolio "${res.data.portfolioName}" created!`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create portfolio');
    }
  }

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!selectedPortfolioId) {
      setError('Please select or create a portfolio first');
      return;
    }
    if (!selectedStock) {
      setError('Please select a stock to trade');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    setTradingLoading(true);
    try {
      const orderData = {
        portfolioId: selectedPortfolioId,
        ticker: selectedStock.ticker,
        companyName: selectedStock.companyName,
        price: selectedStock.currentPrice,
        count: parseInt(quantity),
        stockType: 'COMMON',
        orderType: tradeType
      };
      
      const res = await axiosInstance.post('/api/trade/order', orderData);
      
      const tradeAmount = selectedStock.currentPrice * parseInt(quantity);
      setUser(current => {
        const updated = {
          ...current,
          virtualCashBalance: tradeType === 'BUY' 
            ? current.virtualCashBalance - tradeAmount 
            : current.virtualCashBalance + tradeAmount
        };
        localStorage.setItem('user_session', JSON.stringify(updated));
        return updated;
      });

      setSuccess(`Order executed: ${tradeType} ${quantity} shares of ${selectedStock.ticker}`);
      setQuantity(1);
      await fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Order failed to execute');
    } finally {
      setTradingLoading(false);
    }
  }

  const handleDeposit = async (amount, paymentMode) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/deposit', { amount, paymentMode });
      setUser(current => {
        const updated = { ...current, virtualCashBalance: res.data.user.virtualCashBalance };
        localStorage.setItem('user_session', JSON.stringify(updated));
        return updated;
      });
      setSuccess(res.data.message);
      await fetchUserData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Deposit failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    setSuccess('Logged out successfully.');
    setError('');
    setCurrentPage('landing');
    setShowAuth(false);
    setShowMfaLogin(false);
    setTempMfaToken('');
  }

  const handleVerifyEmailToken = async (token) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.get(`/api/auth/verify-email/${token}`);
      setSuccess(res.data.message || 'Email verified successfully!');
      setUser(current => {
        if (current) {
          const updated = { ...current, isVerified: true };
          localStorage.setItem('user_session', JSON.stringify(updated));
          return updated;
        }
        return null;
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneralContext.Provider value={{
      user, setUser,
      showAuth, setShowAuth,
      isRegister, setIsRegister,
      username, setUsername,
      email, setEmail,
      password, setPassword,
      
      mfaSecret, setMfaSecret,
      mfaQrCode, setMfaQrCode,
      mfaCode, setMfaCode,
      tempMfaToken, setTempMfaToken,
      showMfaLogin, setShowMfaLogin,

      showForgotPassword, setShowForgotPassword,
      forgotEmail, setForgotEmail,
      resetToken, setResetToken,
      resetPasswordVal, setResetPasswordVal,
      resetPasswordConfirmVal, setResetPasswordConfirmVal,
      showResetPasswordForm, setShowResetPasswordForm,

      demoVerificationLink, setDemoVerificationLink,
      demoResetLink, setDemoResetLink,

      portfolios, setPortfolios,
      selectedPortfolioId, setSelectedPortfolioId,
      newPortfolioName, setNewPortfolioName,
      stocks, setStocks,
      selectedStock, setSelectedStock,
      tradeType, setTradeType,
      quantity, setQuantity,
      orders, setOrders,
      transactions, setTransactions,
      currentPage, setCurrentPage,
      historyTab, setHistoryTab,

      strategyType, setStrategyType,
      dcaAmount, setDcaAmount,
      dcaInterval, setDcaInterval,
      dcaDuration, setDcaDuration,
      bracketProfit, setBracketProfit,
      bracketLoss, setBracketLoss,
      bracketAmount, setBracketAmount,
      simulationResult, setSimulationResult,

      error, setError,
      success, setSuccess,
      loading, setLoading,
      tradingLoading, setTradingLoading,
      simulating, setSimulating,

      allUsers, setAllUsers,
      allOrders, setAllOrders,
      allTransactions, setAllTransactions,

      activePortfolio,
      portfolioHoldingsValue,
      totalPortfolioValue,

      fetchUserData,
      fetchStocksData,
      fetchAdminData,
      handleLogin,
      handleRegister,
      handleMfaLogin,
      handleForgotPassword,
      handleResetPassword,
      handleResendVerification,
      handleSetupMfa,
      handleVerifyEnableMfa,
      handleDisableMfa,
      handleCreatePortfolio,
      handleTradeSubmit,
      handleDeposit,
      handleLogout,
      handleVerifyEmailToken
    }}>
      {children}
    </GeneralContext.Provider>
  )
}
