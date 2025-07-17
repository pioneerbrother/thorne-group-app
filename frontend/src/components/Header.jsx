import React from 'react';
import { Link } from 'react-router-dom'; // To link back to the homepage
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="logo-container">
        <img src="/thorne-logo.png" alt="The Thorne Group Logo" className="logo-img" />
        <span className="logo-text">The Thorne Group</span>
      </Link>
      {/* You can add navigation links here in the future if needed */}
    </header>
  );
}

export default Header;