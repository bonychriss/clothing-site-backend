
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CartSidebar from '../components/CartSidebar';

// Skeleton loader and error fallback for images
function ImageWithLoader({ src, alt, lqip }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && lqip && (
        <img
          src={lqip}
          alt={alt + ' placeholder'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(12px)',
            transition: 'opacity 0.3s',
            opacity: loading ? 1 : 0,
            borderRadius: '0.75rem',
            zIndex: 1,
          }}
        />
      )}
      <img
        src={error ? '/images/placeholder.png' : src}
        alt={alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem', display: 'block', transition: 'opacity 0.3s', opacity: loading ? 0 : 1, position: 'relative', zIndex: 2 }}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
      />
    </div>
  );
}



// Utility
// eslint-disable-next-line no-unused-vars
// const formatCurrency = (n) => `$${Number(n).toFixed(2)}`;

// Local fallback products with admin flags
// eslint-disable-next-line no-unused-vars
/*
const localProducts = [
  // ...all product objects...
];
*/

const StarRating = ({ value, onChange, size = '1.1rem' }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {stars.map((s) => (
        <span
          key={s}
          onClick={onChange ? () => onChange(s) : undefined}
          aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', lineHeight: 1, padding: 0, color: s <= Math.round(value) ? '#FFA41C' : '#ccc', fontSize: size, userSelect: 'none' }}
          role={onChange ? 'button' : undefined}
          tabIndex={onChange ? 0 : undefined}
        >
          {s <= Math.round(value) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

function Products() {
  const [popupMsg] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ratings, setRatings] = useState({});
  const [currency, setCurrency] = useState('TZS');
  const [usdRate, setUsdRate] = useState(2600); // Default fallback
  const [loadingRate, setLoadingRate] = useState(false);
  // Remove unused selectedSizes
  const navigate = useNavigate();
  const location = useLocation();
  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');

  const isAuthenticated = !!localStorage.getItem('token');
  // Add to cart handler now navigates to SelectSize page
  const handleAddToCart = (product, id) => {
    if (!isAuthenticated) {
      navigate('/register'); // or '/login' if you prefer
      return;
    }
    navigate('/select-size', { state: { product } });
  };

  // Handle size selection returned from SelectSize page
  // Remove broken useEffect for selectedSize

  // Fetch live USD rate from exchangerate.host
  useEffect(() => {
    setLoadingRate(true);
    fetch('https://api.exchangerate.host/latest?base=TZS&symbols=USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.USD) {
          setUsdRate(1 / data.rates.USD); // TZS to USD
        }
        setLoadingRate(false);
      })
      .catch(() => setLoadingRate(false));
  }, []);

  // Convert price based on currency
  const convertPrice = (price) => {
    if (currency === 'USD') {
      return loadingRate
        ? 'Loading USD rate...'
        : `$${(price / usdRate).toFixed(2)}`;
    }
    return `TZS ${price}`;
  };

  // Filters & Sort
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ratingMin, setRatingMin] = useState(0);
  const [sortKey, setSortKey] = useState(sortParam || 'featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle "All Products" sort option to clear category filters
  useEffect(() => {
    if (sortKey === 'all') {
      setSelectedCats(new Set());
    }
  }, [sortKey]);

  // Load and persist ratings locally
  useEffect(() => {
    try {
      const raw = localStorage.getItem('productRatings');
      if (raw) setRatings(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('productRatings', JSON.stringify(ratings)); } catch {}
  }, [ratings]);

  // Load products from API only
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [productsRes, bestPicksRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/best-picks')
        ]);
        const productsData = productsRes.ok ? await productsRes.json() : [];
        const bestPicksData = bestPicksRes.ok ? await bestPicksRes.json() : [];
        // Mark best picks so we can identify them later
        const markedBestPicks = (Array.isArray(bestPicksData) ? bestPicksData : []).map(p => ({ ...p, isBestPick: true }));

        const combined = [...(Array.isArray(productsData) ? productsData : []), ...markedBestPicks];
        const uniqueProducts = Array.from(new Map(combined.map(p => [p._id || p.name, p])).values());
        setProducts(uniqueProducts);
        try { localStorage.setItem('backendProducts', JSON.stringify(uniqueProducts)); } catch {}
      } catch (err) {
        setProducts([]);
      }
    };
    fetchAllProducts();
    window.addEventListener('productsUpdated', fetchAllProducts);
    return () => window.removeEventListener('productsUpdated', fetchAllProducts);
  }, []);

  const allCategories = useMemo(() => {
    const s = new Set((products || []).map(p => p.category || 'General'));
    return Array.from(s);
  }, [products]);

  // If a category is provided in the URL, preselect it in filters
  useEffect(() => {
    if (!categoryParam) return;
    const requested = categoryParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!requested.length) return;
    const lowerToActual = new Map(allCategories.map((c) => [String(c).toLowerCase(), c]));
    const resolved = requested.map((r) => lowerToActual.get(r) || r);
    setSelectedCats(new Set(resolved));
  }, [categoryParam, allCategories]);

  const applyFilters = (list) => {
    let out = list;
    if (searchQuery) {
      out = out.filter(p =>
        p.name?.toLowerCase().includes(searchQuery) ||
        p.category?.toLowerCase().includes(searchQuery) ||
        p.desc?.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery)
      );
    }
    if (selectedCats.size) out = out.filter(p => selectedCats.has(p.category || 'General'));
    const min = priceMin !== '' ? Number(priceMin) : -Infinity;
    const max = priceMax !== '' ? Number(priceMax) : Infinity;
    out = out.filter(p => (p.price ?? 0) >= min && (p.price ?? 0) <= max);
    out = out.filter(p => (ratings[p._id || p.id || p.name] ?? p.rating ?? 4) >= ratingMin);
    return out;
  };

  const applySort = (list) => {
    const copy = [...list];
    switch (sortKey) {
      case 'all':
        // No specific sort order, just clears filters via useEffect
        break;
      case 'new-arrivals':
        copy.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'price-asc':
        copy.sort((a,b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        copy.sort((a,b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'rating': {
        const r = (p) => ratings[p._id || p.id || p.name] ?? p.rating ?? 0;
        copy.sort((a,b) => r(b) - r(a));
        break;
      }
      case 'reviews':
        copy.sort((a,b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      default:
        // featured: keep input order, but nudge badges to front
        copy.sort((a,b) => ((b.isBestSeller || b.isOverallPick) ? 1 : 0) - ((a.isBestSeller || a.isOverallPick) ? 1 : 0));
    }
    return copy;
  };

  // const filtered = applyFilters(products); // unused
  // Removed duplicate declaration of 'visible'.

  const toggleCategory = (cat) => {
    const next = new Set(selectedCats);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setSelectedCats(next);
  };

  const handleRemoveFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx));
  const handleCloseCart = () => setShowCart(false);

  const getId = (p, idx) => p._id || p.id || String(idx);

  const visible = useMemo(() => {
    const filtered = applyFilters(products);
    return applySort(filtered);
  }, [products, ratings, selectedCats, priceMin, priceMax, ratingMin, sortKey, applyFilters, applySort]);

  // Styles
  const pageStyle = { maxWidth: 'none', width: '100%', margin: '0', padding: '0 2rem 2rem 0', boxSizing: 'border-box', display: 'block' };
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '2rem',
  };
  const sidebarStyle = {
    position: 'sticky',
    top: 16,
    alignSelf: 'start',
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 12,
    padding: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    // Hide sidebar on mobile
    display: 'block',
  };
  const sectionTitle = { fontWeight: 700, margin: '0.25rem 0 0.5rem', color: '#111' };
  const filterItem = { display: 'flex', alignItems: 'center', gap: 8, margin: '0.35rem 0' };

  const topbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.75rem 0',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    minHeight: 120,
  };
  
  return (
    <div className="products products-page" style={pageStyle}
    >
      {popupMsg && (
        <div style={{position:'fixed',top:80,right:30,zIndex:9999,background:'#FFD700',color:'#222',padding:'1rem 2rem',borderRadius:12,boxShadow:'0 2px 12px #0002',fontWeight:700,fontSize:'1.1rem'}}>
          {popupMsg}
        </div>
      )}
      <h1 style={{ color: '#222', fontWeight: 800, fontSize: '2.2rem', margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>Products</h1>

      {/* Currency changer below nav/top bar, only in Products page */}
      <div style={{ width: '100%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem 0', marginBottom: '0.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label htmlFor="currency" style={{ fontWeight: 600 }}>Currency:</label>
            <select
              id="currency"
              value={currency}
              onChange={e => {
                setCurrency(e.target.value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('currency', e.target.value);
                }
              }}
              style={{ padding: '0.4em 1em', borderRadius: 8, border: '1px solid #FFD700', fontWeight: 600 }}
            >
              <option value="TZS">TZS (Tanzanian Shilling)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="mobile-filter-toggle" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%' }}
        >
          {showMobileFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>


      {/* Top bar: result count and sort */}
      <div style={topbarStyle}>
        <div style={{ color: '#555' }}>{visible.length} items</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#333', fontWeight: 600 }}>Sort by:</span>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid #ddd' }}>
            <option value="all">All Products</option>
            <option value="new-arrivals">New Arrivals</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="reviews">Reviews</option>
          </select>
        </label>
      </div>

      {/* Layout: sidebar + grid */}
      <div style={layoutStyle} className="products-layout-responsive">
        {/* Sidebar: hide on mobile */}
        <aside className={`products-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`} style={sidebarStyle}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={sectionTitle}>Departments</div>
            {allCategories.map((c) => (
              <label key={c} style={filterItem}>
                <input type="checkbox" checked={selectedCats.has(c)} onChange={() => toggleCategory(c)} style={{ accentColor: '#FFD700' }} />
                <span style={{ color: '#333' }}>{c}</span>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={sectionTitle}>Customer Reviews</div>
            {[4,3,2,1].map((n) => (
              <button key={n} onClick={() => setRatingMin(n)} style={{ ...filterItem, background: 'none', border: 'none', cursor: 'pointer', color: ratingMin === n ? '#111' : '#444' }}>
                <StarRating value={n} size="1rem" />
                <span>&nbsp;&amp; Up</span>
              </button>
            ))}
            {ratingMin > 0 && (
              <button onClick={() => setRatingMin(0)} style={{ marginTop: 6, background: 'none', border: 'none', color: '#FF9900', cursor: 'pointer', fontWeight: 700 }}>Clear rating</button>
            )}
          </div>

          <div>
            <div style={sectionTitle}>Price</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} style={{ width: 90, padding: '0.4rem', borderRadius: 8, border: '1px solid #ddd' }} />
              <span>—</span>
              <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} style={{ width: 90, padding: '0.4rem', borderRadius: 8, border: '1px solid #ddd' }} />
            </div>
            {(priceMin !== '' || priceMax !== '') && (
              <button onClick={() => { setPriceMin(''); setPriceMax(''); }} style={{ marginTop: 6, background: 'none', border: 'none', color: '#FF9900', cursor: 'pointer', fontWeight: 700 }}>Clear price</button>
            )}
          </div>
        </aside>

        {/* Best Picks */}
        <main>
          <div style={gridStyle} className="products-grid-responsive">
            {visible.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: '1.1rem', padding: '2rem 0' }}>
                No products match your filters.
              </div>
            ) : (
              visible.map((product, idx) => {
                const id = getId(product, idx);
                const userRating = ratings[id];
                const ratingValue = userRating ?? product.rating ?? 4;
                return (
                  <div className="product-card" key={id} style={{
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
                  }}> 
                    {/* Badges */}
                    {product.isNewArrival === true && (
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
                        zIndex: 50,
                        letterSpacing: '1px',
                        textShadow: '0 1px 2px #fff8',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}>NEW ARRIVAL</div>
                    )}
                    {product.inStock && product.isBestSeller && <span style={{ position: 'absolute', top: 12, left: 12, background: '#FF9900', color: '#fff', fontWeight: 700, fontSize: '0.8rem', borderRadius: 6, padding: '2px 8px' }}>Best Seller</span>}
                    {/* Remove SOLD OUT badge for Best Picks */}
                    {/* Remove SOLD OUT badge for Sabor Best Picks */}
                    {!product.inStock && !product.isBestSeller && !product.isOverallPick && !product.isBestPick && product.category !== 'Sabor Best Picks' && (
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
                    {product.inStock && product.isOverallPick && <span style={{ position: 'absolute', top: 12, right: 12, background: '#232F3E', color: '#fff', fontWeight: 700, fontSize: '0.8rem', borderRadius: 6, padding: '2px 8px' }}>Overall Pick</span>}

                    {/* Image */}
                    <div style={{ width: '100%', height: 220, marginBottom: '1rem', overflow: 'hidden', borderRadius: '0.75rem', position: 'relative' }}>
                      <ImageWithLoader src={product.image} alt={product.name} lqip={product.lqip} />
                    </div>

                    {/* Title */}
                    <div style={{ width: '100%', marginBottom: 6, fontSize: '1rem', fontWeight: 700, color: '#111', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</div>
                    {/* Description */}
                    <div style={{ width: '100%', color: '#333', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: 8, textAlign: 'center' }}>
                      {product.description || product.desc || 'Premium quality at a great price.'}
                    </div>

                    {/* Rating + Reviews */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                      <StarRating value={ratingValue} onChange={(v) => setRatings({ ...ratings, [id]: v })} />
                      <span style={{ fontSize: '0.9rem', color: '#555' }}>{product.reviews ? product.reviews.toLocaleString() : '1,000+'}</span>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFD700' }}>{product.price ? convertPrice(product.price) : 'TZS 9,900'}</div>
                      {product.listPrice && (
                        <div style={{ color: '#777', textDecoration: 'line-through', fontSize: '0.95rem' }}>{convertPrice(product.listPrice)}</div>
                      )}
                    </div>

                    {/* Size Selector Button navigates to SelectSize page */}
                    <div style={{ width: '100%', marginTop: 8 }}>
                      <button
                        type="button"
                        style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, width: '100%', maxWidth: 180, cursor: (!product.inStock && !product.isBestPick) ? 'not-allowed' : 'pointer', marginBottom: 6, opacity: (!product.inStock && !product.isBestPick) ? 0.6 : 1 }}
                        aria-label={'Add to cart'}
                        disabled={!product.inStock && !product.isBestPick}
                        onClick={() => {
                          if (product.inStock || product.isBestPick) handleAddToCart(product, id);
                        }}
                      >
                        {(!product.inStock && !product.isBestPick) ? (
                          <span>Out of Stock</span>
                        ) : (
                          <><i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i><span>Add to Cart</span></>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>


      {showCart && (
        <CartSidebar cart={cart} onClose={handleCloseCart} onRemove={handleRemoveFromCart} />
      )}

      {/* Simple responsive tweak */}
      <style>{`
        .products.products-page {
          padding: 0 2rem 2rem 2rem !important;
        }
        .mobile-filter-toggle {
          display: none;
        }
        /* Tablet and smaller desktop */
        @media (max-width: 980px) {
          .products-layout-responsive {
            grid-template-columns: 1fr !important;
          }
          .products-sidebar {
            display: none; /* Hide sidebar on mobile */
            position: static;
            margin-bottom: 1.5rem;
          }
          .products-sidebar.mobile-visible {
            display: block; /* Show when toggled */
          }
          .mobile-filter-toggle {
            display: block; /* Show the toggle button */
            max-width: 600px;
            margin: 0 auto 1rem auto;
          }
          .products-grid-responsive {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
          }
        }
        /* Mobile phones */
        @media (max-width: 600px) {
          .products.products-page {
            padding: 0 1rem 2rem 1rem !important;
          }
          .products-grid-responsive {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            gap: 1rem !important;
          }
        }
      `}</style>

    </div>
  );
}

export default Products;
