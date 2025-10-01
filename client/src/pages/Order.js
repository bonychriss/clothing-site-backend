import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const styles = {
  container: { maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '2rem' },
  title: { color: '#FFD700', fontWeight: 800, fontSize: '1.6rem', marginBottom: 18, textAlign: 'center' },
  sectionTitle: { fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 },
  itemsList: { listStyle: 'none', padding: 0, marginBottom: 12 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 },
  itemImage: { width: 48, height: 48, objectFit: 'cover', borderRadius: 8 },
  itemName: { fontWeight: 700, fontSize: '1rem', color: '#222' },
  itemMeta: { color: '#555', fontSize: '0.95rem' },
  price: { color: '#FFD700', fontWeight: 700 },
  total: { fontWeight: 800, fontSize: '1.1rem', color: '#232F3E', textAlign: 'right' },
  label: { fontWeight: 700, color: '#222', marginBottom: 6 },
  statusWrap: { marginTop: 24, fontWeight: 700, color: '#232F3E', fontSize: '1.1rem' },
  statusVal: { color: '#FFD700' },
  center: { padding: 40, textAlign: 'center' },
  error: { padding: 40, textAlign: 'center', color: 'red' },
  breadcrumb: { textAlign: 'center', marginBottom: 8, color: '#555' },
  stepsWrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0' },
  stepCol: { flex: 1, textAlign: 'center', position: 'relative' },
  stepBar: (active) => ({ height: 8, background: active ? '#FFD700' : '#eee', borderRadius: 4, margin: '0 8px' }),
  stepLabel: (active) => ({ marginTop: 8, fontWeight: active ? 800 : 600, color: active ? '#232F3E' : '#8a8a8a' }),
  backBtn: { marginTop: 12, background: '#eee', border: '1px solid #ddd', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer' },
};

const formatCurrency = (amount, currency = 'TZS') => {
  try {
    const value = Number(amount || 0);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${amount ?? 0}`;
  }
};

export default function Order() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialOrder = location.state?.order || null;
  const [order, setOrder] = React.useState(initialOrder);
  const [loading, setLoading] = React.useState(!initialOrder);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (order) return; // Already have order from navigation state

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view this order.');
      setLoading(false);
  navigate('/login', { replace: true });
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          navigate('/login', { replace: true });
          return;
        }
        if (!res.ok) throw new Error(`Failed to fetch order (${res.status})`);
        const data = await res.json();
        setOrder(data || null);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [order, orderId, navigate]);

  if (loading) return <div style={styles.center}>Loading order...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!order) return <div style={styles.center}>No order found.</div>;

  const steps = ['Pending', 'Confirmed', 'Delivered'];
  const status = (order.status || 'Pending').toString();
  const current = Math.max(0, steps.findIndex(s => s.toLowerCase() === status.toLowerCase()));
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>Order #{order._id || order.id}</div>
      <h2 style={styles.title}>Order Tracking</h2>

      {/* Tracking steps */}
      <div style={styles.stepsWrap}>
        {steps.map((label, idx) => (
          <div key={label} style={styles.stepCol}>
            <div style={styles.stepBar(idx <= current)} />
            <div style={styles.stepLabel(idx <= current)}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={styles.sectionTitle}>Items</div>
        <ul style={styles.itemsList}>
          {items.map((item, idx) => (
            <li key={item._id || item.id || idx} style={styles.itemRow}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={styles.itemImage} />
              ) : (
                <div style={{ ...styles.itemImage, background: '#f1f1f1' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemMeta}>Size: {item.size || '-'}</div>
                <div style={styles.price}>{formatCurrency(item.price, order.currency || 'TZS')}</div>
              </div>
              <div>x{item.quantity}</div>
            </li>
          ))}
        </ul>
        <div style={styles.total}>Total: {formatCurrency(order.total, order.currency || 'TZS')}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={styles.label}>Delivery Address</div>
        <div>{order.customer?.address || '-'}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={styles.label}>Phone Number</div>
        <div>{order.customer?.phone || '-'}</div>
      </div>
      <div style={styles.statusWrap}>
        Order Status: <span style={styles.statusVal}>{order.status || 'Pending'}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>Back</button>
      </div>
    </div>
  );
}
