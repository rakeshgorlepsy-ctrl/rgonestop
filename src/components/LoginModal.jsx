"use client";

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginWithGoogle } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.className === 'login-backdrop') {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAuthenticating(false);
    setLoginModalOpen(false);
  };

  const handleRealGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await loginWithGoogle(); // No parameter triggers real Firebase Google Auth
      handleClose();
    } catch (err) {
      console.error(err);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="login-backdrop" onClick={handleBackdropClick}>
      <div className="login-modal-container glass animate-fade-in">
        <button className="login-close-btn" onClick={handleClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {isAuthenticating ? (
          <div className="google-chooser-box">
            <div className="google-auth-loading">
              <Loader2 size={44} className="google-spinner" />
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Google" alt="Selected user avatar" className="google-loading-avatar" />
              <h3 className="auth-loading-title">Signing in with Google</h3>
              <p className="auth-loading-text">Connecting safely to Google accounts provider...</p>
            </div>
          </div>
        ) : (
          <div className="login-content">
            <div className="login-logo-wrapper">
              <img src="/assets/logo.png" alt="RG OneStop Logo" className="login-logo" />
            </div>
            
            <h2 className="login-title">Welcome to RG OneStop</h2>
            <p className="login-subtitle">
              Sign in to manage your business listings, explore printing services, order personalized gifts, and sync your settings across devices.
            </p>

            <button className="google-signin-btn" onClick={handleRealGoogleLogin}>
              <div className="google-icon-wrapper">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.307 2.662 1.353 6.545l3.913 3.22z"
                  />
                  <path
                    fill="#4285F4"
                    d="M16.04 15.345c-1.012.727-2.434 1.155-4.04 1.155a4.904 4.904 0 0 1-4.734-3.39l-3.913 3.22C5.307 21.338 9.354 24 12 24c3.218 0 6.095-1.064 8.127-2.909l-4.087-3.746z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M23.491 12c0-.818-.082-1.609-.232-2.373H12v4.582h6.436a5.57 5.57 0 0 1-2.409 3.636l4.087 3.746C22.5 19.345 23.491 16 23.491 12z"
                  />
                  <path
                    fill="#34A853"
                    d="M5.266 14.235A7.017 7.017 0 0 1 4.91 12c0-.791.136-1.555.355-2.264l-3.913-3.22A11.954 11.954 0 0 0 0 12c0 2.01.491 3.918 1.353 5.61l3.913-3.375z"
                  />
                </svg>
              </div>
              <span className="google-btn-text">Sign in with Google</span>
            </button>

            <div className="login-footer">
              By signing in, you agree to RG OneStop's <a href="#terms">Terms of Service</a> & <a href="#privacy">Privacy Policy</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
