"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Camera, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import './HMHeader.css';

const HMHeader = () => {
  const { user, setLoginModalOpen, logout } = useAuth();
  const [activeCity, setActiveCity] = useState("Hyderabad");

  // Read the globally selected city on load and update dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveCity(localStorage.getItem('rg_detected_city') || "Hyderabad");
    };
    handleStorageChange();
    
    // Add custom listener for location updates
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="hm-header">
      <div className="hm-container">
        <div className="hm-header-main">
          {/* Logo Section */}
          <Link href="/hashtag-memories" className="hm-brand">
            <div className="hm-brand-icon">
              <Camera size={28} />
            </div>
            <div className="hm-brand-info">
              <span className="hm-brand-name">HASHTAG</span>
              <span className="hm-brand-sub">Memories</span>
            </div>
          </Link>

          {/* Location Selector (Synced with homepage) */}
          <div className="hm-location-box" title="City synchronized with RG OneStop homepage">
            <MapPin size={18} className="hm-pin-icon" />
            <div className="hm-loc-text">
              <span className="hm-loc-label">Deliver to</span>
              <span className="hm-loc-value">{activeCity}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hm-search-container">
            <input type="text" placeholder="Search for unique gifts, photo frames..." className="hm-search-input" />
            <button className="hm-search-btn">
              <Search size={20} />
            </button>
          </div>

          {/* Action Icons */}
          <div className="hm-header-actions">
            {user ? (
              <div className="hm-action-group logged-in" onClick={logout} title="Click to Logout">
                <img src={user.avatar} alt={user.name} className="hm-user-avatar" />
                <span>Sign Out</span>
              </div>
            ) : (
              <div className="hm-action-group" onClick={() => setLoginModalOpen(true)}>
                <User size={22} />
                <span>Login</span>
              </div>
            )}
            
            <div className="hm-action-group">
              <div className="hm-cart-badge-container">
                <ShoppingCart size={22} />
                <span className="hm-cart-badge">0</span>
              </div>
              <span>Cart</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <nav className="hm-header-nav">
          <Link href="/">RG Home</Link>
          <Link href="/hashtag-memories">New Arrivals</Link>
          <a href="#personalized">Personalized</a>
          <a href="#corporate">Corporate Gifts</a>
          <a href="#bestsellers">Best Sellers</a>
          <a href="#offers" className="highlight">Offers</a>
        </nav>
      </div>
    </header>
  );
};

export default HMHeader;
