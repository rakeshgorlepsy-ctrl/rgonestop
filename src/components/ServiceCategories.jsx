"use client";

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ServiceCategories.css';

const ServiceCategories = () => {
  const { setAddBusinessModalOpen, user, setLoginModalOpen, serviceCategories } = useAuth();

  const handleCategoryClick = () => {
    if (user) {
      setAddBusinessModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <section className="service-categories-section container" id="service-categories">
      <div className="section-header-compact">
        <h2>Service Categories</h2>
        <p className="service-categories-subtitle">Add your Business Categories</p>
        <div className="title-underline"></div>
      </div>

      <div className="service-categories-grid">
        {serviceCategories && serviceCategories.length > 0 ? (
          serviceCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="service-category-card hover-lift"
              onClick={handleCategoryClick}
              title="Click to register your business in this category"
            >
              <div className="service-category-icon-wrapper">
                <span className="service-category-emoji">{cat.emoji || '💼'}</span>
              </div>
              <h3 className="service-category-card-title">{cat.title || cat.name}</h3>
            </div>
          ))
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
            No service categories active. Customize via Admin Panel.
          </p>
        )}
      </div>
    </section>
  );
};

export default ServiceCategories;
