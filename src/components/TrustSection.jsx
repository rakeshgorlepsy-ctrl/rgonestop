"use client";

import React from 'react';
import { Truck, Zap, Palette, ShieldCheck } from 'lucide-react';
import './TrustSection.css';

const trustItems = [
  { id: 1, icon: <Truck size={36} />, title: 'Free Delivery', desc: 'On orders over ₹999' },
  { id: 2, icon: <Zap size={36} />, title: 'Fast Processing', desc: 'Shipped within 24-48 hrs' },
  { id: 3, icon: <Palette size={36} />, title: 'Custom Designs', desc: 'Personalized to your taste' },
  { id: 4, icon: <ShieldCheck size={36} />, title: 'Quality Guarantee', desc: 'Premium materials used' },
];

const TrustSection = () => {
  return (
    <section className="trust-section">
      <div className="container trust-container">
        {trustItems.map((item) => (
          <div key={item.id} className="trust-item">
            <div className="trust-icon">
              {item.icon}
            </div>
            <div className="trust-info">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSection;
