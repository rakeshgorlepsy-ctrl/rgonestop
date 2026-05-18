"use client";

import React from 'react';
import './HMTrending.css';

const products = [
  { id: 1, title: 'Acrylic Memory Frame', price: '₹499', oldPrice: '₹799', image: 'https://images.unsplash.com/photo-1544133782-4613589b9643?q=80&w=600&auto=format&fit=crop', category: 'Best Seller' },
  { id: 2, title: 'Personalized Photo Choco', price: '₹599', oldPrice: '₹899', image: 'https://images.unsplash.com/photo-1548907040-4bb42b021a9b?q=80&w=600&auto=format&fit=crop', category: 'Sweet Gifts' },
  { id: 3, title: 'Vintage Polaroid Set', price: '₹299', oldPrice: '₹499', image: 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?q=80&w=600&auto=format&fit=crop', category: 'Most Loved' },
  { id: 4, title: 'Custom Magic Mug', price: '₹399', oldPrice: '₹599', image: 'https://images.unsplash.com/photo-1517256011261-502111065939?q=80&w=600&auto=format&fit=crop', category: 'Surprise' },
];

const HMTrending = ({ title = "Trending Now", subtitle = "Explore our most popular photo gifts" }) => {
  return (
    <section className="hm-trending-section hm-section-padding">
      <div className="hm-container">
        <div className="hm-section-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="hm-product-grid">
          {products.map(product => (
            <div key={product.id} className="hm-product-card">
              <div className="hm-product-image-box">
                <img src={product.image} alt={product.title} />
                <span className="hm-product-tag">{product.category}</span>
              </div>
              <div className="hm-product-info">
                <h3>{product.title}</h3>
                <div className="hm-product-pricing">
                  <span className="hm-tagline">Price on Request</span>
                </div>
                <button className="hm-btn accent">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HMTrending;
