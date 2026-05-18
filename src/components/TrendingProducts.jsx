"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TrendingProducts.css';

const TrendingProducts = () => {
  const { products } = useAuth();

  return (
    <section className="trending-section container">
      <div className="section-header">
        <h2>Trending Products</h2>
        <div className="title-underline"></div>
      </div>

      <div className="products-grid">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop'} 
                  alt={product.name} 
                  className="product-image" 
                />
                <div className="product-overlay">
                  <button 
                    className="btn btn-primary add-to-cart-btn" 
                    onClick={() => alert(`${product.name} added to cart! (Shopping Cart Drawer feature under construction)`)}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-pricing">
                  <span className="current-price" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{product.price}</span>
                  {product.originalPrice && (
                    <span className="original-price" style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: '2rem' }}>
            No trending products available right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
