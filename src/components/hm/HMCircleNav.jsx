"use client";

import React from 'react';
import './HMCircleNav.css';

const navItems = [
  { id: 1, title: 'Polaroids', icon: 'https://cdn-icons-png.flaticon.com/128/1042/1042339.png' },
  { id: 2, title: 'Chocolates', icon: 'https://cdn-icons-png.flaticon.com/128/3141/3141387.png' },
  { id: 3, title: 'Stickers', icon: 'https://cdn-icons-png.flaticon.com/128/10471/10471694.png' },
  { id: 4, title: 'Magnets', icon: 'https://cdn-icons-png.flaticon.com/128/4562/4562544.png' },
  { id: 5, title: 'Keychains', icon: 'https://cdn-icons-png.flaticon.com/128/2312/2312918.png' },
  { id: 6, title: 'Frames', icon: 'https://cdn-icons-png.flaticon.com/128/2422/2422312.png' },
  { id: 7, title: 'Invitations', icon: 'https://cdn-icons-png.flaticon.com/128/3067/3067451.png' },
  { id: 8, title: 'Cards', icon: 'https://cdn-icons-png.flaticon.com/128/1647/1647897.png' },
  { id: 9, title: 'Books', icon: 'https://cdn-icons-png.flaticon.com/128/2904/2904843.png' },
  { id: 10, title: 'New Arrivals', icon: 'https://cdn-icons-png.flaticon.com/128/4264/4264832.png' },
];

const HMCircleNav = () => {
  return (
    <div className="hm-circle-nav-section">
      <div className="hm-container">
        <div className="hm-circle-nav-wrapper">
          {navItems.map(item => (
            <div key={item.id} className="hm-circle-item">
              <div className="hm-circle-icon-box">
                <img src={item.icon} alt={item.title} />
              </div>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HMCircleNav;
