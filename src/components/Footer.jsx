"use client";

import React from 'react';
import { Instagram, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import './Footer.css';

const instagramMocks = [
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555529733-0e67056058e1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200&h=200&fit=crop'
];

const Footer = ({ brandTheme = 'light', instagramLink = 'https://www.instagram.com/tagme_24/', whatsappNumber = '+91 6301919669' }) => {
  return (
    <footer className={`footer ${brandTheme === 'dark' ? 'footer-dark' : ''}`}>
      <div className="container footer-container">
        
        <div className="footer-brand">
          <img src="/assets/logo.png" alt="RG OneStop" className="footer-logo-image" />
          <p>Your ultimate destination for premium, personalized products and printing services. We bring your special moments to life.</p>
          <div className="social-links">
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="social-box instagram" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="social-box whatsapp" aria-label="WhatsApp">
              <Phone size={20} />
            </a>
          </div>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <ul>
            <li className="highlight-contact">
              <MessageCircle size={20} />
              <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="whatsapp-number">
                {whatsappNumber} <span className="chat-badge">Chat with us</span>
              </a>
            </li>
            <li>
              <Mail size={16} />
              <span>support@rgonestop.com</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Delivering across India</span>
            </li>
          </ul>
        </div>

        <div className="footer-instagram">
          <h3>Instagram Preview</h3>
          <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="instagram-grid">
            {instagramMocks.map((img, idx) => (
              <div key={idx} className="insta-mock-img">
                <img src={img} alt={`Instagram mock ${idx}`} />
                <div className="insta-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
              </div>
            ))}
          </a>
          <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="follow-us-link">
            Follow our Instagram
          </a>
        </div>
        
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RG OneStop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
