"use client";

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';

// Core standard pages
import HomePage from './pages/HomePage';

// Lazy loaded sub-brand experiences to preserve performance speeds 
const HashtagMemoriesPage = lazy(() => import('./pages/HashtagMemoriesPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  // Show splash only once per session (not on every page nav, only on first visit)
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('rg_splash_seen');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('rg_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {/* Splash Screen - renders as overlay above all content */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main app always present in DOM for instant reveal (no flicker) */}
      <Router>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontWeight: 'bold' }}>Loading Experience...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hashtag-memories" element={<HashtagMemoriesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
