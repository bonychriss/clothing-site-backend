import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/admin');

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

export default Layout;