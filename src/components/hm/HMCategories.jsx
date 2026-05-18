"use client";

import React from 'react';
import './HMCategories.css';

const categories = [
  { id: 1, title: 'Polaroid Photos', image: 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?q=80&w=600&auto=format&fit=crop' },
  { id: 2, title: 'Photo Chocolate', image: 'https://images.unsplash.com/photo-1548907040-4bb42b021a9b?q=80&w=600&auto=format&fit=crop' },
  { id: 3, title: 'Posters & Stickers', image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=600&auto=format&fit=crop' },
  { id: 4, title: 'Acrylic Fridge Magnet', image: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=600&auto=format&fit=crop' },
  { id: 5, title: 'Acrylic Magnet with Stand', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' },
  { id: 6, title: 'Flexible Budget Magnets', image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=600&auto=format&fit=crop' },
  { id: 7, title: 'Round Badges', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop' },
  { id: 8, title: 'Round Keychains', image: 'https://images.unsplash.com/photo-1611080340332-9cb77353f47e?q=80&w=600&auto=format&fit=crop' },
  { id: 9, title: 'Round Fridge Magnets', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' },
  { id: 10, title: 'Photo Frames', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop' },
  { id: 11, title: 'Invitations', image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=600&auto=format&fit=crop' },
  { id: 12, title: 'Visiting Cards', image: 'https://images.unsplash.com/photo-1589118949245-7d40af0ea155?q=80&w=600&auto=format&fit=crop' },
  { id: 13, title: 'Magazines', image: 'https://images.unsplash.com/photo-1535446168903-46ff8523c76f?q=80&w=600&auto=format&fit=crop' },
  { id: 14, title: 'Photo Book', image: 'https://images.unsplash.com/photo-1544816153-12ad5d714b21?q=80&w=600&auto=format&fit=crop' },
];

const HMCategories = () => {
  return (
    <section className="hm-categories-section">
      <div className="hm-container">
        <div className="hm-section-header">
          <h2 className="hm-section-title">Explore Our <span className="hm-highlight-red">Categories</span></h2>
          <p className="hm-section-subtitle">Find the perfect canvas for your memories</p>
        </div>
        
        <div className="hm-categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="hm-category-card">
              <div className="hm-category-image-wrap">
                <img src={cat.image} alt={cat.title} className="hm-category-img" />
                <div className="hm-category-overlay">
                  <button className="hm-btn-small">View All</button>
                </div>
              </div>
              <h3 className="hm-category-title">{cat.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HMCategories;
