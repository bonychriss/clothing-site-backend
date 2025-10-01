import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  // Country code mapping
  // Moved inside useEffect to avoid dependency warning
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  // Update phone prefix when country changes
  React.useEffect(() => {
    const countryCodes = {
      Tanzania: '+255',
      Kenya: '+254',
      Uganda: '+256',
      Rwanda: '+250',
      Burundi: '+257',
      'South Africa': '+27',
      Nigeria: '+234',
      Ghana: '+233',
    };
    if (country && countryCodes[country]) {
      if (!phone.startsWith(countryCodes[country])) {
        setPhone(prev => countryCodes[country] + (prev.replace(/^\+\d+/, '')));
      }
    }
  }, [country, phone]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, country })
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
        // Notify other components (like Navbar) that auth state has changed
        window.dispatchEvent(new Event('authChange'));
      }, 2500); // Redirect to home after 2.5s
    } catch (err) {
      setError('Registration failed');
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
        background: `url('/images/sliding barner2.jpg') center center / cover no-repeat`,
        position: 'relative',
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.10)', // more transparent
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        padding: '2rem 1.5rem 1.5rem', // smaller padding
        minWidth: 280, // smaller min width
        maxWidth: 340, // smaller max width
        width: '100%',
        backdropFilter: 'blur(18px)', // stronger blur
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.25)',
      }}>
        <h1 style={{ color: '#222', fontWeight: 800, fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Register</h1>
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Registering...</p>}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#222', fontWeight: 700, fontSize: '1.2rem' }}>Welcome to Sabor Español, {name}!</p>
            <p style={{ color: '#555', marginTop: 8 }}>Redirecting you now...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} />
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} />
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} placeholder="Enter your phone number" />
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }}>
              <option value="">Select Country</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Burundi">Burundi</option>
              <option value="South Africa">South Africa</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Other">Other</option>
            </select>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.7em 1em', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }} />
            <button type="submit" style={{ background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 700, fontSize: '1.1rem', marginTop: 8, cursor: 'pointer' }}>Register</button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ color: '#555', fontSize: '0.98rem' }}>Already have an account? <a href="/login" style={{ color: '#FFD700', fontWeight: 700, textDecoration: 'none' }}>Login</a></span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
