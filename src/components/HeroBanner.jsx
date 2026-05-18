"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './HeroBanner.css';

const HeroBanner = () => {
  const { banners } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto sliding logic
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <section className="hero-section container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', background: '#f1f5f9', borderRadius: 'var(--border-radius-lg)', color: '#94a3b8', fontStyle: 'italic', margin: '2rem auto' }}>
        No banners active on homepage. Customize via Admin Panel.
      </section>
    );
  }

  return (
    <section className="hero-section container">
      <div className="hero-carousel-wrapper">
        <div 
          className="hero-grid-slider"
          style={{ 
            transform: `translateX(calc(-${currentSlide} * (33.333% + 0.5rem)))`,
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="hero-banner-card">
              <div 
                className="hero-background" 
                style={{ backgroundImage: `url(${banner.background})` }}
              ></div>
              <div 
                className="hero-overlay"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 65%)' }}
              ></div>
              
              <div className="hero-content animate-fade-in">
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
                <button className="btn btn-primary">{banner.cta || 'Shop Now'}</button>
              </div>
            </div>
          ))}
          {/* Duplicating few items so it doesn't leave blank space at the end of the slide temporarily */}
          {banners.slice(0, 3).map((banner, index) => (
            <div key={`dup-${index}`} className="hero-banner-card">
              <div 
                className="hero-background" 
                style={{ backgroundImage: `url(${banner.background})` }}
              ></div>
              <div 
                className="hero-overlay"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 65%)' }}
              ></div>
              
              <div className="hero-content">
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
                <button className="btn btn-primary">{banner.cta || 'Shop Now'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
