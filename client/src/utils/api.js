// Basic API utility for making requests
// You can customize this as needed for your project

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://sabor-espanol-ed87.onrender.com';

export async function fetchFromApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    // Try to parse the error response from the server
    try {
      const errorData = await res.json();
      // Create a new error object with the server's message
      const error = new Error(errorData.message || `API error: ${res.status}`);
      error.data = errorData; // Attach full error data
      throw error;
    } catch (e) {
      // If parsing fails, throw a generic error
      throw new Error(`API error: ${res.status}`);
    }
  }
  return res.json();
}
