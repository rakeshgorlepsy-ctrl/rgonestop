"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import './HeroBanner.css';

const HeroBanner = () => {
  const { banners, isLoading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const displayedBanners = banners || [];

  // Auto-slide
  useEffect(() => {
    if (displayedBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayedBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [displayedBanners.length]);

  // Reset slide index when banners change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [banners?.length]);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="hero-section container">
        <div className="hero-skeleton-box">
          <div className="hero-skeleton-shimmer" />
        </div>
      </section>
    );
  }

  // No banners
  if (displayedBanners.length === 0) {
    return (
      <section className="hero-section container">
        <div className="hero-empty-box">
          <span>No banners active. Add banners from the Admin Panel.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section container">
      <div className="hero-carousel-wrapper">
        <div
          className="hero-grid-slider"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {displayedBanners.map((banner) => {
            const isExternal = banner.link && (banner.link.startsWith('http://') || banner.link.startsWith('https://'));
            if (isExternal) {
              return (
                <a
                  href={banner.link}
                  key={banner.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-banner-card"
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  <div
                    className="hero-background"
                    style={{ backgroundImage: `url(${banner.background})` }}
                  ></div>
                  {/* Text overlay */}
                  <div className="hero-banner-overlay">
                    {banner.title && <h2 className="hero-banner-title">{banner.title}</h2>}
                    {banner.subtitle && <p className="hero-banner-subtitle">{banner.subtitle}</p>}
                    {banner.cta && (
                      <span className="hero-banner-cta">{banner.cta} →</span>
                    )}
                  </div>
                </a>
              );
            }
            return (
              <Link
                href={banner.link || '#'}
                key={banner.id}
                className="hero-banner-card"
                style={{ cursor: banner.link ? 'pointer' : 'default', textDecoration: 'none' }}
              >
                <div
                  className="hero-background"
                  style={{ backgroundImage: `url(${banner.background})` }}
                ></div>
                {/* Text overlay */}
                <div className="hero-banner-overlay">
                  {banner.title && <h2 className="hero-banner-title">{banner.title}</h2>}
                  {banner.subtitle && <p className="hero-banner-subtitle">{banner.subtitle}</p>}
                  {banner.cta && (
                    <span className="hero-banner-cta">{banner.cta} →</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dot indicators */}
        {displayedBanners.length > 1 && (
          <div className="hero-indicators">
            {displayedBanners.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;

