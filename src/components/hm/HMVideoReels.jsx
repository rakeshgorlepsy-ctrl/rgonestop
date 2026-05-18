"use client";

import React from 'react';
import { Play } from 'lucide-react';
import './HMVideoReels.css';

const reels = [
  { id: 1, thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop', title: 'Photo Frame Reveal' },
  { id: 2, thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop', title: 'Gift Packing Magic' },
  { id: 3, thumbnail: 'https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?q=80&w=400&auto=format&fit=crop', title: 'Polaroid Collection' },
  { id: 4, thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop', title: 'Custom Mugs Crafting' },
  { id: 5, thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop', title: 'Memory Box Unboxing' },
];

const HMVideoReels = () => {
  return (
    <section className="hm-reels-section hm-section-padding">
      <div className="hm-container">
        <div className="hm-section-header">
          <h2>Trending Stories</h2>
          <p>Watch how we make your memories special</p>
        </div>
        <div className="hm-reels-wrapper">
          {reels.map(reel => (
            <div key={reel.id} className="hm-reel-card">
              <img src={reel.thumbnail} alt={reel.title} />
              <div className="hm-reel-overlay">
                <Play size={32} fill="white" />
              </div>
              <span className="hm-reel-title">{reel.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HMVideoReels;
