"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import './ServiceCategories.css';

const ServiceCategories = () => {
  const { serviceCategories, businesses, isLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const catId = searchParams.get('catId');
  const catName = searchParams.get('category');

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
  };

  const handleClosePanel = () => {
    setActiveCategory(null);
    // Remove query parameters from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('catId');
    url.searchParams.delete('category');
    router.replace(url.pathname + url.search);
  };

  const isClientCategory = (categoryName) => {
    if (!categoryName) return false;
    const name = categoryName.toLowerCase();
    return (
      name.includes("master xerox") ||
      name.includes("hashtag memories") ||
      name.includes("flex & banner") ||
      name.includes("binding & stationer") ||
      name.includes("creative graphic")
    );
  };

  const filteredBusinesses = activeCategory
    ? businesses.filter(b => 
        b.verified === true && 
        !isClientCategory(b.category) && (
          (b.category || '').toLowerCase().includes((activeCategory.title || activeCategory.name || '').toLowerCase()) ||
          (activeCategory.title || activeCategory.name || '').toLowerCase().includes((b.category || '').toLowerCase())
        )
      )
    : [];

  React.useEffect(() => {
    if (isLoading || !serviceCategories || serviceCategories.length === 0) return;
    
    if (catId) {
      const found = serviceCategories.find(c => c.id === catId);
      if (found && (!activeCategory || activeCategory.id !== catId)) {
        setActiveCategory(found);
        setTimeout(() => {
          const el = document.getElementById('service-categories');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (catName) {
      const found = serviceCategories.find(c => (c.title || c.name || '').toLowerCase() === catName.toLowerCase());
      if (found && (!activeCategory || (activeCategory.title || activeCategory.name || '').toLowerCase() !== catName.toLowerCase())) {
        setActiveCategory(found);
        setTimeout(() => {
          const el = document.getElementById('service-categories');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [catId, catName, serviceCategories, isLoading, activeCategory]);

  return (
    <>
      <section className="service-categories-section container" id="service-categories">
        <div className="section-header-compact">
          <h2>One Stop Categories</h2>
          <p className="service-categories-subtitle">Find businesses & services near you</p>
          <div className="title-underline"></div>
        </div>

        <div className="service-categories-grid">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="service-category-card sc-skeleton">
                <div className="sc-skeleton-icon"></div>
                <div className="sc-skeleton-text"></div>
              </div>
            ))
          ) : serviceCategories && serviceCategories.length > 0 ? (
            serviceCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="service-category-card hover-lift"
                onClick={() => handleCategoryClick(cat)}
                title={`View ${cat.title || cat.name} listings`}
              >
                <div className="service-category-icon-wrapper">
                  {cat.logo || cat.image ? (
                    <img src={cat.logo || cat.image} alt={cat.title || cat.name} className="service-category-logo" />
                  ) : (
                    <span className="service-category-emoji">{cat.emoji || '💼'}</span>
                  )}
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

      {/* Category Listings Slide Panel */}
      {activeCategory && (
        <div className="sc-panel-backdrop" onClick={handleClosePanel}>
          <div className="sc-panel" onClick={e => e.stopPropagation()}>
            <div className="sc-panel-header">
              <div className="sc-panel-title-row">
                {activeCategory.logo || activeCategory.image ? (
                  <img src={activeCategory.logo || activeCategory.image} alt={activeCategory.title || activeCategory.name} className="sc-panel-logo" />
                ) : (
                  <span className="sc-panel-emoji">{activeCategory.emoji || '💼'}</span>
                )}
                <div>
                  <h3>{activeCategory.title || activeCategory.name}</h3>
                  <p>{filteredBusinesses.length} listing{filteredBusinesses.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
              <button className="sc-panel-close" onClick={handleClosePanel}>✕</button>
            </div>
            <div className="sc-panel-body">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map(biz => (
                  <div key={biz.id} className="sc-biz-card">
                    {biz.logo ? (
                      <img src={biz.logo} alt={biz.businessName} className="sc-biz-logo" />
                    ) : (
                      <div className="sc-biz-logo-placeholder">
                        {(biz.businessName || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="sc-biz-info">
                      <h4>{biz.businessName}</h4>
                      <p className="sc-biz-addr">{biz.address || biz.city}</p>
                      {biz.contactNumber && (
                        <a href={`tel:${biz.contactNumber}`} className="sc-biz-phone">📞 {biz.contactNumber}</a>
                      )}
                      {biz.timings && <span className="sc-biz-timing">⏰ {biz.timings}</span>}
                    </div>
                    {biz.verified && <span className="sc-biz-verified">✓ Verified</span>}
                  </div>
                ))
              ) : (
                <div className="sc-empty">
                  {activeCategory.logo || activeCategory.image ? (
                    <img src={activeCategory.logo || activeCategory.image} alt={activeCategory.title || activeCategory.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>{activeCategory.emoji || '💼'}</span>
                  )}
                  <h4>No businesses listed yet</h4>
                  <p>Be the first to register your {activeCategory.title || activeCategory.name} business!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceCategories;

