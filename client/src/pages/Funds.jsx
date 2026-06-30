import React, { useContext, useState } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Funds() {
  const {
    user,
    loading,
    handleDeposit,
    handleWithdraw
  } = useContext(GeneralContext);

  // Deposit Form States
  const [depositMode, setDepositMode] = useState('UPI');
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depSelectedBank, setDepSelectedBank] = useState('State Bank of India');
  const [depCardNumber, setDepCardNumber] = useState('');
  const [depCardExpiry, setDepCardExpiry] = useState('');
  const [depCardCvv, setDepCardCvv] = useState('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depError, setDepError] = useState('');

  // Withdrawal Form States
  const [withdrawMode, setWithdrawMode] = useState('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [withSelectedBank, setWithSelectedBank] = useState('State Bank of India');
  const [withBankAccountNum, setWithBankAccountNum] = useState('');
  const [withCardNumber, setWithCardNumber] = useState('');
  const [withCardExpiry, setWithCardExpiry] = useState('');
  const [withCardCvv, setWithCardCvv] = useState('');
  const [withSuccess, setWithSuccess] = useState('');
  const [withError, setWithError] = useState('');

  // Handle Deposit Submission
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepSuccess('');
    setDepError('');

    if (depositAmount <= 0) {
      setDepError('Please enter a valid deposit amount greater than zero.');
      return;
    }

    if (depositMode === 'CARD') {
      const cleanCard = depCardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16 || isNaN(cleanCard)) {
        setDepError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!depCardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        setDepError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (depCardCvv.length !== 3 || isNaN(depCardCvv)) {
        setDepError('Please enter a valid 3-digit CVV code.');
        return;
      }
    }

    const success = await handleDeposit(depositAmount, depositMode);
    if (success) {
      setDepSuccess(`Successfully deposited $${depositAmount.toLocaleString()}!`);
      resetDepositFields();
    }
  };

  // Handle Withdrawal Submission
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithSuccess('');
    setWithError('');

    if (withdrawAmount <= 0) {
      setWithError('Please enter a valid withdrawal amount greater than zero.');
      return;
    }

    if (withdrawMode === 'NET_BANKING') {
      if (!withBankAccountNum.trim() || isNaN(withBankAccountNum)) {
        setWithError('Please enter a valid bank account number.');
        return;
      }
    } else if (withdrawMode === 'CARD') {
      const cleanCard = withCardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16 || isNaN(cleanCard)) {
        setWithError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!withCardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        setWithError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (withCardCvv.length !== 3 || isNaN(withCardCvv)) {
        setWithError('Please enter a valid 3-digit CVV code.');
        return;
      }
    }

    if (user.virtualCashBalance < withdrawAmount) {
      setWithError('Insufficient balance to make this withdrawal.');
      return;
    }

    const success = await handleWithdraw(withdrawAmount, withdrawMode);
    if (success) {
      setWithSuccess(`Successfully withdrew $${withdrawAmount.toLocaleString()}!`);
      resetWithdrawFields();
    }
  };

  const resetDepositFields = () => {
    setDepCardNumber('');
    setDepCardExpiry('');
    setDepCardCvv('');
  };

  const resetWithdrawFields = () => {
    setWithBankAccountNum('');
    setWithCardNumber('');
    setWithCardExpiry('');
    setWithCardCvv('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="funds-page animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Current Balance Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>💰 Funds Dashboard</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage your deposits and withdrawals in one place.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Current Cash Balance</span>
            <strong style={{ fontSize: '24px', color: 'var(--accent-success)' }}>{formatCurrency(user?.virtualCashBalance || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Two-Column Grid for forms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Column 1: Add Funds Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '18px' }}>📥 Add Funds</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Deposit money to your cash balance instantly.
          </p>

          {depError && <div className="status-message error" style={{ marginBottom: '16px' }}>{depError}</div>}
          {depSuccess && <div className="status-message success" style={{ marginBottom: '16px' }}>{depSuccess}</div>}

          <form onSubmit={handleDepositSubmit}>
            {/* Payment Method Selector */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Payment Mode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['UPI', 'NET_BANKING', 'CARD'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setDepositMode(mode); setDepError(''); setDepSuccess(''); }}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: depositMode === mode ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: '#fff',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {mode === 'UPI' && '📱 UPI'}
                    {mode === 'NET_BANKING' && '🏦 Net Bank'}
                    {mode === 'CARD' && '💳 Card'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Amount Selections */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Quick Select Amount</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[1000, 5000, 10000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setDepositAmount(amt); setDepError(''); }}
                    style={{
                      padding: '8px 2px',
                      background: depositAmount === amt ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      border: depositAmount === amt ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Amount */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="dep-amount" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Amount ($)</label>
              <input
                id="dep-amount"
                type="number"
                min="1"
                className="form-input"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(1, parseInt(e.target.value) || 0))}
                required
              />
            </div>

            {/* Dynamic Credentials Inputs */}
            {depositMode === 'UPI' && (
              <div className="form-group animate-fade" style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Proceed to complete deposit via secure UPI gateway.
                </p>
              </div>
            )}

            {depositMode === 'NET_BANKING' && (
              <div className="form-group animate-fade" style={{ marginBottom: '20px' }}>
                <label htmlFor="dep-bank-select" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Select Bank</label>
                <select
                  id="dep-bank-select"
                  className="form-input"
                  value={depSelectedBank}
                  onChange={(e) => setDepSelectedBank(e.target.value)}
                  required
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Federal Bank">Federal Bank</option>
                </select>
              </div>
            )}

            {depositMode === 'CARD' && (
              <div className="animate-fade" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="dep-card-num" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Card Number</label>
                  <input
                    id="dep-card-num"
                    type="text"
                    maxLength="16"
                    className="form-input"
                    placeholder="1234567890123456"
                    value={depCardNumber}
                    onChange={(e) => setDepCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="dep-card-exp" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                    <input
                      id="dep-card-exp"
                      type="text"
                      maxLength="5"
                      placeholder="MM/YY"
                      className="form-input"
                      value={depCardExpiry}
                      onChange={(e) => setDepCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dep-card-cvv" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CVV</label>
                    <input
                      id="dep-card-cvv"
                      type="password"
                      maxLength="3"
                      placeholder="***"
                      className="form-input"
                      value={depCardCvv}
                      onChange={(e) => setDepCardCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="portfolio-btn"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? 'Processing Deposit...' : `Deposit ${formatCurrency(depositAmount)}`}
            </button>
          </form>
        </div>

        {/* Column 2: Withdraw Funds Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '18px' }}>📤 Withdraw Funds</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Withdraw money from your cash balance.
          </p>

          {withError && <div className="status-message error" style={{ marginBottom: '16px' }}>{withError}</div>}
          {withSuccess && <div className="status-message success" style={{ marginBottom: '16px' }}>{withSuccess}</div>}

          <form onSubmit={handleWithdrawSubmit}>
            {/* Payment Method Selector */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Payment Mode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['UPI', 'NET_BANKING', 'CARD'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setWithdrawMode(mode); setWithError(''); setWithSuccess(''); }}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: withdrawMode === mode ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: '#fff',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {mode === 'UPI' && '📱 UPI'}
                    {mode === 'NET_BANKING' && '🏦 Net Bank'}
                    {mode === 'CARD' && '💳 Card'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Amount Selections */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Quick Select Amount</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[1000, 5000, 10000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setWithdrawAmount(amt); setWithError(''); }}
                    style={{
                      padding: '8px 2px',
                      background: withdrawAmount === amt ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      border: withdrawAmount === amt ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Amount */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="with-amount" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Amount ($)</label>
              <input
                id="with-amount"
                type="number"
                min="1"
                className="form-input"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Math.max(1, parseInt(e.target.value) || 0))}
                required
              />
            </div>

            {/* Dynamic Credentials Inputs */}
            {withdrawMode === 'UPI' && (
              <div className="form-group animate-fade" style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Proceed to complete withdrawal to your linked UPI address.
                </p>
              </div>
            )}

            {withdrawMode === 'NET_BANKING' && (
              <div className="animate-fade" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="with-bank-select" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Select Bank</label>
                  <select
                    id="with-bank-select"
                    className="form-input"
                    value={withSelectedBank}
                    onChange={(e) => setWithSelectedBank(e.target.value)}
                    required
                  >
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="with-bank-acct" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Bank Account Number</label>
                  <input
                    id="with-bank-acct"
                    type="text"
                    placeholder="1234567890"
                    className="form-input"
                    value={withBankAccountNum}
                    onChange={(e) => setWithBankAccountNum(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {withdrawMode === 'CARD' && (
              <div className="animate-fade" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="with-card-num" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Card Number</label>
                  <input
                    id="with-card-num"
                    type="text"
                    maxLength="16"
                    className="form-input"
                    placeholder="1234567890123456"
                    value={withCardNumber}
                    onChange={(e) => setWithCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="with-card-exp" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                    <input
                      id="with-card-exp"
                      type="text"
                      maxLength="5"
                      placeholder="MM/YY"
                      className="form-input"
                      value={withCardExpiry}
                      onChange={(e) => setWithCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="with-card-cvv" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CVV</label>
                    <input
                      id="with-card-cvv"
                      type="password"
                      maxLength="3"
                      placeholder="***"
                      className="form-input"
                      value={withCardCvv}
                      onChange={(e) => setWithCardCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="portfolio-btn"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? 'Processing Withdrawal...' : `Withdraw ${formatCurrency(withdrawAmount)}`}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
