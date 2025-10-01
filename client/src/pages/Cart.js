
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cart, setCart] = React.useState([]);
  const currency = typeof window !== 'undefined' ? (localStorage.getItem('currency') || 'TZS') : 'TZS';
  const [usdRate, setUsdRate] = React.useState(2600);
  const [loadingRate, setLoadingRate] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  // const [showCheckoutSidebar, setShowCheckoutSidebar] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  // const CheckoutSidebar = React.useMemo(() => require('../components/CheckoutSidebar').default, []);

  React.useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(items);
  }, []);

  React.useEffect(() => {
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
      return loadingRate
        ? 'Loading USD rate...'
        : `$${(price / usdRate).toFixed(2)}`;
    }
    return `TZS ${price}`;
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleRemove = (idx) => {
    const next = cart.filter((_, i) => i !== idx);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '2rem', position: 'relative', zIndex: 10, overflow: 'visible' }}>
        <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>{t('yourCart')}</h2>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: '1.1rem', padding: '2rem 0' }}>{t('cartEmpty')}</div>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
              {cart.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>{item.name}</div>
                    <div style={{ color: '#555', fontSize: '0.95rem' }}>{t('selectSize')}: {item.size}</div>
                    <div style={{ color: '#FFD700', fontWeight: 700 }}>{item.price ? convertPrice(item.price) : 'TZS 0'}</div>
                  </div>
                  <button onClick={() => handleRemove(idx)} style={{ background: '#FFD700', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16, borderRadius: 6, padding: '0.4rem 0.8rem', marginLeft: 8 }}>{t('remove')}</button>
                </li>
              ))}
            </ul>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#232F3E', textAlign: 'right', marginBottom: 24 }}>{t('total')}: {convertPrice(total)}</div>
            <button
              style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.9rem 1.7rem', fontWeight: 700, width: '100%', fontSize: '1.1rem', cursor: 'pointer' }}
              onClick={() => navigate('/checkout')}
            >{t('proceedToPayment')}</button>
          </>
        )}
      </div>
    );
}
