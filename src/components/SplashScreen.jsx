"use client";

import React, { useState, useEffect, useRef } from 'react';
import './SplashScreen.css';

// Colours: gold, white, orange, light-yellow
const SPARKLE_COLORS = ['#FFD700', '#FFFFFF', '#FFA500', '#FFFACD', '#FF8C00', '#FFE066'];

const SplashScreen = ({ onComplete }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [particles, setParticles] = useState([]);
  const launchingRef = useRef(false);

  const createParticles = () => {
    const newParticles = [];
    // 60 particles for a dramatic burst
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}`,
        angle: Math.random() * 360,
        // High velocity: particles fly 80px–250px
        dist: Math.random() * 170 + 80,
        // Varied sizes: 4px–18px
        size: Math.random() * 14 + 4,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        // Slight delay stagger so they don't all launch identically
        delay: Math.random() * 0.15,
        // Duration variation for natural feel
        duration: Math.random() * 0.5 + 0.9,
        // Some particles are stars, some circles
        shape: Math.random() > 0.4 ? 'circle' : 'star',
      });
    }
    setParticles(newParticles);
  };

  const handleLaunch = (e) => {
    if (launchingRef.current) return;
    launchingRef.current = true;
    setIsLaunching(true);

    if (e) createParticles();
    // Restore scroll early so homepage is ready
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Wait for fade-out animation to complete before unmounting
    setTimeout(() => {
      onComplete();
    }, 1400);
  };

  useEffect(() => {
    // Fix shake: reserve scrollbar space instead of hiding overflow
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    const autoClose = setTimeout(() => {
      if (!launchingRef.current) handleLaunch();
    }, 5500);

    return () => {
      clearTimeout(autoClose);
      // Restore without layout shift
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`splash-overlay ${isLaunching ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-container">
          <img src="/assets/logo.png" alt="RG OneStop" className="splash-logo" />
        </div>

        <h1 className="splash-title">Welcome to RG OneStop</h1>
        <p className="splash-subtitle">Your one-stop shop for custom gifts & printing</p>

        <div className="launch-btn-wrapper">
          <button
            className={`launch-btn ${isLaunching ? 'launching' : ''}`}
            onClick={handleLaunch}
          >
            <span>🚀 Launch Now</span>
            {isLaunching && <div className="burst-ring"></div>}
          </button>

          {/* Particles anchored to button center */}
          {particles.map(p => (
            <div
              key={p.id}
              className={`sparkle-particle ${p.shape}`}
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
                '--size': `${p.size}px`,
                '--delay': `${p.delay}s`,
                '--dur': `${p.duration}s`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size / 2}px ${p.color}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Expanding radial backdrop */}
      <div className={`radial-burst ${isLaunching ? 'active' : ''}`} />
    </div>
  );
};

export default SplashScreen;
