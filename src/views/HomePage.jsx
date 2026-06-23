"use client";

import React, { useEffect, Suspense } from 'react';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import Categories from '../components/Categories';
import ServiceCategories from '../components/ServiceCategories';
import BrandingPartners from '../components/BrandingPartners';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import HMMobileNav from '../components/hm/HMMobileNav';

const HomePage = () => {
  useEffect(() => {
    // Reset global theme specifically for RG OneStop (ensure no HM leaks)
    document.body.classList.remove('hm-active');
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main>
        <HeroBanner />
        <div id="categories">
          <Categories />
        </div>
        <BrandingPartners />
        <Suspense fallback={null}>
          <ServiceCategories />
        </Suspense>
      </main>
      <Footer />
      <FloatingWhatsApp hideOnMobile={true} />
      <HMMobileNav />
    </div>
  );
};

export default HomePage;
