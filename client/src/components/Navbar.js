
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// Icon components (emoji for simplicity, replace with SVGs if needed)
const HomeIcon = () => <span style={{ marginRight: 8 }}>🏠</span>;
const ProductsIcon = () => <span style={{ marginRight: 8 }}>👗</span>;
const OrdersIcon = () => <span style={{ marginRight: 8 }}>📦</span>;
const NewArrivalsIcon = () => <span style={{ marginRight: 8 }}>✨</span>;
const CartIcon = () => <span style={{ marginRight: 8 }}>🛒</span>;
const AccountIcon = () => <span style={{ marginRight: 8 }}>👤</span>;
const LoginIcon = () => <span style={{ marginRight: 8 }}>🔑</span>;
const RegisterIcon = () => <span style={{ marginRight: 8 }}>📝</span>;

// Move productNames outside Navbar to keep reference stable
const productNames = [
  "Men's Jeans", "Boys' Jeans", "Cozy Sweater", "Classic Suit", "Summer Dress", "Casual Shirt",
  "Best Of All Set", "Sneakers", "Running Shoes", "Trainers", "Court Shoes", "Mesh Sneakers",
  "Casual Shoes", "Street Sneakers"
];

const menuLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  color: '#FFD700',
  fontWeight: 700,
  textDecoration: 'none',
  margin: '0.7em 0',
  fontSize: '1.1rem'
};

function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = productNames.filter(n => n.toLowerCase().includes(search.trim().toLowerCase()));
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [search]);
  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 120); // Delay to allow click
  };

  const handleMenuClick = () => setMenuOpen(m => !m);
  const handleLinkClick = () => setMenuOpen(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav style={{
      background: '#222',
      color: '#FFD700',
      padding: '0.7rem 2rem',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24
      }}>
        {/* Left: Logo and Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/images/sabor Espanol logo.jpeg"
            alt="Sabor Espanol Logo"
            style={{
              height: 48,
              marginRight: 8,
              verticalAlign: 'middle',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <Link to="/" style={{ fontWeight: 700, fontSize: 22, color: '#FFD700', textDecoration: 'none', minWidth: 70 }}>Home</Link>
        </div>
        {/* Center: Search Bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={handleInputBlur}
              placeholder="Search products..."
              style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', fontSize: '1rem', minWidth: 180 }}
              autoComplete="off"
            />
            <button type="submit" style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 6, padding: '0.4rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Search</button>
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '100%',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                zIndex: 1001,
                color: '#222',
                fontWeight: 500,
                fontSize: '1rem'
              }}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleSuggestionClick(s)}
                    style={{
                      padding: '0.6em 1em',
                      cursor: 'pointer',
                      borderBottom: idx !== suggestions.length - 1 ? '1px solid #eee' : 'none',
                      background: '#fff'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#ffe7ba'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
        {/* Right: Hamburger */}
        <button
          onClick={handleMenuClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 32,
            cursor: 'pointer',
            color: '#FFD700',
            outline: 'none'
          }}
          aria-label="Open menu"
        >
          &#9776;
        </button>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: 60,
            right: 20,
            minWidth: 180,
            background: '#222',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            padding: '1rem 1.5rem',
            zIndex: 2000,
            marginTop: 0
          }}>
          <Link to="/" onClick={handleLinkClick} style={menuLinkStyle}><HomeIcon />Home</Link>
          <Link to="/products" onClick={handleLinkClick} style={menuLinkStyle}><ProductsIcon />Products</Link>
          <Link to="/new-arrivals" onClick={handleLinkClick} style={menuLinkStyle}><NewArrivalsIcon />New Arrivals</Link>
          <Link to="/orders" onClick={handleLinkClick} style={menuLinkStyle}><OrdersIcon />Orders</Link>
          <Link to="/cart" onClick={handleLinkClick} style={menuLinkStyle}><CartIcon />Cart</Link>
          <Link to="/profile" onClick={handleLinkClick} style={menuLinkStyle}><AccountIcon />Account</Link>
          <Link to="/login" onClick={handleLinkClick} style={menuLinkStyle}><LoginIcon />Login</Link>
          <Link to="/register" onClick={handleLinkClick} style={menuLinkStyle}><RegisterIcon />Register</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
