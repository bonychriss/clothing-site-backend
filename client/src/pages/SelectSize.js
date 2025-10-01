import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CustomerRatingForm() {
  const [stars, setStars] = React.useState(0);
  const [hoverStars, setHoverStars] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Save rating to localStorage and notify Home page
    let userName = '';
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      userName = user?.name || user?.username || '';
    } catch {}
    const rating = { stars, comment, name: userName };
    const ratings = JSON.parse(localStorage.getItem('customerRatings') || '[]');
    ratings.push(rating);
    localStorage.setItem('customerRatings', JSON.stringify(ratings));
    window.dispatchEvent(new Event('customer-rating-submitted'));
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.5rem', marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            style={{ cursor: 'pointer', color: (hoverStars || stars) >= i ? '#FFA41C' : '#ccc', transition: 'color 0.2s' }}
            onClick={() => setStars(i)}
            onMouseEnter={() => setHoverStars(i)}
            onMouseLeave={() => setHoverStars(0)}
            aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
          >★</span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        style={{ fontFamily: 'inherit', fontSize: '1rem', borderRadius: 8, border: '1px solid #FFD700', padding: 8, resize: 'vertical', background: '#fff', color: '#222' }}
        required
      />
      <button type="submit" style={{ background: '#FFD700', color: '#232F3E', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
        Submit Rating
      </button>
      {submitted && (
        <div style={{ color: '#228B22', fontWeight: 600, marginTop: 6 }}>Thank you for your feedback!</div>
      )}
    </form>
  );
}

export default function SelectSize() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, selectedSize } = location.state || {};

  // Try to get backend product info if only _id is present
  const [fullProduct, setFullProduct] = React.useState(product || {});
  React.useEffect(() => {
    async function fetchFullProductDetails() {
      // If the product from state doesn't have variants, it's likely a BestPick or incomplete.
      // Fetch the full product details from the /api/products endpoint.
      if (product?._id && !product.variants) {
        try {
          // A BestPick and a Product might share a name but not an ID.
          // Let's find the product by name, which is more reliable for this sync if the ID is not a direct match.
          const res = await fetch(`/api/products`);
          if (res.ok) {
            const data = await res.json();
            const matchingProduct = Array.isArray(data) ? data.find(p => p.name === product.name) : null;
            if (matchingProduct) {
              setFullProduct(matchingProduct);
            }
          }
        } catch {}
      }
    }
    fetchFullProductDetails();
  }, [product]);
  const [size, setSize] = React.useState(selectedSize || '');
  const [quantity, setQuantity] = React.useState(1);
  const isLoggedIn = !!localStorage.getItem('token');
  const [showCartPopup, setShowCartPopup] = React.useState(false);
  // Fetch real products from backend for related products
  const [allProducts, setAllProducts] = React.useState([]);
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch from both endpoints simultaneously
        const [productsRes, bestPicksRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/best-picks')
        ]);

        const products = productsRes.ok ? await productsRes.json() : [];
        const bestPicks = bestPicksRes.ok ? await bestPicksRes.json() : [];

        const markedBestPicks = (Array.isArray(bestPicks) ? bestPicks : []).map(p => ({ ...p, isBestPick: true }));
        // Combine and remove duplicates, giving preference to the main product list if IDs overlap
        const combined = [...products, ...markedBestPicks];
        const uniqueProducts = Array.from(new Map(combined.map(p => [p._id || p.name, p])).values());

        setAllProducts(uniqueProducts);
      } catch (err) {
        console.error("Failed to fetch all products for related items:", err);
      }
    }
    fetchProducts();
  }, []);
  // Find similar products by category, using fullProduct to ensure details are present
  const similarProducts = fullProduct && fullProduct.category
    ? allProducts.filter(p => {
        return String(p.category).toLowerCase() === String(fullProduct.category).toLowerCase() && p._id !== fullProduct._id;
      })
    : [];

  if (!product) {
    return <div style={{ padding: 40, textAlign: 'center' }}>No product selected.</div>;
  }


  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login'); // or '/register' if you prefer
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Use fullProduct which may have more details from the backend
    let prodToAdd = fullProduct;
    if (!prodToAdd._id) {
      // Try to find backend product in localStorage (set by Products.js)
      const backendProducts = JSON.parse(localStorage.getItem('backendProducts') || '[]'); // This is a fallback
      const match = backendProducts.find(p => p.name === product.name);
      if (match && match._id) {
        prodToAdd = { ...product, _id: match._id };
      }
    }
    for (let i = 0; i < quantity; i++) {
      cart.push({
        _id: prodToAdd._id,
        id: prodToAdd._id || prodToAdd.id, // Use _id from backend if available
        name: prodToAdd.name,
        price: prodToAdd.price,
        image: prodToAdd.image,
        size,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setShowCartPopup(true);
    window.dispatchEvent(new Event('productsUpdated'));
    setTimeout(() => {
      setShowCartPopup(false);
      // Removed navigate('/products') to let user decide when to leave the page.
    }, 2500);
  };

  const variant = (fullProduct.variants || []).find(v => v.size === size);

  return (
    <div className="select-size-full" style={{ minHeight: '100vh', background: '#FFF8DC', padding: '32px 0', position: 'relative' }}>
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '40px',
          background: '#232F3E',
          color: '#FFD700',
          padding: '1rem 2rem',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '1.5rem',
          fontFamily: 'cursive, "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Apple Chancery", sans-serif',
          boxShadow: '0 2px 12px #0003',
          zIndex: 9999,
          opacity: showCartPopup ? 1 : 0,
          transform: showCartPopup ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'opacity 0.7s, transform 0.7s',
          pointerEvents: 'none',
        }}
      >
        𝒜𝒹𝒹𝑒𝒹 𝒯𝑜 𝒞𝒶𝓇𝓉
      </div>
      <div className="select-size-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        {/* ...existing code... */}
        <div className="product-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', marginBottom: 32 }}>
          <img src={product.image} alt={product.name} className="product-image" style={{ flex: '0 0 320px', width: '100%', maxWidth: 320, height: 320, objectFit: 'contain', borderRadius: 16, background: '#f8f8f8', boxShadow: '0 2px 12px #0001' }} />
          <div className="product-details" style={{ flex: '1 1 320px', minWidth: 240, padding: '0 12px' }}>
            <h1 style={{ fontWeight: 800, fontSize: '2rem', color: '#232F3E', marginBottom: 10 }}>{fullProduct.name || product.name}</h1>
            {variant ? (<div style={{ color: '#FFD700', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>TZS {variant.price || fullProduct.price}</div>) : (<div style={{ color: '#FFD700', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>TZS {fullProduct.price || product.price}</div>)}
            <div style={{ color: '#444', fontSize: '1.08rem', marginBottom: 8 }}>{fullProduct.description || fullProduct.desc || product.description || product.desc || 'Premium quality at a great price.'}</div>
            {product.rating && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#FFA41C', fontSize: '1.25rem', fontWeight: 600 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
                  ))}
                </span>
              </div>
            )}
            <div style={{ color: '#888', fontSize: '1rem', marginBottom: 8 }}>Category: {product.category}</div>
            {/* Customer Ratings Section */}
            <div className="customer-ratings" style={{ marginTop: 28, padding: '1.2rem', background: '#FFF8DC', borderRadius: 10, boxShadow: '0 2px 8px #FFD70022' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#111', marginBottom: 10, letterSpacing: '1px', fontFamily: 'Segoe UI, Arial, sans-serif', textShadow: '0 2px 8px #FFD70022' }}>What Our Customers Say</h3>
              <CustomerRatingForm />
            </div>
          </div>
        </div>
        <div className="size-section" style={{ marginBottom: 32 }}>
          <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.3rem', marginBottom: 18 }}>Select Size</h2>
          {!isLoggedIn && (
            <div style={{ color: '#b8860b', fontWeight: 600, fontSize: '1.08rem', marginBottom: 18 }}>
              Please <a href="/login" style={{ color: '#232F3E', textDecoration: 'underline' }}>login</a> or <a href="/register" style={{ color: '#232F3E', textDecoration: 'underline' }}>register</a> to choose a size.
            </div>
          )}
          <div className="size-selectors" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              {/* Removed 'Available Sizes' label as requested */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(fullProduct.variants || []).map(variant => {
                  const isOutOfStock = variant.stock <= 0;
                  return (
                  <button
                    key={variant.size}
                    type="button"
                    className={`size-btn${size === variant.size ? ' selected' : ''}`}
                    style={{
                      padding: '0.6rem 1.3rem',
                      borderRadius: 8,
                      border: size === variant.size ? '2px solid #FFD700' : '1px solid #ddd',
                      background: size === variant.size ? '#FFF8DC' : '#fff',
                      color: isOutOfStock ? '#aaa' : '#222',
                      fontWeight: 700,
                      cursor: isLoggedIn && !isOutOfStock ? 'pointer' : 'not-allowed',
                      boxShadow: size === variant.size ? '0 2px 8px #FFD70044' : 'none',
                      marginBottom: 4,
                      opacity: isLoggedIn && !isOutOfStock ? 1 : 0.6,
                      textDecoration: isOutOfStock ? 'line-through' : 'none',
                    }}
                    onClick={() => isLoggedIn && !isOutOfStock && setSize(variant.size)}
                    disabled={!isLoggedIn || isOutOfStock}
                  >{variant.size}</button>
                )})}
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="size-input" style={{ fontWeight: 700, color: '#232F3E' }}>Enter Size:</label>
                <input
                  id="size-input"
                  type="text"
                  value={size}
                  onChange={e => setSize(e.target.value.toUpperCase())}
                  placeholder="e.g., M"
                  style={{
                    padding: '0.6rem',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    width: '100px',
                    textAlign: 'center',
                    fontSize: '1rem',
                    opacity: isLoggedIn ? 1 : 0.6,
                  }}
                  disabled={!isLoggedIn}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <label htmlFor="quantity" style={{ fontWeight: 700, color: '#232F3E' }}>Quantity:</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1) {
                  setQuantity(val);
                }
              }}
              min="1"
              max={size ? fullProduct.variants?.find(v => v.size === size)?.stock : 1}
              style={{
                width: '70px',
                padding: '0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd',
                textAlign: 'center',
                fontSize: '1rem',
                opacity: isLoggedIn && (fullProduct.variants?.reduce((sum, v) => sum + v.stock, 0) > 0) ? 1 : 0.6,
              }}
              disabled={!isLoggedIn || (fullProduct.variants?.reduce((sum, v) => sum + v.stock, 0) === 0)}
            />
          </div>
          {(fullProduct.variants?.reduce((sum, v) => sum + v.stock, 0) === 0) ? (<div style={{ background: '#fbebeb', color: '#c00', border: '1px solid #f8d7da', borderRadius: 8, padding: '0.8rem 1.7rem', fontWeight: 700, minWidth: 180, fontSize: '1.08rem', marginTop: 10, textAlign: 'center' }}>Out of Stock</div>) : (
            <button
              className="add-to-cart-btn"
              style={{ background: '#232F3E', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.7rem', fontWeight: 700, minWidth: 180, fontSize: '1.08rem', marginTop: 10, cursor: isLoggedIn && size ? 'pointer' : 'not-allowed', opacity: isLoggedIn && size ? 1 : 0.6 }}
              disabled={!isLoggedIn || !size}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          )}
        </div>
        {/* Related Products */}
        {similarProducts.length > 0 && (
          <div className="related-products-section" style={{ marginTop: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#232F3E', marginBottom: 18 }}>Related Products</h2>
            <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
              {/* Five columns per row for related products */}
              {similarProducts.length > 0 && (
                <style>{`
                  @media (min-width: 900px) {
                    .related-products-grid {
                      grid-template-columns: repeat(5, 1fr) !important;
                      gap: 1.5rem !important;
                    }
                  }
                `}</style>
              )}
              {similarProducts.map(sp => {
                const id = sp._id || sp.id;
                return (
                  <div key={id} className="product-card" style={{
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
                    minHeight: 380,
                  }}>
                    {!sp.inStock && !sp.isBestPick && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '-30px',
                        background: '#e74c3c',
                        color: 'white',
                        padding: '5px 35px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        transform: 'rotate(45deg)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 10,
                      }}>SOLD OUT</div>
                    )}
                    {/* Image */}
                    <div style={{ width: '100%', height: 220, marginBottom: '1rem', overflow: 'hidden', borderRadius: '0.75rem' }}>
                      <img src={sp.image} alt={sp.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: !sp.inStock ? 'grayscale(0.5) brightness(0.85)' : 'none' }} />
                    </div>
                    {/* Title */}
                    <div style={{ width: '100%', marginBottom: 6, fontSize: '1rem', fontWeight: 700, color: '#111', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sp.name}</div>
                    {/* Description */}
                    <div style={{ width: '100%', color: '#333', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: 8, textAlign: 'center' }}>
                      {sp.description || sp.desc || 'Premium quality at a great price.'}
                    </div>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFD700' }}>{sp.price ? `TZS ${sp.price}` : 'TZS 9,900'}</div>
                      {sp.listPrice && (
                        <div style={{ color: '#777', textDecoration: 'line-through', fontSize: '0.95rem' }}>{`TZS ${sp.listPrice}`}</div>
                      )}
                    </div>
                    {/* View Button */}
                    <div style={{ width: '100%', marginTop: 8 }}>
                      <button
                        type="button"
                        style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, width: '100%', maxWidth: 180, cursor: (!sp.inStock && !sp.isBestPick) ? 'not-allowed' : 'pointer', marginBottom: 6, opacity: (!sp.inStock && !sp.isBestPick) ? 0.6 : 1 }}
                        onClick={() => { if (sp.inStock || sp.isBestPick) navigate('/select-size', { state: { product: sp } }) }}
                        disabled={!sp.inStock && !sp.isBestPick}
                      >{(!sp.inStock && !sp.isBestPick) ? 'Sold Out' : 'View'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Responsive CSS */}
      <style>{`
        .select-size-full { font-family: 'Segoe UI', Arial, sans-serif; }
        .product-flex { flex-direction: row; }
        @media (max-width: 900px) {
          .product-flex { flex-direction: column; align-items: center; }
          .product-image { margin-bottom: 18px; }
        }
        .size-btn.selected { border: 2px solid #FFD700 !important; background: #FFF8DC !important; box-shadow: 0 2px 8px #FFD70044; }
        .add-to-cart-btn { transition: background 0.2s; }
        .add-to-cart-btn:hover:not(:disabled) { background: #FFD700; color: #232F3E; }
        .related-products-grid { margin-top: 0; }
        .related-product-card:hover { box-shadow: 0 4px 16px #FFD70033; }
      `}</style>
    </div>
  );
}
