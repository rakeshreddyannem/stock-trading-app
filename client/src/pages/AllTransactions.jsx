import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function AllTransactions() {
  const { allTransactions, setCurrentPage } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="card animate-fade">
      <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>💸 Cash Movement Ledger Logs</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All cash transactions executing across the system.</p>
        </div>
        <button onClick={() => setCurrentPage('admin')} className="logout-btn" style={{ padding: '6px 12px' }}>
          ← Back to Admin
        </button>
      </div>

      {allTransactions.length === 0 ? (
        <p className="holdings-empty">No transactions logged.</p>
      ) : (
        <div className="holdings-table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>User ID</th>
                <th>Transaction Type</th>
                <th>Amount</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((tx, idx) => (
                <tr key={idx}>
                  <td>{new Date(tx.time || Date.now()).toLocaleString()}</td>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{tx.userId}</td>
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
      )}
    </div>
  );
}
