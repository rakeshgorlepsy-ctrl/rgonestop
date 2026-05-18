"use client";

import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ServicesSection.css';

const ServicesSection = () => {
  const { businesses, currentCity, setAddBusinessModalOpen, user, setLoginModalOpen } = useAuth();

  // Filter only verified businesses for the active city
  const localVerified = businesses.filter(
    (b) => b.verified && b.city.toLowerCase() === currentCity.toLowerCase()
  );

  // Fallback: If no verified listings in this city, get any other verified listings to show as "Featured"
  const otherVerified = businesses.filter(
    (b) => b.verified && b.city.toLowerCase() !== currentCity.toLowerCase()
  );

  const handleRegisterClick = () => {
    if (user) {
      setAddBusinessModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  const renderBusinessCard = (b) => {
    // Generate clean WhatsApp link
    const waText = encodeURIComponent(`Hi ${b.businessName}! I found your listing on RG OneStop and want to inquire about your services.`);
    const waUrl = `https://wa.me/${b.whatsappNumber}?text=${waText}`;

    return (
      <div key={b.id} className="service-card glass-premium hover-glow animate-fade-in">
        <div className="card-top-accent"></div>
        
        <div className="service-card-header">
          <div className="service-badge-wrapper">
            <span className="service-category-badge">{b.category}</span>
            <span className="service-verified-badge animate-pulse-green" title="Verified Service Provider">
              <ShieldCheck size={14} className="verified-icon" />
              <span>Verified</span>
            </span>
          </div>
          <h3 className="service-title">{b.businessName}</h3>
        </div>

        <div className="service-card-body">
          <p className="service-desc">{b.description}</p>
          
          <div className="service-details-list">
            <div className="detail-row">
              <MapPin size={15} className="detail-icon" />
              <span className="detail-txt">{b.address}, {b.city}</span>
            </div>
            {b.timings && (
              <div className="detail-row">
                <Clock size={15} className="detail-icon" />
                <span className="detail-txt">{b.timings}</span>
              </div>
            )}
          </div>
        </div>

        <div className="service-card-actions">
          <a href={`tel:${b.contactNumber}`} className="service-act-btn call-btn">
            <Phone size={16} />
            <span>Call Service</span>
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="service-act-btn whatsapp-btn">
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <section className="services-section container" id="services">
      <div className="section-header-row">
        <div className="section-title-group">
          <h2>Local Services & Printers</h2>
          <p className="section-subtitle">
            Verified local providers delivering premium prints, photocopies, and custom gifts in <strong>{currentCity}</strong>.
          </p>
        </div>
        <button className="btn btn-primary add-service-shortcut-btn" onClick={handleRegisterClick}>
          <PlusCircle size={16} />
          <span>Add Your Business</span>
        </button>
      </div>

      {localVerified.length > 0 ? (
        <div className="services-grid">
          {localVerified.map((b) => renderBusinessCard(b))}
        </div>
      ) : (
        <div className="services-empty-state glass">
          <div className="empty-state-content">
            <div className="empty-icon-pulse">
              <MapPin size={36} className="empty-pin-icon" />
            </div>
            <h3>No Service Providers in {currentCity} Yet</h3>
            <p>
              Be the first to list your printing kiosk, photocopy center, or customized gift shop in {currentCity}! Promote to local customers for free.
            </p>
            <button className="btn btn-accent btn-large" onClick={handleRegisterClick}>
              Register Your Shop Now
            </button>
          </div>

          {otherVerified.length > 0 && (
            <div className="featured-services-fallback-list">
              <h4 className="fallback-title">Featured Service Providers in Other Cities</h4>
              <div className="services-grid fallback-grid">
                {otherVerified.slice(0, 2).map((b) => renderBusinessCard(b))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
