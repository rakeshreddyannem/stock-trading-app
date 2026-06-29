import React, { useContext, useState } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function Funds() {
  const {
    user,
    loading,
    handleDeposit,
    handleWithdraw
  } = useContext(GeneralContext);

  const [fundAction, setFundAction] = useState('DEPOSIT'); // 'DEPOSIT' or 'WITHDRAW'
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [fundAmount, setFundAmount] = useState(5000);
  
  // Simulated credentials states
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const handleFundActionSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (fundAmount <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }

    // Basic validators for credentials
    if (paymentMode === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setFormError('Please enter a valid UPI ID (e.g. user@upi).');
        return;
      }
    } else if (paymentMode === 'NET_BANKING') {
      if (fundAction === 'WITHDRAW' && (!bankAccountNum.trim() || isNaN(bankAccountNum))) {
        setFormError('Please enter a valid bank account number.');
        return;
      }
    } else if (paymentMode === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16 || isNaN(cleanCard)) {
        setFormError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        setFormError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length !== 3 || isNaN(cardCvv)) {
        setFormError('Please enter a valid 3-digit CVV code.');
        return;
      }
    }

    if (fundAction === 'DEPOSIT') {
      const success = await handleDeposit(fundAmount, paymentMode);
      if (success) {
        setFormSuccess(`Successfully deposited $${fundAmount.toLocaleString()}!`);
        resetFields();
      }
    } else {
      if (user.virtualCashBalance < fundAmount) {
        setFormError('Insufficient balance to make this withdrawal.');
        return;
      }
      const success = await handleWithdraw(fundAmount, paymentMode);
      if (success) {
        setFormSuccess(`Successfully withdrew $${fundAmount.toLocaleString()}!`);
        resetFields();
      }
    }
  };

  const resetFields = () => {
    setUpiId('');
    setBankAccountNum('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleQuickAmount = (amount) => {
    setFundAmount(amount);
    setFormError('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="funds-page animate-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Funds Management Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💳 Funds Management</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Increase or decrease your simulator balance by adding or withdrawing funds.
        </p>

        {/* Current Balance Display */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Current Cash Balance</span>
          <strong style={{ fontSize: '22px', color: 'var(--accent-success)' }}>{formatCurrency(user?.virtualCashBalance || 0)}</strong>
        </div>

        {/* Deposit/Withdraw Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setFundAction('DEPOSIT'); setFormError(''); setFormSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: fundAction === 'DEPOSIT' ? '2px solid var(--accent-primary)' : 'none',
              color: fundAction === 'DEPOSIT' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            📥 Deposit Funds
          </button>
          <button
            type="button"
            onClick={() => { setFundAction('WITHDRAW'); setFormError(''); setFormSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: fundAction === 'WITHDRAW' ? '2px solid var(--accent-primary)' : 'none',
              color: fundAction === 'WITHDRAW' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            📤 Withdraw Funds
          </button>
        </div>

        {formError && <div className="status-message error" style={{ marginBottom: '20px' }}>{formError}</div>}
        {formSuccess && <div className="status-message success" style={{ marginBottom: '20px' }}>{formSuccess}</div>}

        <form onSubmit={handleFundActionSubmit}>
          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Payment Mode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setPaymentMode('UPI'); setFormError(''); setFormSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '12px 4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: paymentMode === 'UPI' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  border: '1px solid var(--border-color)'
                }}
              >
                📱 UPI
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMode('NET_BANKING'); setFormError(''); setFormSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '12px 4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: paymentMode === 'NET_BANKING' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  border: '1px solid var(--border-color)'
                }}
              >
                🏦 Net Banking
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMode('CARD'); setFormError(''); setFormSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '12px 4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: paymentMode === 'CARD' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  border: '1px solid var(--border-color)'
                }}
              >
                💳 Card
              </button>
            </div>
          </div>

          {/* Quick Amount Selections */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Quick Select Amount</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[1000, 5000, 10000, 50000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  style={{
                    padding: '10px 2px',
                    background: fundAmount === amt ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                    border: fundAmount === amt ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
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
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="fund-amount" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Amount ($)</label>
            <input
              id="fund-amount"
              type="number"
              min="1"
              className="form-input"
              value={fundAmount}
              onChange={(e) => setFundAmount(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />
          </div>

          {/* Dynamic Credentials Inputs */}
          {paymentMode === 'UPI' && (
            <div className="form-group animate-fade" style={{ marginBottom: '24px' }}>
              <label htmlFor="upi-id" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>UPI ID</label>
              <input
                id="upi-id"
                type="text"
                className="form-input"
                placeholder="username@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
          )}

          {paymentMode === 'NET_BANKING' && (
            <div className="animate-fade" style={{ marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="bank-select" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Select Bank</label>
                <select
                  id="bank-select"
                  className="form-input"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  required
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Federal Bank">Federal Bank</option>
                </select>
              </div>
              {fundAction === 'WITHDRAW' && (
                <div className="form-group">
                  <label htmlFor="bank-acct" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Bank Account Number</label>
                  <input
                    id="bank-acct"
                    type="text"
                    placeholder="1234567890"
                    className="form-input"
                    value={bankAccountNum}
                    onChange={(e) => setBankAccountNum(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {paymentMode === 'CARD' && (
            <div className="animate-fade" style={{ marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="card-num" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Card Number</label>
                <input
                  id="card-num"
                  type="text"
                  maxLength="16"
                  className="form-input"
                  placeholder="1234567890123456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="card-exp" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                  <input
                    id="card-exp"
                    type="text"
                    maxLength="5"
                    placeholder="MM/YY"
                    className="form-input"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="card-cvv" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CVV</label>
                  <input
                    id="card-cvv"
                    type="password"
                    maxLength="3"
                    placeholder="***"
                    className="form-input"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="portfolio-btn"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 'bold' }}
            disabled={loading || !user?.isVerified}
          >
            {loading 
              ? `${fundAction === 'DEPOSIT' ? 'Processing Deposit...' : 'Processing Withdrawal...'}` 
              : `${fundAction === 'DEPOSIT' ? `Deposit ${formatCurrency(fundAmount)}` : `Withdraw ${formatCurrency(fundAmount)}`}`
            }
          </button>
          {user && !user.isVerified && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
              Please verify your account email to unlock funds management capabilities.
            </p>
          )}
        </form>
      </div>

    </div>
  );
}
