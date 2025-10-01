import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Consolidated styles to reduce excessive inline styling
const styles = {
  container: {
    maxWidth: 900,
    margin: '2rem auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    padding: '2rem',
  },
  title: {
    color: '#FFD700',
    fontWeight: 800,
    fontSize: '2rem',
    marginBottom: 18,
    textAlign: 'center',
  },
  empty: { textAlign: 'center', color: '#888', fontSize: '1.1rem', padding: '2rem 0' },
  card: {
    marginBottom: '1.5rem',
    border: '1px solid #FFD700',
    background: '#fffbe6',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    padding: '1rem 1.2rem',
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontWeight: 600 },
  status: (status) => ({ fontWeight: 600, color: status === 'Delivered' ? '#1a7f37' : '#b8860b' }),
  section: { marginTop: 10 },
  meta: { fontSize: '1.08rem', marginBottom: 12 },
  itemsTitle: { margin: '1rem 0 0.5rem 0', fontWeight: 600 },
  list: { paddingLeft: 18, margin: 0 },
  listItem: { fontSize: '1rem', marginBottom: 4 },
  total: { fontWeight: 700, fontSize: '1.1rem', color: '#232F3E', textAlign: 'right', marginTop: 12 },
  button: {
    background: '#FFD700',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    padding: '0.6rem 1.2rem',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: 10,
  },
  center: { padding: 40, textAlign: 'center' },
  error: { padding: 40, textAlign: 'center', color: 'red' },
  errorDetails: { color: '#8b0000', marginTop: 8, fontSize: '0.95rem' },
  actions: { marginTop: 12, display: 'flex', justifyContent: 'center', gap: 12 },
  skeletonCard: {
    marginBottom: '1.5rem',
    borderRadius: 12,
    padding: '1rem 1.2rem',
    background: 'linear-gradient(90deg, #f4f4f4 25%, #eaeaea 37%, #f4f4f4 63%)',
    backgroundSize: '400% 100%',
    animation: 'skeleton-loading 1.4s ease infinite',
  },
};

const formatCurrency = (amount, currency = 'TZS') => {
  try {
    const value = Number(amount || 0);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    // Fallback in case of unsupported currency code
    return `${currency} ${amount ?? 0}`;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString();
};

// Helpers to normalize and style order status
const toTitleCase = (s) => String(s || '')
  .toLowerCase()
  .replace(/(^|\s)\w/g, (m) => m.toUpperCase());

const getStatusInfo = (rawStatus) => {
  const s = String(rawStatus || 'pending').trim().toLowerCase();
  switch (s) {
    case 'confirmed':
      return { label: 'Confirmed', color: '#1a7f37' }; // green
    case 'delivered':
      return { label: 'Delivered', color: '#1a7f37' }; // green
    case 'cancelled':
    case 'canceled':
      return { label: 'Cancelled', color: '#d32f2f' }; // red
    case 'pending':
    default:
      return { label: toTitleCase(s), color: '#b8860b' }; // amber
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view orders.');
      setLoading(false);
  navigate('/login', { replace: true });
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/orders/my`, {
        headers,
        credentials: 'include',
        signal,
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        setError('Your session has expired. Please log in again.');
        setLoading(false);
  navigate('/login', { replace: true });
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const hasBody = ![204, 205].includes(res.status);

      let payload = null;
      if (hasBody && isJson) {
        try {
          payload = await res.json();
        } catch (e) {
          throw new Error('Failed to parse server response');
        }
      }

      if (!res.ok) {
        const message = (payload && (payload.message || payload.error)) || `Request failed: ${res.status}`;
        throw new Error(message);
      }

      const list =
        Array.isArray(payload) ? payload :
        Array.isArray(payload?.orders) ? payload.orders :
        Array.isArray(payload?.data) ? payload.data : [];

      setOrders(list);
      setError(null);
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      setError(err?.message || 'Failed to load orders');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchOrders(controller.signal);

    return () => controller.abort();
  }, [fetchOrders, reloadKey]);

  // Lightweight polling to keep order statuses up to date (every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setReloadKey((k) => k + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Orders</h2>
        <div>
          <div style={styles.skeletonCard} />
          <div style={styles.skeletonCard} />
          <div style={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Orders</h2>
        <div style={styles.error}>
          Failed to load orders
          <div style={styles.errorDetails}>{String(error)}</div>
          <div style={styles.actions}>
            <button style={styles.button} onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Orders</h2>
      {orders.length === 0 ? (
        <div style={styles.empty}>No orders found.</div>
      ) : (
        orders.map((order) => {
          const id = order._id || order.id;
          const { label: statusLabel, color: statusColor } = getStatusInfo(order.status);
          const address = order.customer?.address || order.shippingAddress || '-';
          const phone = order.customer?.phone || order.contactNumber || order.phone || '-';
          const date = order.orderDate || order.createdAt || order.date;
          const items = order.items || order.orderItems || order.cartItems || [];
          const total = order.total ?? order.totalPrice ?? order.amount ?? 0;
          const currency = order.currency || 'TZS';

          return (
            <div key={id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.orderId}><strong>Order ID:</strong> {id}</span>
                <span style={{ fontWeight: 600, color: statusColor }}>{statusLabel}</span>
              </div>
              <div style={styles.section}>
                <div style={styles.meta}><strong>Delivery Address:</strong> {address}</div>
                <div style={styles.meta}><strong>Phone:</strong> {phone}</div>
                <div style={styles.meta}><strong>Order Date:</strong> {formatDateTime(date)}</div>
                <h4 style={styles.itemsTitle}>Items:</h4>
                <ul style={styles.list}>
                  {items.map((item, idx) => (
                    <li
                      key={item?._id || item?.id || `${item?.name || 'item'}-${idx}`}
                      style={styles.listItem}
                    >
                      {item?.name || 'Item'} x {item?.quantity ?? 0}
                    </li>
                  ))}
                </ul>
                <div style={styles.total}>Total: {formatCurrency(total, currency)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Keyframes for skeleton animation (inline style injection)
const styleId = 'orders-skeleton-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.innerHTML = `
    @keyframes skeleton-loading {
      0% { background-position: 100% 50%; }
      100% { background-position: 0 50%; }
    }
  `;
  document.head.appendChild(styleEl);
}
