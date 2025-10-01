import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  // ...existing code...
  const [orderError, setOrderError] = useState('');
  const navigate = useNavigate();
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cart, setCart] = React.useState([]);
  const currency = typeof window !== 'undefined' ? (localStorage.getItem('currency') || 'TZS') : 'TZS';
  const [usdRate, setUsdRate] = React.useState(2600);
  const [loadingRate, setLoadingRate] = React.useState(false);
  const [quotaError, setQuotaError] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('Cash on Delivery');

  React.useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(items);

    setLoadingRate(true);
    fetch('https://api.exchangerate.host/latest?base=TZS&symbols=USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.USD) {
          setUsdRate(1 / data.rates.USD);
        }
        setLoadingRate(false);
      })
      .catch(() => setLoadingRate(false));
  }, []);

  const convertPrice = (price) => {
    if (currency === 'USD') {
      return loadingRate ? '...' : `$${(price / usdRate).toFixed(2)}`;
    }
    return `TZS ${price.toLocaleString()}`;
  };

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Prepare order data for backend
  const prepareOrderData = (cart, customerInfo) => {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Group items by ID and size to consolidate quantities
    const groupedItems = cart.reduce((acc, item) => {
      const key = `${item.id || item._id}-${item.size}`;
      if (!acc[key]) {
        acc[key] = {
          productId: item.id || item._id,
          name: item.name,
          price: Number(item.price),
          quantity: 0,
          size: item.size || '',
          image: item.image || ''
        };
      }
      acc[key].quantity += 1; // Each item in the raw cart array represents a quantity of 1
      return acc;
    }, {});

    const items = Object.values(groupedItems);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      items,
      customer: {
        name: user.name || customerInfo.name || '',
        email: user.email || customerInfo.email || '',
        phone: customerInfo.phone || '',
        address: customerInfo.address || address,
      },
      total: Number(total.toFixed(2)),
      currency: 'TZS',
      orderDate: new Date().toISOString()
    };
  };

  // Place order with detailed error logging
  const handlePlaceOrder = async (orderData) => {
    try {
      console.log('Sending order data:', orderData);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to place an order.');
      }
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      if (!response.ok) {
        console.error('Backend error details:', result);
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      console.log('Order successful:', result);
      return result;
    } catch (error) {
      console.error('Order placement failed:', error);
      throw error;
    }
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');
    setQuotaError('');
    if (!paymentMethod) {
      setQuotaError('Please select a payment method.');
      return;
    }
    if (!cart.length) {
      setQuotaError('Your cart is empty.');
      return;
    }
    if (!phone || phone.trim().length < 5) {
      setQuotaError('Please enter a valid phone number.');
      return;
    }
    // Prepare customer info
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const customerInfo = {
      name: user.name || '',
      email: user.email || '',
      phone: phone.trim(),
      address,
    };
    try {
      const orderData = prepareOrderData(cart, customerInfo);
      await handlePlaceOrder(orderData);
      window.dispatchEvent(new Event('productsUpdated'));
      localStorage.removeItem('cart');
      setCart([]);
      navigate('/orders');
    } catch (error) {
      setOrderError(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '2rem' }}>
      {quotaError && (
        <div style={{ color: 'red', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          {quotaError}
        </div>
      )}
      {orderError && (
        <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '8px', margin: '1rem 0', border: '1px solid #fcc', textAlign: 'center' }}>
          <strong>Order Error:</strong> {orderError}
        </div>
      )}
      <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Checkout</h2>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Order Summary</div>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
          {cart.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
              <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#222' }}>{item.name}</div>
                <div style={{ color: '#555', fontSize: '0.95rem' }}>Size: {item.size}</div>
                <div style={{ color: '#FFD700', fontWeight: 700 }}>{convertPrice(item.price)}</div>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#232F3E', textAlign: 'right' }}>Total: {convertPrice(total)}</div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, color: '#222', marginBottom: 6, display: 'block' }}>Delivery Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
            placeholder="Enter your address"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, color: '#222', marginBottom: 6, display: 'block' }}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
            placeholder="Enter your phone number"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, color: '#222', marginBottom: 6, display: 'block' }}>Payment Method</label>
          <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('Cash on Delivery')}
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: 8,
                border: '2px solid #FFD700',
                background: '#FFF8DC',
                color: '#232F3E',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #FFD70044',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >Cash on Delivery</button>
          </div>
        </div>
        <button
          type="submit"
          style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.9rem 1.7rem', fontWeight: 700, width: '100%', fontSize: '1.1rem', cursor: 'pointer', marginTop: 10 }}
        >Place Order</button>
      </form>
    </div>
  );
}
