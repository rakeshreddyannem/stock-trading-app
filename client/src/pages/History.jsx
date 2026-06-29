import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function History() {
  const {
    orders,
    transactions,
    historyTab,
    setHistoryTab
  } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="history-card animate-fade card">
      <div className="tabs-header" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${historyTab === 'orders' ? 'active' : ''}`}
          onClick={() => setHistoryTab('orders')}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: historyTab === 'orders' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: historyTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Order Book Logs
        </button>
        <button
          className={`tab-btn ${historyTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setHistoryTab('transactions')}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: historyTab === 'transactions' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: historyTab === 'transactions' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
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
  );
}
