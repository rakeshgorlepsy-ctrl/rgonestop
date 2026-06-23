"use client";

import React, { useState, useEffect } from 'react';
import { Home, Grid, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import './HMMobileNav.css';

const HMMobileNav = () => {
  const { user, setLoginModalOpen, logout } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isHMPage = pathname === '/hashtag-memories';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (pathname === '/master-xerox') return null;

  // Use the right WhatsApp number per page
  const whatsappNumber = isHMPage ? "916301919669" : "916301919669";
  const whatsappMessage = isHMPage
    ? "Hi Hashtag Memories! I'm interested in your personalized gifts."
    : "Hi RG OneStop! I need help with an order.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    // On HM page: scroll to .hm-circle-nav-section
    // On home page: scroll to #categories div
    const hmSection = document.querySelector('.hm-circle-nav-section');
    const homeSection = document.querySelector('#categories');
    const target = hmSection || homeSection;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAccountClick = () => {
    if (user) {
      if (window.confirm(`Logged in as ${user.name}. Do you want to sign out?`)) {
        logout();
      }
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <nav className={`hm-mobile-nav ${isHMPage ? 'hm-theme' : 'rg-theme'}`}>
      {/* Home */}
      <Link href="/" className={`hm-mobile-nav-item ${isHomePage ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </Link>

      {/* Categories - smart scroll */}
      <button
        className="hm-mobile-nav-item"
        onClick={handleCategoriesClick}
        type="button"
      >
        <Grid size={22} />
        <span>Categories</span>
      </button>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hm-mobile-nav-item whatsapp"
      >
        <div className="hm-mobile-nav-icon-bg">
          <MessageCircle size={24} fill="white" strokeWidth={1.5} />
        </div>
        <span>WhatsApp</span>
      </a>

      {/* Account — unified auth integration */}
      <button
        className="hm-mobile-nav-item"
        type="button"
        onClick={handleAccountClick}
      >
        {isMounted && user ? (
          <img src={user.avatar} alt={user.name} className="hm-mobile-nav-avatar" />
        ) : (
          <User size={22} />
        )}
        <span>{isMounted && user ? 'Sign Out' : 'Account'}</span>
      </button>
    </nav>
  );
};

export default HMMobileNav;

