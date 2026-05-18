"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import './HMHero.css';

const HMHero = () => {
  return (
    <section className="hm-hero-section">
      <div className="hm-hero-background">
         {/* Unsplash creative photography / polaroid background */}
         <img 
           src="https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1600&auto=format&fit=crop" 
           alt="Camera and Memories" 
           className="hm-hero-img" 
         />
         <div className="hm-hero-overlay"></div>
      </div>
      
      <div className="hm-container hm-hero-content">
        <div className="hm-hero-text-block">
          <h1 className="hm-hero-title">
            Turn Your <span className="hm-highlight-red">Memories</span> into<br/>
            Beautiful <span className="hm-highlight-yellow">Creations</span>
          </h1>
          <p className="hm-hero-subtitle">
            Personalized gifts, prints & creative photo products customized exactly how you envision them.
          </p>
          <div className="hm-hero-actions">
            <button className="hm-btn">
              <Sparkles size={20} />
              Customize Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HMHero;
