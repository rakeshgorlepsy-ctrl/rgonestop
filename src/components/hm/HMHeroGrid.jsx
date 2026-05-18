"use client";

import React from 'react';
import './HMHeroGrid.css';

const HMHeroGrid = () => {
  return (
    <section className="hm-hero-grid-section">
      <div className="hm-container">
        <div className="hm-hero-grid-layout">
          {/* Main Large Banner */}
          <div className="hm-hero-main-card">
            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop" alt="Personalized Gifts" />
            <div className="hm-hero-content">
              <h3>Create Moments That Last</h3>
              <h1>Personalized Gifts For Every Occasion</h1>
              <p>Turn your favorite memories into premium photo gifts, frames, and chocolates.</p>
              <button className="hm-btn">Shop Now</button>
            </div>
          </div>

          {/* Side Banners */}
          <div className="hm-hero-side-cards">
            <div className="hm-hero-side-card pink">
              <img src="https://images.unsplash.com/photo-1548907040-4bb42b021a9b?q=80&w=600&auto=format&fit=crop" alt="Photo Chocolates" />
              <div className="hm-hero-side-content">
                <h4>Sweet Memories</h4>
                <h2>Photo Chocolates</h2>
                <span>Premium Collection</span>
              </div>
            </div>
            <div className="hm-hero-side-card gold">
              <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop" alt="Custom Frames" />
              <div className="hm-hero-side-content">
                <h4>Elegant Decor</h4>
                <h2>Acrylic Frames</h2>
                <span>Custom Designs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HMHeroGrid;
