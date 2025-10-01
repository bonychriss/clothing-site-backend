// Basic API utility for making requests
// You can customize this as needed for your project

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://sabor-espanol-ed87.onrender.com';

export async function fetchFromApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
