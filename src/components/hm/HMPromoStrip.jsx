"use client";

import React from 'react';
import './HMPromoStrip.css';

const HMPromoStrip = ({ title, subtitle, cta, image }) => {
  return (
    <section className="hm-promo-strip-section" style={{ backgroundImage: `url(${image})` }}>
      <div className="hm-promo-overlay">
        <div className="hm-container">
          <div className="hm-promo-content">
            <div className="hm-promo-text">
              <h3>{subtitle}</h3>
              <h2>{title}</h2>
            </div>
            <button className="hm-btn accent">{cta}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HMPromoStrip;
