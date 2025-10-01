import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewArrivals({ limit = 8 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/new?limit=${limit}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load new arrivals.');
        setLoading(false);
      });
  }, [limit]);

  if (loading) return <div>Loading new arrivals...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!products.length) return <div>No new arrivals found.</div>;

  return (
    <section style={{ margin: '2rem 0' }}>
      <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.5rem', marginBottom: 18 }}>New Arrivals</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {products.map(product => (
          <div
            key={product._id}
            className="product-card"
            style={{
              position: 'relative',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'flex-start',
              overflow: 'hidden',
              minHeight: 380,
              width: 260,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/product/${product._id}`)}
          >
            {/* Diagonal NEW badge */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '-30px',
              background: '#FFD700',
              color: '#222',
              padding: '5px 35px',
              fontWeight: 'bold',
              fontSize: '12px',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 10,
            }}>NEW</div>
            {/* Image */}
            <div style={{ width: '100%', height: 220, marginBottom: '1rem', overflow: 'hidden', borderRadius: '0.75rem', position: 'relative' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Title */}
            <div style={{ width: '100%', marginBottom: 6, fontSize: '1rem', fontWeight: 700, color: '#111', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</div>
            {/* Description */}
            <div style={{ width: '100%', color: '#333', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: 8, textAlign: 'center' }}>
              {product.description || product.desc || 'Premium quality at a great price.'}
            </div>
            {/* Price */}
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFD700', marginBottom: 8 }}>TZS {product.price}</div>
            {/* Category */}
            <div style={{ color: '#555', fontSize: '0.95rem', marginBottom: 6 }}>{product.category}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
