import React, { useContext } from 'react';
import { GeneralContext } from '../context/GeneralContext';

export default function AllOrders() {
  const { allOrders, setCurrentPage } = useContext(GeneralContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="card animate-fade">
      <div className="card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>📜 Global Order Book Logs</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All user orders executed in the simulation.</p>
        </div>
        <button onClick={() => setCurrentPage('admin')} className="logout-btn" style={{ padding: '6px 12px' }}>
          ← Back to Admin
        </button>
      </div>

      {allOrders.length === 0 ? (
        <p className="holdings-empty">No orders logged.</p>
      ) : (
        <div className="holdings-table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User ID</th>
                <th>Ticker</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order, idx) => (
                <tr key={idx}>
                  <td>{new Date(order.orderDate || Date.now()).toLocaleDateString()}</td>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{order.userId}</td>
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
      )}
    </div>
  );
}
