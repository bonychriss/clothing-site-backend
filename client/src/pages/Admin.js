import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { FaTachometerAlt, FaBoxOpen, FaStar, FaClipboardList, FaUserCircle, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';

const getStyles = (theme) => ({
  header: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 800,
    letterSpacing: 1.5,
    fontSize: 16,
    background: theme === 'light' ? '#f7f7f7' : '#333',
    color: theme === 'light' ? '#222' : '#FFD700',
    width: '100%',
    padding: 10,
  },
  section: {
    background: theme === 'light' ? '#fff' : '#333',
    borderRadius: 12,
    boxShadow: theme === 'light' ? '0 2px 12px rgba(0,0,0,0.04)' : '0 2px 12px rgba(0,0,0,0.15)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    color: '#FFD700',
    fontWeight: 800,
    fontSize: '1.5rem',
    marginBottom: '1rem',
    borderBottom: `1px solid ${theme === 'light' ? '#eee' : '#555'}`,
    paddingBottom: '0.5rem',
  },
  formInput: {
    padding: '0.7em 1em',
    borderRadius: 8,
    border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    background: theme === 'light' ? '#fff' : '#444',
    color: theme === 'light' ? '#222' : '#f7f7f7',
  },
  formSelect: {
    padding: '0.7em 1em',
    borderRadius: 8,
    border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    background: theme === 'light' ? '#fff' : '#444',
    color: theme === 'light' ? '#222' : '#f7f7f7',
  },
  button: {
    background: '#FFD700',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    padding: '0.7em 1.5em',
    fontWeight: 700,
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  card: {
    background: theme === 'light' ? '#fff' : '#444',
    borderRadius: 12,
    boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.03)' : '0 2px 8px rgba(0,0,0,0.1)',
    padding: '1rem',
    border: `1px solid ${theme === 'light' ? '#eee' : '#555'}`,
  },
});

function AddProductForm({ onProductAdded, styles }) {
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setForm(prev => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('description', form.description);
      if (form.image) formData.append('image', form.image);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add product');
      const newProduct = await res.json();
      onProductAdded(newProduct);
      setForm({ name: '', price: '', category: '', description: '', image: null });
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }} encType="multipart/form-data">
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" style={styles.formInput} required />
      <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" step="0.01" style={styles.formInput} required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} />
      <select name="category" value={form.category} onChange={handleChange} style={styles.formSelect} required>
        <option value="">Select Category</option>
        <option value="Men">Men</option>
        <option value="Women">Women</option>
        <option value="Boys">Boys</option>
        <option value="Footwear">Footwear</option>
        <option value="Dresses">Dresses</option>
        <option value="Suits">Suits</option>
        <option value="Accessories">Accessories</option>
        <option value="Casual">Casual</option>
        <option value="Official">Official</option>
        <option value="Outdoor">Outdoor</option>
      </select>
      <input name="image" type="file" accept="image/*" onChange={handleChange} style={styles.formInput} required />
      {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: 80, borderRadius: 4, alignSelf: 'flex-start' }} />}
      <button type="submit" style={styles.button} disabled={loading}>Add Product</button>
    </form>
  );
}

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online', 'offline', 'checking'

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // Health check for backend status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };
    checkStatus(); // Initial check
    const intervalId = setInterval(checkStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Product Management State
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState(null);
  const [editProduct, setEditProduct] = useState(null); // This holds the product being edited
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', description: '', image: null, isNewArrival: false });
  const [editLoading, setEditLoading] = useState(false);

  // Best Picks State
  const [bestPicks, setBestPicks] = useState([]);
  const [bestPickForm, setBestPickForm] = useState({ name: '', price: '', category: '', description: '', image: null });
  const [bestPickPreview, setBestPickPreview] = useState(null);
  const [bestPickLoading, setBestPickLoading] = useState(false);
  const [bestPickError, setBestPickError] = useState('');

  // Order Management State
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  // Handle select/deselect all orders
  const handleSelectAllOrders = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(orders.map(o => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  // Handle select/deselect single order
  const handleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev => prev.includes(orderId)
      ? prev.filter(id => id !== orderId)
      : [...prev, orderId]
    );
  };

  // Bulk delete selected orders
  const handleBulkDeleteOrders = async () => {
    if (!window.confirm('Are you sure you want to delete all selected orders? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Send all deletes in parallel
      const results = await Promise.all(selectedOrderIds.map(id =>
        fetch(`/api/orders/${id}`, { method: 'DELETE', headers })
      ));
      // Check for failures
      const failed = results.filter(res => !res.ok);
      if (failed.length > 0) {
        setOrderError('Some orders could not be deleted.');
        alert('Some orders could not be deleted.');
      } else {
        setOrderError(null);
        setSelectedOrderIds([]);
        await fetchAdminData();
        alert('Selected orders deleted successfully!');
      }
    } catch (e) {
      setOrderError(e.message || 'Failed to delete selected orders');
    }
  };
  const [orderError, setOrderError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState('');

  // Open edit modal and populate form
  const handleProductEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      inStock: product.inStock !== false, // Default to true if undefined
    });
  };

  const showPopup = (message, type = 'success') => {
    setPopupMessage({ text: message, type });
    setTimeout(() => {
      setPopupMessage('');
    }, 3000);
  };

  // Handle changes in edit form
  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setEditForm(prev => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      setEditForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle product update submission
  const handleProductUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setProductError('');
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);
      formData.append('description', editForm.description);
      if (editForm.image && typeof editForm.image !== 'string') {
        formData.append('image', editForm.image);
      }
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/products/${editProduct._id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      window.dispatchEvent(new Event('productsUpdated'));
      setEditProduct(null);
      setEditForm({ name: '', price: '', category: '', description: '', image: null, isNewArrival: false });
    } catch (err) {
      setProductError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleBestPickChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setBestPickForm(prev => ({ ...prev, image: files[0] }));
      setBestPickPreview(URL.createObjectURL(files[0]));
    } else {
      setBestPickForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBestPickAdd = async (e) => {
    e.preventDefault();
    setBestPickLoading(true);
    setBestPickError('');
    try {
      const formData = new FormData();
      formData.append('name', bestPickForm.name);
      formData.append('price', bestPickForm.price);
      formData.append('category', bestPickForm.category);
      formData.append('description', bestPickForm.description);
      if (bestPickForm.image) formData.append('image', bestPickForm.image);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/best-picks', {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add best pick');
      const newPick = await res.json();
      setBestPicks(prev => [newPick, ...prev]);
      window.dispatchEvent(new Event('bestPicksUpdated'));
      setBestPickForm({ name: '', price: '', category: '', description: '', image: null });
      setBestPickPreview(null);
    } catch (err) {
      setBestPickError(err.message);
    } finally {
      setBestPickLoading(false);
    }
  };

  const handleBestPickDelete = async (id) => {
    if (!window.confirm('Delete this best pick?')) return;
    setBestPickError('');
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/best-picks/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete best pick');
      setBestPicks(prev => prev.filter(pick => pick._id !== id));
      window.dispatchEvent(new Event('bestPicksUpdated'));
    } catch (err) {
      setBestPickError(err.message);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    setOrderError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      const updatedOrder = await res.json();
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    } catch (err) {
      setOrderError(err.message);
    }
  };

  const handleToggleStock = async (productId, currentStockStatus) => {
    const newStockStatus = !currentStockStatus;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ inStock: newStockStatus }),
      });
      if (!res.ok) throw new Error('Failed to update stock status');
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      showPopup(`Product stock set to ${newStockStatus ? 'In Stock' : 'Out of Stock'}.`);
    } catch (err) {
      showPopup(err.message, 'error');
    }
  };

  const fetchAdminData = async () => {
    setOrderLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [productsRes, bestPicksRes, ordersRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/best-picks', { headers }),
        fetch('/api/orders', { headers }),
      ]);
      const productsData = await productsRes.json();
      const bestPicksData = await bestPicksRes.json();
      const ordersData = await ordersRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);
      setBestPicks(Array.isArray(bestPicksData) ? bestPicksData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setProductError('Failed to fetch admin data');
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
    const handleProductsUpdate = () => fetchAdminData();
    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, [isAuthenticated]);

  const styles = useMemo(() => getStyles(theme), [theme]);
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin/dashboard' },
    { key: 'product', label: 'Products', icon: <FaBoxOpen />, path: '/admin/products' },
    { key: 'bestpicks', label: 'Best Picks', icon: <FaStar />, path: '/admin/bestpicks' },
    { key: 'orders', label: 'Orders', icon: <FaClipboardList />, path: '/admin/orders' },
  ];

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Admin Access Required</h2>
        <p>Please <a href="/login">log in</a> as an administrator.</p>
      </div>
    );
  }

  return (
    <div className={`admin-page ${theme}`}>
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <FaTachometerAlt />
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FaUserCircle size={32} />
          <span className="sidebar-username">Admin</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.key}>
                <a href={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', borderRadius: 8, background: theme === 'light' ? '#eee' : '#444' }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: backendStatus === 'online' ? '#28a745' : backendStatus === 'offline' ? '#dc3545' : '#ffc107',
              boxShadow: `0 0 8px ${backendStatus === 'online' ? '#28a745' : 'transparent'}`
            }}></span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
              Backend: {backendStatus}
            </span>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}> {theme === "light" ? <FaMoon /> : <FaSun />} Theme</button>
          <button className="logout-btn" onClick={() => { setIsAuthenticated(false); localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}><FaSignOutAlt /> <span>Logout</span></button>
        </div>
      </aside>
      <main className="admin-content">
        <div style={{ padding: '0 1rem' }}>
          {popupMessage && (
            <div style={{
              position: 'fixed', top: 20, right: 20, zIndex: 2000,
              padding: '1rem 1.5rem', borderRadius: 8,
              background: popupMessage.type === 'error' ? '#c00' : '#1a7f37',
              color: '#fff', fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>{popupMessage.text}</div>
          )}
          <Routes>
            <Route path="dashboard" element={
              <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Dashboard Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{...styles.card, textAlign: 'center', padding: '1.5rem'}}>
                    <h3 style={{margin: 0, color: '#FFD700', fontSize: '1.1rem'}}>Total Products</h3>
                    <p style={{fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0'}}>{products.length}</p>
                  </div>
                  <div style={{...styles.card, textAlign: 'center', padding: '1.5rem'}}>
                    <h3 style={{margin: 0, color: '#FFD700', fontSize: '1.1rem'}}>Total Orders</h3>
                    <p style={{fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0'}}>{orders.length}</p>
                  </div>
                  <div style={{...styles.card, textAlign: 'center', padding: '1.5rem'}}>
                    <h3 style={{margin: 0, color: '#FFD700', fontSize: '1.1rem'}}>Pending Orders</h3>
                    <p style={{fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0'}}>{orders.filter(o => o.status === 'Pending').length}</p>
                  </div>
                  <div style={{...styles.card, textAlign: 'center', padding: '1.5rem'}}>
                    <h3 style={{margin: 0, color: '#FFD700', fontSize: '1.1rem'}}>Total Revenue</h3>
                    <p style={{fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0'}}>
                      TZS {orders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 style={{...styles.sectionHeader, fontSize: '1.3rem'}}>Recent Orders</h3>
                  {orderLoading ? <p>Loading recent orders...</p> : (
                    <ul style={{listStyle: 'none', padding: 0}}>
                      {orders.slice(0, 5).map(order => (
                        <li key={order._id} style={{...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                          <div>
                            <div style={{fontWeight: 700}}>{order.customer?.name || 'N/A'}</div>
                            <div style={{fontSize: 14, color: '#aaa'}}>{new Date(order.createdAt).toLocaleString()} - TZS {order.total.toLocaleString()}</div>
                          </div>
                          <div style={{fontWeight: 600, background: '#FFD70022', color: '#FFD700', padding: '0.3rem 0.8rem', borderRadius: 6}}>
                            {order.status}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            } />
            <Route path="products" element={
              <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Product Management</h2>
                <>
                <div style={{ marginBottom: '2rem', borderBottom: `1px solid ${theme === 'light' ? '#eee' : '#555'}`, paddingBottom: '1.5rem' }}>
                  <h3 style={{ color: '#FFD700', fontWeight: 700 }}>Add New Product</h3>
                  <AddProductForm onProductAdded={(newProduct) => setProducts(prev => [newProduct, ...prev])} styles={styles} />
                </div>
                <h3 style={{ color: '#FFD700', fontWeight: 700, marginTop: '2rem' }}>Existing Products</h3>
                {productError && <div style={{ color: 'red', marginBottom: 12 }}>{productError}</div>}
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {products.map(product => (
                    <li key={product._id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={product.image} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{product.name}</div>
                          <div style={{ fontSize: 14, color: '#aaa' }}>{product.category} - TZS {product.price?.toLocaleString()}</div>
                        </div>
                        <div style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          background: product.inStock ? '#d4f8e8' : '#ffe7ba',
                          color: product.inStock ? '#1a7f37' : '#b8860b',
                        }}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ ...styles.button, padding: '0.4em 0.8em', fontSize: '0.9rem' }} onClick={() => handleProductEdit(product)}>Edit</button>
                        <button style={{ ...styles.button, background: '#c00', color: '#fff', padding: '0.4em 0.8em', fontSize: '0.9rem' }} onClick={async () => {
                          if (!window.confirm('Delete this product?')) return;
                          const token = localStorage.getItem('token');
                          const res = await fetch(`/api/products/${product._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                          if (res.ok) {
                            setProducts(prev => prev.filter(p => p._id !== product._id));
                            showPopup('Product deleted successfully.');
                          } else {
                            showPopup('Failed to delete product.', 'error');
                          }
                        }}>Delete</button>
                        <button
                          style={{ ...styles.button, background: product.inStock ? '#f0ad4e' : '#5cb85c', color: '#fff', padding: '0.4em 0.8em', fontSize: '0.9rem' }}
                          onClick={() => handleToggleStock(product._id, product.inStock)}
                        >
                          {product.inStock ? 'Set Out of Stock' : 'Restock'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                </>
                {editProduct && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: styles.section.background, padding: '2rem', borderRadius: 12, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                      <h3 style={{ ...styles.sectionHeader, marginTop: 0 }}>Edit Product</h3>
                      <form onSubmit={handleProductUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Product Name" style={styles.formInput} required />
                        <input name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" type="number" step="0.01" style={styles.formInput} required />
                        <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }} />
                        <select name="category" value={editForm.category} onChange={handleEditChange} style={styles.formSelect} required>
                          <option value="">Select Category</option>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Boys">Boys</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Dresses">Dresses</option>
                          <option value="Suits">Suits</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Casual">Casual</option>
                          <option value="Official">Official</option>
                          <option value="Outdoor">Outdoor</option>
                        </select>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                          <button type="submit" style={styles.button} disabled={editLoading}>Save Changes</button>
                          <button type="button" onClick={() => setEditProduct(null)} style={{ ...styles.button, background: '#ccc' }}>Cancel</button>
                        </div>
                        {productError && <div style={{ color: 'red', marginTop: 12 }}>{productError}</div>}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            } />
            <Route path="bestpicks" element={
              <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Sabor Best Picks Management</h2>
                <form onSubmit={handleBestPickAdd} style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} encType="multipart/form-data">
                  <input name="name" value={bestPickForm.name} onChange={handleBestPickChange} placeholder="Product Name" style={styles.formInput} required />
                  <input name="price" value={bestPickForm.price} onChange={handleBestPickChange} placeholder="Price" type="number" step="0.01" style={styles.formInput} required />
                  <input name="description" value={bestPickForm.description} onChange={handleBestPickChange} placeholder="Description" style={{...styles.formInput, gridColumn: '1 / -1'}} />
                  <select name="category" value={bestPickForm.category} onChange={handleBestPickChange} style={styles.formSelect} required>
                    <option value="">Select Category</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Boys">Boys</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Suits">Suits</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Casual">Casual</option>
                    <option value="Official">Official</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                  <input name="image" type="file" accept="image/*" onChange={handleBestPickChange} style={styles.formInput} required />
                  {bestPickPreview && <img src={bestPickPreview} alt="Preview" style={{ maxHeight: 80, borderRadius: 4, gridColumn: '1 / -1', alignSelf: 'flex-start' }} />}
                  <button type="submit" style={{...styles.button, gridColumn: '1 / -1'}} disabled={bestPickLoading}>Add Best Pick</button>
                </form>
                {bestPickError && <div style={{ color: 'red', marginBottom: 12 }}>{bestPickError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {bestPicks.map(pick => (
                    <div key={pick._id} style={{ ...styles.card, textAlign: 'center' }}>
                      <img src={pick.image} alt={pick.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <strong>{pick.name}</strong>
                      <button style={{ ...styles.button, background: '#c00', color: '#fff', marginTop: 10, width: '100%' }} onClick={() => handleBestPickDelete(pick._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            } />
            <Route path="orders" element={
              <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Order Management</h2>
                {orderError && <div style={{ color: 'red', marginBottom: 12 }}>{orderError}</div>}
                {orderLoading ? ( <div>Loading orders...</div> ) : orders.length === 0 ? ( <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No orders found.</div> ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme === 'light' ? '#eee' : '#555'}` }}>
                        <th style={{ padding: 8 }}>
                          <input type="checkbox" checked={selectedOrderIds.length === orders.length && orders.length > 0} onChange={handleSelectAllOrders} />
                        </th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Customer</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Phone</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Total</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>
                          {selectedOrderIds.length > 0 && (
                            <button title="Delete selected orders" style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 20 }} onClick={handleBulkDeleteOrders}>
                              <span role="img" aria-label="Delete">🗑️</span>
                            </button>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td style={{ padding: 8 }}>
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order._id)}
                              onChange={() => handleSelectOrder(order._id)}
                            />
                          </td>
                          <td style={{ padding: 8 }}>{order.customer?.name || 'N/A'}<br/><small>{order.customer?.email}</small></td>
                          <td style={{ padding: 8 }}>{order.customer?.phone || ''}</td>
                          <td style={{ padding: 8 }}>{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                          <td style={{ padding: 8 }}>TZS {order.total.toLocaleString()}</td>
                          <td style={{ padding: 8 }}>{order.status}</td>
                          <td style={{ padding: 8, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {order.status !== 'Confirmed' && (
                                <button style={{ ...styles.button, background: '#5cb85c', color: '#fff', padding: '0.4em 0.8em', fontSize: '0.9rem' }} onClick={() => handleOrderStatusUpdate(order._id, 'Confirmed')}>
                                  Confirm
                                </button>
                                )}
                                <button style={{ ...styles.button, background: '#f0ad4e', color: '#fff', padding: '0.4em 0.8em', fontSize: '0.9rem' }} onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')}>
                                  Cancel
                                </button>
                              </div>
                            )}
                            <button
                              title="Delete order"
                              style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 18 }}
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
                                try {
                                  const token = localStorage.getItem('token');
                                  const headers = {};
                                  if (token) headers['Authorization'] = `Bearer ${token}`;
                                  const res = await fetch(`/api/orders/${order._id}`, {
                                    method: 'DELETE',
                                    headers,
                                  });
                                  if (!res.ok) {
                                    let errorMsg = 'Failed to delete order';
                                    try {
                                      const errJson = await res.json();
                                      errorMsg = errJson.message || errorMsg;
                                      // Log error details for debugging
                                      console.error('Order delete error:', errJson);
                                    } catch {}
                                    throw new Error(errorMsg);
                                  }
                                  setOrders(prev => prev.filter(o => o._id !== order._id));
                                  setTimeout(() => { fetchAdminData(); }, 300);
                                  alert('Order deleted successfully!');
                                } catch (e) {
                                  setOrderError(e.message || 'Failed to delete order');
                                  // Log error for debugging
                                  console.error('Delete order exception:', e);
                                }
                              }}
                            >
                              &#128465;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            } />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <style>{`
        .admin-page {
          display: flex;
          min-height: 100vh;
          background: ${theme === "light" ? "#f7f7f7" : "#222"};
          color: ${theme === "light" ? "#222" : "#f7f7f7"};
        }
        .sidebar {
          width: 220px;
          background: ${theme === "light" ? "#fff" : "#333"};
          border-right: 1px solid ${theme === 'light' ? '#eee' : '#444'};
          transition: width 0.3s, left 0.3s;
          position: fixed;
          left: -220px;
          top: 0;
          bottom: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0 0.5rem;
        }
        .sidebar.open {
          left: 0;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1.5rem 1rem;
          border-bottom: 1px solid ${theme === 'light' ? '#eee' : '#444'};
        }
        .sidebar-username {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: ${theme === 'light' ? '#333' : '#ccc'};
          font-weight: 600;
          transition: background 0.2s, color 0.2s;
        }
        .sidebar-nav a:hover {
          background: #FFD70022;
          color: #FFD700;
        }
        .sidebar-nav a.active {
          background: #FFD700;
          color: #222;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid ${theme === 'light' ? '#eee' : '#444'};
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .theme-toggle, .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid transparent;
          font-weight: 600;
          cursor: pointer;
        }
        .theme-toggle {
          background: ${theme === 'light' ? '#eee' : '#444'};
          color: ${theme === 'light' ? '#333' : '#ccc'};
        }
        .logout-btn {
          background: #c002;
          color: #c00;
        }
        .admin-content {
          flex: 1;
          margin-left: 0;
          padding: 2rem;
          transition: margin-left 0.3s;
        }
        @media (min-width: 769px) {
          .admin-content {
            margin-left: ${sidebarOpen ? '220px' : '0'};
          }
        }
        .hamburger {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 101;
          background: #333;
          border: 1px solid #FFD700;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #FFD700;
          transition: background 0.2s;
        }
        .hamburger:hover {
          background: #FFD70022;
        }
        @media (min-width: 769px) {
          .hamburger {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Admin;