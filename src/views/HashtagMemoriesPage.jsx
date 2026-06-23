"use client";

import React, { useEffect, useState } from 'react';
import '../styles/hm-theme.css'; // Isolated scoped styling
import { useAuth } from '../context/AuthContext';

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
  const { addHashtagOrder, user, paymentConfig } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phoneNumber: '',
    deliveryMode: 'pickup', // 'pickup' or 'delivery'
    city: 'Hyderabad',
    deliveryAddress: ''
  });

  const [errors, setErrors] = useState({});

  // Payment states
  const [checkoutStep, setCheckoutStep] = useState('details'); // 'details' or 'payment'
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentProofBase64, setPaymentProofBase64] = useState('');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [copiedField, setCopiedField] = useState(null); // 'upi' | 'amount' | 'orderid'

  useEffect(() => {
    document.title = "Hashtag Memories - Premium Personalized Gifts & Photo Creations";
    window.scrollTo(0, 0);
  }, []);

  const handleOpenCheckout = (product) => {
    setSelectedProduct(product);
    setOrderForm({
      customerName: user?.name || '',
      phoneNumber: '',
      deliveryMode: 'pickup',
      city: 'Hyderabad',
      deliveryAddress: ''
    });
    setErrors({});
    setIsSuccess(false);
    setCheckoutStep('details');
    setUtrNumber('');
    setPaymentProofBase64('');
    setPaymentProofName('');
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!orderForm.customerName.trim()) newErrors.customerName = "Name is required";
    if (!orderForm.phoneNumber.trim() || orderForm.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    if (orderForm.deliveryMode === 'delivery' && !orderForm.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Go to payment step and generate order ID
    const newOrderId = 'RGH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setCurrentOrderId(newOrderId);
    setUtrNumber('');
    setPaymentProofBase64('');
    setPaymentProofName('');
    setCheckoutStep('payment');
  };

  const handlePaymentScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      alert("Image must be under 1MB. Please compress the image and try again.");
      e.target.value = '';
      return;
    }
    setPaymentProofName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.length < 6) {
      alert("Please enter a valid Transaction UTR / Ref Number!");
      return;
    }
    if (!paymentProofBase64) {
      alert("Payment proof screenshot is required! Please upload a screenshot of your payment confirmation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const rawPrice = selectedProduct.price ? String(selectedProduct.price).replace(/[^0-9.]/g, '') : '0';
      const parsedPrice = Math.ceil(parseFloat(rawPrice) || 0);

      await addHashtagOrder({
        localOrderId: currentOrderId,
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        price: parsedPrice,
        customerName: orderForm.customerName,
        customerEmail: user?.email || 'guest@rgonestop.com',
        phoneNumber: orderForm.phoneNumber,
        deliveryMode: orderForm.deliveryMode === 'pickup' ? 'Store Pickup' : 'Home Delivery',
        city: orderForm.city,
        deliveryAddress: orderForm.deliveryMode === 'delivery' ? orderForm.deliveryAddress : '',
        paymentStatus: 'Pending Verification',
        transactionId: utrNumber,
        paymentProof: paymentProofBase64
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsSuccess(false);
        setSelectedProduct(null);
      }, 2000);
    } catch (err) {
      alert("Failed to place order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <HMTrending 
          title="Best Sellers" 
          subtitle="Our most loved creations this month" 
          onOrder={handleOpenCheckout}
        />

        {/* Promotional Strip 1 */}
        <HMPromoStrip 
          title="Street Memories" 
          subtitle="On all Acrylic Frame Collections" 
          cta="Grab Now"
          image="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop"
        />

        {/* Section 2: New Arrivals */}
        <HMTrending 
          title="New Arrivals" 
          subtitle="Freshly crafted designs for your memories" 
          onOrder={handleOpenCheckout}
        />

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
          <HMTrending 
            title="Trending Gifts" 
            subtitle="What everyone is talking about" 
            onOrder={handleOpenCheckout}
          />
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

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '1rem', color: '#1e293b'
        }} onClick={(e) => e.target === e.currentTarget && setIsCheckoutOpen(false)}>
          
          <div className="checkout-modal-card animate-scale-in" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '24px',
            padding: '1.25rem',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                color: '#64748b'
              }}
            >✕</button>

            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: '#2faf9e',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 1.25rem'
                }}>✓</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem' }}>Order Placed!</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                  Your order for <strong>{selectedProduct?.title}</strong> has been registered. Our representative will contact you shortly.
                </p>
              </div>
            ) : checkoutStep === 'details' ? (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛍️ Order Customization
                </h3>

                <div style={{
                  display: 'flex', gap: '1rem', background: 'rgba(47, 175, 158, 0.05)',
                  padding: '1rem', borderRadius: '16px', border: '1px solid rgba(47, 175, 158, 0.15)',
                  marginBottom: '1.5rem', alignItems: 'center'
                }}>
                  <img src={selectedProduct?.image} alt={selectedProduct?.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>{selectedProduct?.title}</h4>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2faf9e', display: 'block', marginTop: '0.2rem' }}>{selectedProduct?.price}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Your Name *</label>
                    <input 
                      type="text" 
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                      placeholder="Enter full name"
                      style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                      required
                    />
                    {errors.customerName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.customerName}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      value={orderForm.phoneNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="10-digit mobile number"
                      style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                      required
                    />
                    {errors.phoneNumber && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phoneNumber}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Delivery Option</label>
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setOrderForm({ ...orderForm, deliveryMode: 'pickup' })}
                        style={{
                          flex: 1, padding: '0.45rem', border: 'none', borderRadius: '8px',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          background: orderForm.deliveryMode === 'pickup' ? '#2faf9e' : 'transparent',
                          color: orderForm.deliveryMode === 'pickup' ? 'white' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >Store Pickup (Free)</button>
                      <button 
                        type="button"
                        onClick={() => setOrderForm({ ...orderForm, deliveryMode: 'delivery' })}
                        style={{
                          flex: 1, padding: '0.45rem', border: 'none', borderRadius: '8px',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          background: orderForm.deliveryMode === 'delivery' ? '#2faf9e' : 'transparent',
                          color: orderForm.deliveryMode === 'delivery' ? 'white' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >Home Delivery</button>
                    </div>
                  </div>

                  {orderForm.deliveryMode === 'delivery' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>City</label>
                        <select
                          value={orderForm.city}
                          onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                          style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', width: '100%' }}
                        >
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Guntur">Guntur</option>
                          <option value="Vijayawada">Vijayawada</option>
                          <option value="Visakhapatnam">Visakhapatnam</option>
                          <option value="Nellore">Nellore</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Delivery Address *</label>
                        <textarea 
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                          placeholder="Complete home or college campus address"
                          rows="3"
                          style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                          required
                        />
                        {errors.deliveryAddress && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.deliveryAddress}</span>}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    style={{
                      background: '#2faf9e', color: 'white', border: 'none',
                      borderRadius: '12px', padding: '0.8rem', fontWeight: 700,
                      fontSize: '0.95rem', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px',
                      marginTop: '0.5rem', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(47, 175, 158, 0.25)'
                    }}
                  >
                    Proceed to Pay
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💳 Scan to Pay
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', textAlign: 'center' }}>

                  {/* Dynamic QR Code */}
                  <div style={{ 
                    background: 'white', padding: '8px', borderRadius: '14px', 
                    border: '2px solid rgba(47, 175, 158, 0.2)', boxShadow: '0 4px 16px rgba(47,175,158,0.1)',
                    width: '140px', height: '140px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                  }}>
                    {paymentConfig && paymentConfig.upiId ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName || 'Payee')}&am=${Math.ceil(parseFloat(String(selectedProduct?.price).replace(/[^0-9.]/g, '')) || 0)}&tn=${encodeURIComponent('Order:' + currentOrderId)}&tr=${currentOrderId}`)}`}
                        alt="Dynamic UPI QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display='none'; }}
                      />
                    ) : paymentConfig && paymentConfig.qrCode ? (
                      <img 
                        src={paymentConfig.qrCode} 
                        alt="Payment QR Code" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '0.5rem', lineHeight: '1.4' }}>
                        📷<br/>QR not configured.<br/>Copy UPI ID below.
                      </div>
                    )}
                  </div>

                  {/* Amount & Details with Copy */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
                    {/* Amount row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>
                        ₹{Math.ceil(parseFloat(String(selectedProduct?.price).replace(/[^0-9.]/g, '')) || 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(String(Math.ceil(parseFloat(String(selectedProduct?.price).replace(/[^0-9.]/g, '')) || 0)), 'amount')}
                        style={{ fontSize: '0.65rem', background: copiedField === 'amount' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'amount' ? '#15803d' : '#475569', border: 'none', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        {copiedField === 'amount' ? 'Copied ✓' : 'Copy Amount'}
                      </button>
                    </div>

                    {/* UPI ID row */}
                    {paymentConfig?.upiId && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{paymentConfig.upiId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentConfig.upiId, 'upi')}
                          style={{ fontSize: '0.63rem', background: copiedField === 'upi' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'upi' ? '#15803d' : '#475569', border: 'none', borderRadius: '5px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          {copiedField === 'upi' ? 'Copied ✓' : 'Copy UPI'}
                        </button>
                      </div>
                    )}

                    {/* Order ID row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Order ID: <strong>{currentOrderId}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrderId, 'orderid')}
                        style={{ fontSize: '0.63rem', background: copiedField === 'orderid' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'orderid' ? '#15803d' : '#475569', border: 'none', borderRadius: '5px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        {copiedField === 'orderid' ? 'Copied ✓' : 'Copy ID'}
                      </button>
                    </div>
                  </div>

                  {/* Mobile UPI Deep Link Button */}
                  {paymentConfig?.upiId && (
                    <a
                      href={`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName || 'Payee')}&am=${Math.ceil(parseFloat(String(selectedProduct?.price).replace(/[^0-9.]/g, '')) || 0)}&tn=${encodeURIComponent('Order:' + currentOrderId)}&tr=${currentOrderId}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        width: '100%', padding: '0.55rem', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1da462 0%, #0ea05a 100%)',
                        color: 'white', fontWeight: 700, fontSize: '0.8rem',
                        textDecoration: 'none', boxShadow: '0 3px 10px rgba(13,152,86,0.25)'
                      }}
                    >
                      📱 Pay via UPI App (GPay / PhonePe / Paytm)
                    </a>
                  )}

                  {/* How to Pay */}
                  <div style={{ 
                    background: 'rgba(47, 175, 158, 0.05)', border: '1px solid rgba(47, 175, 158, 0.15)',
                    borderRadius: '10px', padding: '8px 10px', fontSize: '0.71rem', color: '#0f766e',
                    lineHeight: '1.4', textAlign: 'left', width: '100%'
                  }}>
                    <strong>How to Pay:</strong>
                    <ol style={{ margin: '3px 0 0 14px', padding: 0 }}>
                      <li>Scan QR code <strong>OR</strong> tap the green button (mobile).</li>
                      <li>Pay exactly ₹{Math.ceil(parseFloat(String(selectedProduct?.price).replace(/[^0-9.]/g, '')) || 0)} — amount is pre-filled.</li>
                      <li>Add <strong>{currentOrderId}</strong> in the payment note (optional).</li>
                      <li>Take a <strong>screenshot</strong> of payment success screen.</li>
                      <li>Enter UTR and upload screenshot below.</li>
                    </ol>
                  </div>

                  {/* Fraud Warning */}
                  <div style={{ 
                    background: '#fff1f2', border: '1.5px solid #fca5a5',
                    borderRadius: '10px', padding: '8px 12px', fontSize: '0.71rem', color: '#991b1b',
                    lineHeight: '1.45', textAlign: 'left', width: '100%'
                  }}>
                    ⚠️ <strong>WARNING:</strong> Submitting fake UTRs or forged screenshots will result in <strong>immediate cancellation</strong> and <strong>permanent account block</strong>.
                  </div>

                  <form 
                    onSubmit={handlePaymentSubmit} 
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                        Transaction UTR / Ref No *
                      </label>
                      <input 
                        type="text" 
                        placeholder="Enter 6–12 digit UTR / Ref No"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', width: '100%' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>
                        📸 Upload Payment Screenshot * (REQUIRED)
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => document.getElementById('hm-payment-proof-input').click()}
                          style={{
                            padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px',
                            background: paymentProofBase64 ? '#dcfce7' : '#fff1f2',
                            border: `1px solid ${paymentProofBase64 ? '#86efac' : '#fca5a5'}`,
                            color: paymentProofBase64 ? '#15803d' : '#991b1b',
                            cursor: 'pointer', fontWeight: 700
                          }}
                        >
                          {paymentProofBase64 ? '✓ Screenshot Uploaded' : 'Choose Screenshot'}
                        </button>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                          {paymentProofName || 'No file chosen'}
                        </span>
                        <input 
                          type="file" 
                          id="hm-payment-proof-input"
                          accept="image/*"
                          onChange={handlePaymentScreenshotUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {paymentProofBase64 && (
                        <div style={{ marginTop: '0.3rem', border: '2px solid #86efac', borderRadius: '8px', padding: '3px', maxWidth: '70px' }}>
                          <img src={paymentProofBase64} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep('details')}
                        style={{
                          flex: 1, background: '#f1f5f9', color: '#475569', border: 'none',
                          borderRadius: '12px', padding: '0.6rem', fontWeight: 700,
                          fontSize: '0.85rem', cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                          flex: 2, 
                          background: paymentProofBase64 ? '#2faf9e' : '#94a3b8', 
                          color: 'white', border: 'none',
                          borderRadius: '12px', padding: '0.6rem', fontWeight: 700,
                          fontSize: '0.85rem', cursor: paymentProofBase64 ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        {isSubmitting ? 'Placing Order...' : 'Confirm Payment & Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagMemoriesPage;
