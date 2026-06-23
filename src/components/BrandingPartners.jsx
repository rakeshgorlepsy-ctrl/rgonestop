"use client";

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './BrandingPartners.css';

const BrandingPartners = () => {
  const { brandingPartners } = useAuth();

  if (!brandingPartners || brandingPartners.length === 0) {
    return null; // Don't show the section if there are no partners
  }

  return (
    <section className="branding-partners-section container">
      <div className="section-header-compact">
        <h2>Branding Partners</h2>
        <div className="title-underline"></div>
      </div>

      <div className="partners-row-wrapper">
        <div className="partners-row">
          {brandingPartners.map((partner) => (
            <a
              key={partner.id}
              href={partner.websiteUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-circle-item hover-lift"
              title={partner.name || "Visit Partner"}
            >
              <div className="partner-circle-wrapper">
                <img
                  src={partner.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&auto=format&fit=crop'}
                  alt={partner.name || "Branding Partner"}
                  className="partner-img"
                />
              </div>
              <span className="partner-name">{partner.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandingPartners;
