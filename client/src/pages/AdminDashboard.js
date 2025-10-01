import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleConfirm = async (orderId) => {
    setConfirming(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: 'confirmed' } : o));
      }
    } catch {
      alert('Failed to confirm order');
    } finally {
      setConfirming('');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 24 }}>Admin Dashboard</h1>
      {loading ? <div>Loading orders...</div> : error ? <div style={{ color: 'crimson' }}>{error}</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#FFD700', color: '#222' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Order ID</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Customer</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Items</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Total</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ background: order.status === 'confirmed' ? '#e6ffe6' : '#fff' }}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{order._id}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{order.customer?.name}<br />{order.customer?.email}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.name} ({item.size}) x {item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>TZS {order.total}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{order.status}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {order.status !== 'confirmed' && (
                    <button
                      style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}
                      disabled={!!confirming}
                      onClick={() => handleConfirm(order._id)}
                    >{confirming === order._id ? 'Confirming...' : 'Confirm'}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
