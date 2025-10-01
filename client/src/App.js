
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './styles.css';

const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Order = lazy(() => import('./pages/Order'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const SelectSize = lazy(() => import('./pages/SelectSize'));

function App() {
  return (
    <Router>
  {/* Only show Navbar if not on /admin route */}
  {!window.location.pathname.startsWith('/admin') && <Navbar />}
      <Routes>
        <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Home /></Suspense>} />
        <Route path="/products" element={<Suspense fallback={<div>Loading...</div>}><Products /></Suspense>} />
        <Route path="/products/:id" element={<Suspense fallback={<div>Loading...</div>}><ProductDetails /></Suspense>} />
        <Route path="/cart" element={<Suspense fallback={<div>Loading...</div>}><Cart /></Suspense>} />
        <Route path="/checkout" element={<Suspense fallback={<div>Loading...</div>}><Checkout /></Suspense>} />
        <Route path="/order" element={<Suspense fallback={<div>Loading...</div>}><Order /></Suspense>} />
        <Route path="/orders" element={<Suspense fallback={<div>Loading...</div>}><Orders /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<div>Loading...</div>}><Register /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>} />
        <Route path="/admin/*" element={<Suspense fallback={<div>Loading...</div>}><Admin /></Suspense>} />
        <Route path="/new-arrivals" element={<Suspense fallback={<div>Loading...</div>}><NewArrivalsPage /></Suspense>} />
        <Route path="/select-size" element={<Suspense fallback={<div>Loading...</div>}><SelectSize /></Suspense>} />
      </Routes>
    </Router>
  );
}

export default App;
