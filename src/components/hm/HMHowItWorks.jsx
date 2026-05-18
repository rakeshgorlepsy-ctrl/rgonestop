"use client";

import React from 'react';
import { Upload, Edit, Package } from 'lucide-react';
import './HMHowItWorks.css';

const steps = [
  {
    id: 1,
    title: 'Upload Photo',
    description: 'Pick your favorite memory from your gallery.',
    icon: <Upload size={32} />
  },
  {
    id: 2,
    title: 'Customize Design',
    description: 'Add text, stickers, or filters to make it unique.',
    icon: <Edit size={32} />
  },
  {
    id: 3,
    title: 'Order & Delivery',
    description: 'We print with love and deliver to your doorstep.',
    icon: <Package size={32} />
  }
];

const HMHowItWorks = () => {
  return (
    <section className="hm-how-it-works">
      <div className="hm-container">
        <div className="hm-section-header">
          <h2 className="hm-section-title">How It <span className="hm-highlight-yellow">Works</span></h2>
          <p className="hm-section-subtitle">Creating memories in 3 simple steps</p>
        </div>
        
        <div className="hm-steps-container">
          {steps.map((step, index) => (
            <div key={step.id} className="hm-step-item">
              <div className="hm-step-icon-wrap">
                {step.icon}
                <span className="hm-step-number">{index + 1}</span>
              </div>
              <h3 className="hm-step-title">{step.title}</h3>
              <p className="hm-step-description">{step.description}</p>
              {index < steps.length - 1 && <div className="hm-step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HMHowItWorks;
