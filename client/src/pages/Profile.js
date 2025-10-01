import React, { useState, useEffect } from 'react';

// Logout logic
const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login';
};
// Simple icon placeholders (replace with real icons or SVGs as needed)
const UserIcon = () => <span style={{ fontSize: 28, marginRight: 12 }}>👤</span>;
const EmailIcon = () => <span style={{ fontSize: 22, marginRight: 10 }}>📧</span>;
const CalendarIcon = () => <span style={{ fontSize: 22, marginRight: 10 }}>📅</span>;
const AddressIcon = () => <span style={{ fontSize: 20, marginRight: 8 }}>🏠</span>;
const StatusBadge = ({ status }) => (
  <span style={{
    display: 'inline-block',
    padding: '0.2em 0.8em',
    borderRadius: 12,
    background: status === 'Delivered' ? '#d4f8e8' : '#ffe7ba',
    color: status === 'Delivered' ? '#1a7f37' : '#b8860b',
    fontWeight: 600,
    fontSize: '0.95em',
    marginLeft: 8
  }}>{status}</span>
);

function Profile() {
  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [user, setUser] = useState(localUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Handle profile photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Implement upload logic
  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('photo', profilePhoto);
    try {
      const res = await fetch('/api/auth/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        setUser(u => ({ ...u, avatarUrl: data.avatarUrl }));
        setProfilePhoto(null);
        setPhotoPreview(null);
        alert('Profile photo updated!');
      } else {
        alert(data.message || 'Failed to upload photo.');
      }
    } catch (err) {
      alert('Error uploading photo.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch('/api/orders/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([userData, ordersData]) => {
        setUser(userData);
        console.log('Orders data from backend:', ordersData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordForm)
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordMsg('Password changed successfully.');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } else {
      setPasswordMsg(data.message || 'Failed to change password.');
    }
  };

  if (loading)
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', fontFamily: 'Inter, Arial, sans-serif', padding: '0 0.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '3rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px rgba(0,0,0,0.08)', padding: '2.5rem 2rem' }}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem', letterSpacing: 1 }}>User Profile</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', fontFamily: 'Inter, Arial, sans-serif', padding: '0 0.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '3rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px rgba(0,0,0,0.08)', padding: '2.5rem 2rem' }}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem', letterSpacing: 1 }}>User Profile</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );

  // Responsive: stack columns on mobile
  const mediaQuery = `
    @media (max-width: 900px) {
      .profile-columns {
        flex-direction: column !important;
      }
    }
  `;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', fontFamily: 'Inter, Arial, sans-serif', padding: '0 0.5rem' }}>
      <style>{mediaQuery}</style>
      <div style={{ maxWidth: 1100, margin: '3rem auto', background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1.5rem' }}>
          <button onClick={handleLogout} style={{ background: '#FFD700', color: '#222', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>Logout</button>
        </div>
        {/* Header with avatar, name, email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: 90, height: 90 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #fffbe6 0%, #ffd700 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, color: '#b8860b', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="profile preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                user?.name ? user.name[0].toUpperCase() : <UserIcon />
              )}
            </div>
            <label htmlFor="profile-photo-upload" style={{ position: 'absolute', bottom: -10, right: -10, background: '#FFD700', borderRadius: '50%', padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer', border: '2px solid #fff' }}>
              <span role="img" aria-label="upload" style={{ fontSize: 22 }}>📷</span>
              <input id="profile-photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
            {profilePhoto && (
              <button type="button" onClick={handlePhotoUpload} style={{ position: 'absolute', top: -10, right: -10, background: '#fff', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 8, padding: '0.3em 0.7em', fontWeight: 600, fontSize: '0.95em', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>Upload</button>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ color: '#888', fontSize: '1.05rem', marginBottom: 2 }}>
              <EmailIcon /> {user?.email}
            </div>
          </div>
        </div>
        {/* Two columns */}
        <div className="profile-columns" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Left column: profile info + password */}
          <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Profile Info Card */}
            <div style={{ background: '#f7f7fa', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '1.5rem 1.2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '1rem' }}>Profile Details</h3>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.08rem', marginBottom: 12 }}><UserIcon /> <span><strong>Name:</strong> {user?.name}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.08rem', marginBottom: 12 }}><EmailIcon /> <span><strong>Email:</strong> {user?.email}</span></div>
              {user?.registeredAt && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.08rem', marginBottom: 12 }}><CalendarIcon /> <span><strong>Registered At:</strong> {new Date(user.registeredAt).toLocaleDateString()}</span></div>
              )}
              {/* Add other registration details here */}
            </div>
            {/* Password Change Card */}
            <div style={{ background: '#f7f7fa', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '1.5rem 1.2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '1rem' }}>Change Password</h3>
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                  required
                  style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  required
                  style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                />
                <button type="submit" style={{ background: '#FFD700', color: '#222', fontWeight: 600, border: 'none', borderRadius: 8, padding: '0.8rem 0', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>Change Password</button>
              </form>
              {passwordMsg && (
                <span style={{
                  display: 'inline-block',
                  padding: '0.3em 1em',
                  borderRadius: 14,
                  background: passwordMsg.includes('success') ? '#d4f8e8' : '#ffe7ba',
                  color: passwordMsg.includes('success') ? '#1a7f37' : '#b8860b',
                  fontWeight: 600,
                  fontSize: '1em',
                  marginTop: 8
                }}>
                  {passwordMsg}
                </span>
              )}
            </div>
          </div>
          {/* Right column: order history */}
          <div style={{ flex: 1.2, minWidth: 320 }}>
            <div style={{ background: '#f7f7fa', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '1.5rem 1.2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '1rem' }}>Order History</h3>
              {orders.length === 0 ? (
                <p style={{ fontSize: '1.05rem', color: '#888' }}>No orders yet.</p>
              ) : (
                orders.map(order => {
                  const expanded = expandedOrder === (order._id || order.id);
                  return (
                    <div
                      key={order._id || order.id}
                      style={{
                        marginBottom: '1.2rem',
                        border: '1px solid #FFD700',
                        background: '#fffbe6',
                        borderRadius: 12,
                        boxShadow: expanded ? '0 4px 16px rgba(218,165,32,0.10)' : '0 1px 4px rgba(0,0,0,0.03)',
                        padding: '1rem 1.2rem',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s'
                      }}
                      onClick={() => setExpandedOrder(expanded ? null : (order._id || order.id))}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}><strong>Order ID:</strong> {order._id || order.id}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <span style={{ fontSize: 18, marginLeft: 12 }}>{expanded ? '▲' : '▼'}</span>
                      </div>
                      <div style={expanded ? { maxHeight: 500, transition: 'max-height 0.3s' } : { overflow: 'hidden', maxHeight: 0, transition: 'max-height 0.3s' }}>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.08rem', marginBottom: 12 }}><AddressIcon /> <span><strong>Delivery Address:</strong> {order.customer?.address}</span></div>
                          <h4 style={{ margin: '1rem 0 0.5rem 0', fontWeight: 600 }}>Items:</h4>
                          <ul style={{ paddingLeft: 18 }}>
                            {(order.items || []).map((item, idx) => (
                              <li key={idx} style={{ fontSize: '1rem', marginBottom: 4 }}>{item.name} x {item.quantity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
