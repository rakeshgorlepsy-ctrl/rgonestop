"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import './FloatingWhatsApp.css';

const FloatingWhatsApp = ({ number = "916301919669", label = "Chat with us", message = "Hi! I have an inquiry.", hideOnMobile = false }) => {
  const whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  
  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`floating-whatsapp ${hideOnMobile ? 'hide-mobile' : ''}`}
      aria-label={label}
    >
      <div className="whatsapp-icon-wrapper pulse-ring">
        <MessageCircle size={28} />
      </div>
      <span className="whatsapp-label">{label}</span>
    </a>
  );
};

export default FloatingWhatsApp;
