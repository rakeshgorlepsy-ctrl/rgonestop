"use client";

import React, { useEffect } from 'react';
import '../styles/hm-theme.css'; // Isolated scoped styling

// Component Imports
import HMHeader from '../components/hm/HMHeader';
import HMCircleNav from '../components/hm/HMCircleNav';
import HMHeroGrid from '../components/hm/HMHeroGrid';
import HMTrending from '../components/hm/HMTrending';
import HMPromoStrip from '../components/hm/HMPromoStrip';
import HMVideoReels from '../components/hm/HMVideoReels';
import HMReviews from '../components/hm/HMReviews';
import HMMobileNav from '../components/hm/HMMobileNav';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const HashtagMemoriesPage = () => {
  useEffect(() => {
    document.title = "Hashtag Memories - Premium Personalized Gifts & Photo Creations";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hm-page">
      <HMHeader />
      <HMCircleNav />
      {/* CircleNav serves as the target for the mobile categories link */}
      <div id="categories"></div>
      
      <main>
        {/* Main Hero Section with Grids */}
        <HMHeroGrid />

        {/* Section 1: Best Sellers */}
        <HMTrending title="Best Sellers" subtitle="Our most loved creations this month" />

        {/* Promotional Strip 1 */}
        <HMPromoStrip 
          title="Street Memories" 
          subtitle="On all Acrylic Frame Collections" 
          cta="Grab Now"
          image="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop"
        />

        {/* Section 2: New Arrivals */}
        <HMTrending title="New Arrivals" subtitle="Freshly crafted designs for your memories" />

        {/* Video Reels Section */}
        <HMVideoReels />

        {/* Promotional Strip 2 */}
        <HMPromoStrip 
          title="Sweet Anniversary Deals" 
          subtitle="Personalized Photo Chocolates with customized boxes" 
          cta="View Collection"
          image="https://images.unsplash.com/photo-1548907040-4bb42b021a9b?q=80&w=1200&auto=format&fit=crop"
        />

        {/* Section 3: Trending Now */}
        <div style={{ backgroundColor: 'var(--hm-bg-light)' }}>
          <HMTrending title="Trending Gifts" subtitle="What everyone is talking about" />
        </div>

        {/* Reviews Section */}
        <HMReviews />
      </main>

      {/* Reusing Global Layout Footers but passing custom Brand Identity data */}
      <Footer 
        instagramLink="https://www.instagram.com/tagme_24/" 
        whatsappNumber="+91 6301919669" 
        brandTheme="light" 
      />
      
      <FloatingWhatsApp 
        number="+916301919669" 
        label="Chat with us"
        message="Hi Hashtag Memories! I would like to customize a gift."
        hideOnMobile={true}
      />

      <HMMobileNav />
    </div>
  );
};

export default HashtagMemoriesPage;
