import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserName(data.user.name);
      }
      setSuccess(true);
      setTimeout(() => {
        if (data.user && data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        // Notify other components (like Navbar) that auth state has changed
        window.dispatchEvent(new Event('authChange'));
      }, 2500);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `url('/images/bground.jpg') center center / cover no-repeat`,
        position: 'relative',
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.10)', // more transparent
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        padding: '2rem 1.5rem 1.5rem',
        minWidth: 280,
        maxWidth: 340,
        width: '100%',
        backdropFilter: 'blur(18px)', // stronger blur
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.25)',
      }}>
        <h1 style={{ color: '#222', fontWeight: 800, fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Login</h1>
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Logging in...</p>}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#222', fontWeight: 700, fontSize: '1.2rem' }}>Welcome to Sabor Español, {userName}!</p>
            <p style={{ color: '#555', marginTop: 8 }}>Redirecting you now...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} />
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} />
            <button type="submit" style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 700, fontSize: '1.1rem', marginTop: 8, cursor: 'pointer' }}>Login</button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ color: '#555', fontSize: '0.98rem' }}>Don't have an account? <a href="/register" style={{ color: '#FFD700', fontWeight: 700, textDecoration: 'none' }}>Register</a></span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
