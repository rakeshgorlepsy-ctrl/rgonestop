"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Check, X, Trash2, Plus, 
  Home, Upload, Loader2, Image as ImageIcon, Edit3, Lock, ShieldAlert,
  Users, Tag, Globe, Building2, LayoutGrid, Layers, FileText, ShoppingBag, CreditCard,
  Store
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './AdminDashboard.css';

const localDb = {
  dbName: 'RGOneStopLocalFiles',
  storeName: 'files',
  
  getDb() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async saveFile(key, fileData) {
    try {
      const db = await this.getDb();
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(fileData, key);
        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.error("IndexedDB save failed:", err);
      return false;
    }
  },

  async getFile(key) {
    try {
      const db = await this.getDb();
      if (!db) return null;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.error("IndexedDB get failed:", err);
      return null;
    }
  }
};

const AdminDashboard = () => {
  const router = useRouter();
  const { 
    user, 
    banners, addBanner, updateBanner, deleteBanner,
    brandingPartners, addBrandingPartner, updateBrandingPartner, deleteBrandingPartner,
    serviceCategories, addServiceCategory, updateServiceCategory, deleteServiceCategory,
    printOrders, updatePrintOrderStatus, updatePrintOrder, deletePrintOrder,
    hashtagOrders, updateHashtagOrderStatus, updateHashtagOrder, deleteHashtagOrder,
    businesses, updateBusiness, deleteBusiness,
    loginWithGoogle, logout, paymentConfig, updatePaymentConfig, addNotification
  } = useAuth();

  const isClientCategory = (categoryName) => {
    if (!categoryName) return false;
    const name = categoryName.toLowerCase();
    return (
      name.includes("master xerox") ||
      name.includes("hashtag memories") ||
      name.includes("flex & banner") ||
      name.includes("binding & stationer") ||
      name.includes("creative graphic")
    );
  };

  // Filter out client-owned core service directory listings
  const filteredBusinesses = (businesses || []).filter(b => !isClientCategory(b.category));

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Sidebar active section
  const [activeSection, setActiveSection] = useState('overview');

  // Admin authentication states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ── Banner states ────────────────────────────────────────────────
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [isBannerSubmitting, setIsBannerSubmitting] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', cta: 'Shop Now', linkType: 'memories', customLink: '', selectedPartnerId: '', selectedCatId: '' });
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerErrors, setBannerErrors] = useState({});
  const [confirmDeleteBannerId, setConfirmDeleteBannerId] = useState(null);
  const bannerFileRef = useRef(null);

  // ── Branding Partners states ─────────────────────────────────────
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const [isPartnerSubmitting, setIsPartnerSubmitting] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', websiteUrl: '' });
  const [partnerLogo, setPartnerLogo] = useState(null);
  const [partnerErrors, setPartnerErrors] = useState({});
  const [confirmDeletePartnerId, setConfirmDeletePartnerId] = useState(null);
  const partnerFileRef = useRef(null);

  // ── Service Category states ──────────────────────────────────────
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  const [catForm, setCatForm] = useState({ title: '' });
  const [catLogo, setCatLogo] = useState(null);
  const [catErrors, setCatErrors] = useState({});
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState(null);
  const catFileRef = useRef(null);

  // ── Xerox Order states ───────────────────────────────────────────
  const [confirmDeletePrintOrderId, setConfirmDeletePrintOrderId] = useState(null);

  // ── Hashtag Order states ─────────────────────────────────────────
  const [confirmDeleteHashtagOrderId, setConfirmDeleteHashtagOrderId] = useState(null);

  // ── Payment states ───────────────────────────────────────────────
  const [payeeName, setPayeeName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrImage, setQrImage] = useState('');
  const qrFileRef = useRef(null);
  const [selectedPaymentProofUrl, setSelectedPaymentProofUrl] = useState(null);

  useEffect(() => {
    if (paymentConfig) {
      setPayeeName(paymentConfig.payeeName || '');
      setUpiId(paymentConfig.upiId || '');
      setQrImage(paymentConfig.qrCode || '');
    }
  }, [paymentConfig]);

  // Admin check: strictly reads 'role' field
  const isAdmin = user && user.role === 'admin';
  console.log('🔐 Admin check →', { email: user?.email, role: user?.role, isAdmin });

  // ── Auth handlers ────────────────────────────────────────────────
  const handleAdminRealGoogleLogin = async () => {
    setSelectedUser({ name: "Google Account", email: "Authenticating...", avatar: null });
    setIsAuthenticating(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Real Google Login failed:", err);
    } finally {
      setIsAuthenticating(false);
      setSelectedUser(null);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    setIsAuthenticating(false);
    setSelectedUser(null);
  };

  if (!isMounted) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a', color:'#f8fafc', fontWeight:'bold' }}>
        <Loader2 className="animate-spin" size={32} style={{ marginRight:'8px' }} />
        <span>Loading Admin Console...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-login-backdrop">
        <div className="admin-login-stars-bg"></div>
        <div className="admin-login-card glass animate-fade-in">
          {isAuthenticating ? (
            <div className="admin-google-auth-loading">
              <div className="admin-spinner-wrapper">
                <Loader2 size={56} className="admin-google-spinner" />
                {selectedUser?.avatar && <img src={selectedUser.avatar} alt="User Avatar" className="admin-loading-avatar" />}
              </div>
              <h3 className="admin-auth-loading-title">Connecting to Google</h3>
              <p className="admin-auth-loading-text">Authorizing secure administrative session for <br /><strong>{selectedUser?.email}</strong>...</p>
            </div>
          ) : (
            <div className="admin-login-content">
              <div className="admin-login-shield-wrapper animate-pulse">
                <Lock size={44} className="admin-login-shield-icon" />
              </div>
              <h2 className="admin-login-title">RG Admin Console</h2>
              <p className="admin-login-desc">Authorized access only. Authenticate with your Google account to manage website content.</p>
              <button className="admin-google-signin-btn" onClick={handleAdminRealGoogleLogin}>
                <div className="admin-google-icon-wrapper">
                  <svg className="admin-google-icon" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.307 2.662 1.353 6.545l3.913 3.22z"/>
                    <path fill="#4285F4" d="M16.04 15.345c-1.012.727-2.434 1.155-4.04 1.155a4.904 4.904 0 0 1-4.734-3.39l-3.913 3.22C5.307 21.338 9.354 24 12 24c3.218 0 6.095-1.064 8.127-2.909l-4.087-3.746z"/>
                    <path fill="#FBBC05" d="M23.491 12c0-.818-.082-1.609-.232-2.373H12v4.582h6.436a5.57 5.57 0 0 1-2.409 3.636l4.087 3.746C22.5 19.345 23.491 16 23.491 12z"/>
                    <path fill="#34A853" d="M5.266 14.235A7.017 7.017 0 0 1 4.91 12c0-.791.136-1.555.355-2.264l-3.913-3.22A11.954 11.954 0 0 0 0 12c0 2.01.491 3.918 1.353 5.61l3.913-3.375z"/>
                  </svg>
                </div>
                <span className="admin-google-btn-text">Sign in with Google</span>
              </button>
              <button className="admin-back-home-btn" onClick={() => router.push('/')}>
                <Home size={16} /><span>Return to Live Site</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="admin-login-backdrop">
        <div className="admin-login-stars-bg"></div>
        <div className="admin-login-card glass animate-fade-in unauthorized">
          <div className="admin-login-shield-wrapper unauthorized animate-shake">
            <ShieldAlert size={44} className="admin-login-shield-icon unauthorized" />
          </div>
          <h2 className="admin-login-title text-danger">Access Denied</h2>
          <p className="admin-login-desc">Your account is not registered as an administrator.</p>
          <div className="admin-unauthorized-actions">
            <button className="btn btn-outline admin-switch-account-btn" onClick={handleSwitchAccount}>Switch Account</button>
            <button className="btn btn-primary admin-gohome-btn" onClick={() => router.push('/')}><Home size={18} /><span>Back to Home</span></button>
          </div>
        </div>
      </div>
    );
  }

  // ── Image upload helper (Client-side resizing & compression) ─────
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    // Accept files up to 10MB since we compress them client-side
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 10MB.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Limit maximum dimension to 1000px
        const MAX_DIM = 1000;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl;
        if (file.type === 'image/png') {
          // PNG format (preserves transparency, keeps base64 small by resizing)
          dataUrl = canvas.toDataURL('image/png');
        } else {
          // JPEG format with quality compression
          dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        }
        callback(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };


  // ══════════════════════════════════════════════════════════════════
  // BANNER HANDLERS
  // ══════════════════════════════════════════════════════════════════
  const handleBannerAddClick = () => {
    setEditingBannerId(null);
    setBannerForm({ title:'', subtitle:'', cta:'Shop Now', linkType:'memories', customLink:'', selectedPartnerId: '', selectedCatId: '' });
    setBannerImage(null);
    setBannerErrors({});
    setShowBannerModal(true);
  };

  const handleBannerEditClick = (ban) => {
    setEditingBannerId(ban.id);
    let inferredLinkType = ban.linkType || 'custom';
    let customLinkVal = ban.customLink || '';
    if (!ban.linkType) {
      if (ban.link === '/master-xerox') inferredLinkType = 'xerox';
      else if (ban.link === '/hashtag-memories') inferredLinkType = 'memories';
      else if (ban.link && ban.link.startsWith('/?catId=')) {
        inferredLinkType = 'onestop';
      }
      else if (ban.link === '/#service-categories') inferredLinkType = 'onestop';
      else if (ban.link && (ban.link.startsWith('http://') || ban.link.startsWith('https://'))) {
        inferredLinkType = 'branding';
      }
      else { inferredLinkType = 'custom'; customLinkVal = ban.link || ''; }
    }
    setBannerForm({ 
      title: ban.title||'', 
      subtitle: ban.subtitle||'', 
      cta: ban.cta||'Shop Now', 
      linkType: inferredLinkType, 
      customLink: customLinkVal,
      selectedPartnerId: ban.selectedPartnerId || '',
      selectedCatId: ban.selectedCatId || ''
    });
    setBannerImage(ban.background);
    setBannerErrors({});
    setShowBannerModal(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!bannerForm.title.trim()) errs.title = "Banner title is required";
    if (!bannerForm.subtitle.trim()) errs.subtitle = "Subtitle is required";
    if (!bannerImage) errs.image = "A background image is required";
    if (bannerForm.linkType === 'custom' && !bannerForm.customLink.trim()) errs.customLink = "Custom link is required";
    if (bannerForm.linkType === 'branding' && !bannerForm.selectedPartnerId) errs.selectedPartnerId = "Please select a branding partner";
    if (Object.keys(errs).length > 0) { setBannerErrors(errs); return; }
    setIsBannerSubmitting(true);
    let finalLink = '/';
    if (bannerForm.linkType === 'xerox') finalLink = '/master-xerox';
    else if (bannerForm.linkType === 'memories') finalLink = '/hashtag-memories';
    else if (bannerForm.linkType === 'onestop') {
      if (bannerForm.selectedCatId) {
        finalLink = `/?catId=${bannerForm.selectedCatId}`;
      } else {
        finalLink = '/#service-categories';
      }
    }
    else if (bannerForm.linkType === 'branding') {
      const selectedPartner = brandingPartners.find(p => p.id === bannerForm.selectedPartnerId);
      finalLink = selectedPartner ? selectedPartner.websiteUrl : '/';
    }
    else if (bannerForm.linkType === 'custom') finalLink = bannerForm.customLink;
    try {
      const bannerData = { 
        title: bannerForm.title, 
        subtitle: bannerForm.subtitle, 
        cta: bannerForm.cta, 
        background: bannerImage, 
        link: finalLink, 
        linkType: bannerForm.linkType, 
        customLink: bannerForm.customLink,
        selectedPartnerId: bannerForm.selectedPartnerId || '',
        selectedCatId: bannerForm.selectedCatId || ''
      };
      if (editingBannerId) await updateBanner(editingBannerId, bannerData);
      else await addBanner(bannerData);
      setShowBannerModal(false);
    } catch (error) {
      alert("Error saving banner: " + error.message);
    } finally {
      setIsBannerSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    try { 
      await deleteBanner(id); 
    } catch (error) { 
      alert("Error deleting banner: " + error.message); 
    } finally { 
      setConfirmDeleteBannerId(null); 
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // BRANDING PARTNER HANDLERS
  // ══════════════════════════════════════════════════════════════════
  const handlePartnerAddClick = () => {
    setEditingPartnerId(null);
    setPartnerForm({ name:'', websiteUrl:'' });
    setPartnerLogo(null);
    setPartnerErrors({});
    setShowPartnerModal(true);
  };

  const handlePartnerEditClick = (p) => {
    setEditingPartnerId(p.id);
    setPartnerForm({ name: p.name||'', websiteUrl: p.websiteUrl||'' });
    setPartnerLogo(p.image||null);
    setPartnerErrors({});
    setShowPartnerModal(true);
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!partnerForm.name.trim()) errs.name = "Partner name is required";
    if (!partnerForm.websiteUrl.trim()) errs.websiteUrl = "Website URL is required";
    if (!partnerLogo) errs.logo = "Logo image is required";
    if (Object.keys(errs).length > 0) { setPartnerErrors(errs); return; }
    setIsPartnerSubmitting(true);
    try {
      const data = { name: partnerForm.name, websiteUrl: partnerForm.websiteUrl, image: partnerLogo };
      if (editingPartnerId) await updateBrandingPartner(editingPartnerId, data);
      else await addBrandingPartner(data);
      setShowPartnerModal(false);
    } catch (error) {
      alert("Error saving partner: " + error.message);
    } finally {
      setIsPartnerSubmitting(false);
    }
  };

  const handleDeletePartner = async (id) => {
    try { 
      await deleteBrandingPartner(id); 
    } catch (error) { 
      alert("Error deleting partner: " + error.message); 
    } finally { 
      setConfirmDeletePartnerId(null); 
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // SERVICE CATEGORY HANDLERS
  // ══════════════════════════════════════════════════════════════════
  const handleCatAddClick = () => {
    setEditingCatId(null);
    setCatForm({ title:'' });
    setCatLogo(null);
    setCatErrors({});
    setShowCatModal(true);
  };

  const handleCatEditClick = (cat) => {
    setEditingCatId(cat.id);
    setCatForm({ title: cat.title||cat.name||'' });
    setCatLogo(cat.logo||cat.image||null);
    setCatErrors({});
    setShowCatModal(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!catForm.title.trim()) errs.title = "Category title is required";
    if (!catLogo) errs.logo = "Logo is required";
    if (Object.keys(errs).length > 0) { setCatErrors(errs); return; }
    setIsCatSubmitting(true);
    try {
      const data = { title: catForm.title, logo: catLogo };
      if (editingCatId) await updateServiceCategory(editingCatId, data);
      else await addServiceCategory(data);
      setShowCatModal(false);
    } catch (error) {
      alert("Error saving category: " + error.message);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const handleDeleteCat = async (id) => {
    try { 
      await deleteServiceCategory(id); 
    } catch (error) { 
      alert("Error deleting category: " + error.message); 
    } finally { 
      setConfirmDeleteCatId(null); 
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // XEROX PRINT ORDER HANDLERS
  // ══════════════════════════════════════════════════════════════════
  const handleTogglePrintOrderStatus = async (order) => {
    try {
      const nextStatus = order.status === 'Completed' ? 'Pending' : 'Completed';
      await updatePrintOrderStatus(order.id, nextStatus);
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  const handleDeletePrintOrder = async (id) => {
    try {
      await deletePrintOrder(id);
    } catch (error) {
      alert("Error deleting order: " + error.message);
    } finally {
      setConfirmDeletePrintOrderId(null);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // HASHTAG ORDER HANDLERS
  // ══════════════════════════════════════════════════════════════════
  const handleToggleHashtagOrderStatus = async (order) => {
    try {
      const nextStatus = order.status === 'Completed' ? 'Pending' : 'Completed';
      await updateHashtagOrderStatus(order.id, nextStatus);
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  const handleDeleteHashtagOrder = async (id) => {
    try {
      await deleteHashtagOrder(id);
    } catch (error) {
      alert("Error deleting order: " + error.message);
    } finally {
      setConfirmDeleteHashtagOrderId(null);
    }
  };

  // ── Payment Settings Handlers ────────────────────────────────────
  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    try {
      await updatePaymentConfig({
        payeeName,
        upiId,
        qrCode: qrImage
      });
      alert("Payment QR & UPI settings updated successfully!");
    } catch (error) {
      console.error("Error saving payment config:", error);
      alert("Failed to save payment config: " + error.message);
    }
  };

  // ── Business Listings Handlers ────────────────────────────────────
  const handleApproveBusiness = async (biz) => {
    try {
      await updateBusiness(biz.id, { verified: true });
      alert(`Business "${biz.businessName}" approved successfully!`);
    } catch (err) {
      alert("Failed to approve business: " + err.message);
    }
  };

  const handleRejectBusiness = async (biz) => {
    if (window.confirm(`Are you sure you want to reject this business listing: "${biz.businessName}"? This will delete the request.`)) {
      try {
        await deleteBusiness(biz.id);
        alert(`Business "${biz.businessName}" has been rejected and removed.`);
      } catch (err) {
        alert("Failed to reject business: " + err.message);
      }
    }
  };

  const handleRevokeBusiness = async (biz) => {
    if (window.confirm(`Are you sure you want to revoke approval for "${biz.businessName}"? It will be hidden from the homepage directory.`)) {
      try {
        await updateBusiness(biz.id, { verified: false });
        alert(`Approval revoked for "${biz.businessName}".`);
      } catch (err) {
        alert("Failed to revoke approval: " + err.message);
      }
    }
  };

  const handleDeleteBusiness = async (biz) => {
    if (window.confirm(`Are you sure you want to delete the business listing "${biz.businessName}"? This action cannot be undone.`)) {
      try {
        await deleteBusiness(biz.id);
        alert(`Business "${biz.businessName}" deleted successfully.`);
      } catch (err) {
        alert("Failed to delete business: " + err.message);
      }
    }
  };

  const handleApprovePrintPayment = async (order) => {
    if (!window.confirm(`Are you sure you want to approve the payment of ₹${order.totalPrice} for UTR ${order.transactionId}?`)) {
      return;
    }
    try {
      await updatePrintOrder(order.id, {
        paymentStatus: 'Paid',
        status: 'Processing'
      });
      await addNotification({
        userEmail: order.userEmail,
        title: "Xerox Payment Approved! 🎉",
        message: `Your payment of ₹${order.totalPrice} for print file "${order.fileName}" (UTR: ${order.transactionId}) has been verified. We have started processing your order.`,
        orderId: order.id,
        type: 'print'
      });
      alert("Payment approved and user notified successfully!");
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment: " + error.message);
    }
  };

  const handleApproveHashtagPayment = async (order) => {
    if (!window.confirm(`Are you sure you want to approve the payment of ₹${order.price} for UTR ${order.transactionId}?`)) {
      return;
    }
    try {
      await updateHashtagOrder(order.id, {
        paymentStatus: 'Paid',
        status: 'Processing'
      });
      await addNotification({
        userEmail: order.customerEmail,
        title: "Gift Order Payment Approved! 🎉",
        message: `Your payment of ₹${order.price} for "${order.productName}" (UTR: ${order.transactionId}) has been verified. We have started processing your order.`,
        orderId: order.id,
        type: 'hashtag'
      });
      alert("Payment approved and user notified successfully!");
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment: " + error.message);
    }
  };

  const base64ToBlobUrl = (base64Clean, type = 'application/pdf') => {
    const parts = base64Clean.split(',');
    const base64Data = parts[1] || parts[0];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: type });
    return URL.createObjectURL(blob);
  };

  const handleDownloadFile = async (order) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank');
      return;
    }
    
    // 1. Check local IndexedDB first
    if (order.localIndexedDB && order.localOrderId) {
      try {
        const fileBlob = await localDb.getFile(`print_file_${order.localOrderId}`);
        if (fileBlob) {
          const blobUrl = URL.createObjectURL(fileBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = order.fileName || 'document.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          return;
        }
      } catch (err) {
        console.error("IndexedDB download failed:", err);
      }
    }

    // 2. Fall back to Base64 in Firestore
    if (order.fileBase64) {
      try {
        const blobUrl = base64ToBlobUrl(order.fileBase64);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = order.fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } catch (err) {
        console.error("Base64 download failed:", err);
        alert("Failed to download file from local cache.");
      }
      return;
    }
    alert("No document file associated with this order.");
  };

  const handleDirectPrint = async (order) => {
    if (!order.fileUrl && !order.fileBase64 && !order.localIndexedDB) {
      alert("No document file associated with this order.");
      return;
    }
    const colorMode = order.colorMode || 'Black & White';
    const sides = order.sides || 'Both Sides';
    const copies = order.copies || 1;
    const binding = order.bindingType || 'No Binding';
    const pages = order.pages || 'All';

    const settingsSummary = `🖨️ USER PRINT SETTINGS SUMMARY:
----------------------------------------
• Pages to Print: ${pages}
• Copies Count: ${copies}
• Color Mode: ${colorMode}
• Sides (Duplex): ${sides}
• Binding: ${binding}

Click OK to open the system print dialog. Please ensure you configure these settings in your printer options window.`;

    if (!window.confirm(settingsSummary)) {
      return;
    }

    try {
      let printUrl = order.fileUrl || '';
      let revokeUrl = null;

      // 1. Check local IndexedDB first
      if (order.localIndexedDB && order.localOrderId) {
        try {
          const fileBlob = await localDb.getFile(`print_file_${order.localOrderId}`);
          if (fileBlob) {
            revokeUrl = URL.createObjectURL(fileBlob);
            printUrl = revokeUrl;
          }
        } catch (err) {
          console.error("Failed to load print file from IndexedDB:", err);
        }
      }

      // 2. Fall back to Base64
      if (!printUrl && order.fileBase64) {
        revokeUrl = base64ToBlobUrl(order.fileBase64);
        printUrl = revokeUrl;
      }

      if (!printUrl) {
        alert("Could not load print document URL.");
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = printUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printErr) {
          console.error("Print dialog open failed, opening in new tab instead:", printErr);
          window.open(printUrl, '_blank');
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            if (revokeUrl) URL.revokeObjectURL(revokeUrl);
          }, 2000);
        }
      };
    } catch (err) {
      console.error("Failed to execute printing:", err);
      alert("An error occurred during print initiation. Opening file in a new tab instead.");
      if (order.fileUrl) {
        window.open(order.fileUrl, '_blank');
      } else if (order.fileBase64) {
        const url = base64ToBlobUrl(order.fileBase64);
        window.open(url, '_blank');
      }
    }
  };

  // ── Sidebar Navigation Items ──
  const navItems = [
    { key: 'overview', icon: <Home size={18} />, label: 'Overview' },
    { key: 'service_categories', icon: <LayoutGrid size={18} />, label: 'Service Categories' },
    { key: 'banners', icon: <ImageIcon size={18} />, label: 'Website Banners' },
    { key: 'branding', icon: <Building2 size={18} />, label: 'Branding Partners' },
    { key: 'businesses', icon: <Store size={18} />, label: 'Business Directory' },
    { key: 'xerox_orders', icon: <FileText size={18} />, label: 'Xerox Orders' },
    { key: 'hashtag_orders', icon: <ShoppingBag size={18} />, label: 'Hashtag Orders' },
    { key: 'payment_settings', icon: <CreditCard size={18} />, label: 'Payment Config' },
  ];

  const sectionMeta = {
    overview: { title: 'Overview & Statistics', desc: 'Real-time indicators and totals for all platform resources.' },
    service_categories: { title: 'Service Categories', desc: 'Manage top-level service categories for the OneStop directory.' },
    banners: { title: 'Website Rotating Banners', desc: 'Manage homepage slider banners and their redirect links.' },
    branding: { title: 'Branding Partners', desc: 'Add logos that link to partner websites on the homepage.' },
    businesses: { title: 'Business Directory Listings', desc: 'Verify and manage local business listings registered by users.' },
    xerox_orders: { title: 'Master Xerox Print Orders', desc: 'Track and update document print orders submitted by users.' },
    hashtag_orders: { title: 'Hashtag Memories Gift Orders', desc: 'Track and manage personalized gift orders submitted by customers.' },
    payment_settings: { title: 'UPI Payment & QR Settings', desc: 'Configure the scanner QR Code, payee name, and UPI ID for client payments.' },
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon"><ShieldCheck size={24} /></div>
          <div className="admin-brand-details">
            <span className="admin-brand-title">RG ADMIN</span>
            <span className="admin-brand-subtitle">Console Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item${activeSection === item.key ? ' active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer" style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <Link href="/" className="sidebar-footer-btn return-home-btn" style={{ textDecoration:'none' }}>
            <Home size={16} /><span>Return to Live Site</span>
          </Link>
          <button className="sidebar-footer-btn logout-btn" onClick={logout}>
            <X size={16} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="admin-main-content">
        <header className="admin-main-header">
          <div className="header-breadcrumbs">
            <span className="bc-parent">Admin Dashboard</span>
            <span className="bc-separator">/</span>
            <span className="bc-current">{sectionMeta[activeSection]?.title}</span>
          </div>
          <div className="admin-header-profile">
            <img src={user.avatar} alt={user.name} className="admin-profile-avatar" />
            <div className="admin-profile-info">
              <span className="admin-profile-name">{user.name}</span>
              <span className="admin-profile-role">Super Administrator</span>
            </div>
          </div>
        </header>

        <div className="admin-inner-panel">
          <div className="mainpage-tab-content animate-fade-in">

            {/* ── OVERVIEW SECTION ── */}
            {activeSection === 'overview' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Admin Console Overview</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Platform resource summaries and fast indicators.</p>
                  </div>
                </div>

                <div className="stats-cards-grid" style={{ marginTop:'1.5rem' }}>
                  <div className="stat-card">
                    <div className="stat-card-left">
                      <FileText className="icon-purple" size={32} />
                      <span className="stat-label">Xerox Print Orders</span>
                      <span className="stat-value">{printOrders?.length || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-left">
                      <ShoppingBag className="icon-teal" size={32} />
                      <span className="stat-label">Hashtag Memories Orders</span>
                      <span className="stat-value">{hashtagOrders?.length || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-left">
                      <ImageIcon className="icon-blue" size={32} />
                      <span className="stat-label">Active Banners</span>
                      <span className="stat-value">{banners?.length || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-left">
                      <Building2 className="icon-green" size={32} />
                      <span className="stat-label">Branding Partners</span>
                      <span className="stat-value">{brandingPartners?.length || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-left">
                      <Store className="icon-blue" size={32} style={{ color: '#0284c7' }} />
                      <span className="stat-label">Registered Businesses</span>
                      <span className="stat-value">{filteredBusinesses.length}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e2e8f0', padding:'2rem', marginTop:'1.5rem', textAlign:'center' }}>
                  <ShieldCheck size={48} style={{ color:'#2faf9e', margin:'0 auto 1rem' }} />
                  <h3 style={{ fontSize:'1.25rem', fontWeight:'700', color:'#0f172a', margin:'0 0 0.5rem' }}>Welcome to the RG OneStop Admin Console</h3>
                  <p style={{ color:'#64748b', fontSize:'0.9rem', maxWidth:'500px', margin:'0 auto' }}>
                    Use the sidebar navigation to manage service categories, update banners, review print and customization orders, and control partner relationships.
                  </p>
                </div>
              </>
            )}

            {/* ── SERVICE CATEGORIES SECTION ── */}
            {activeSection === 'service_categories' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Service Categories</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Manage service category tiles shown on the homepage. Clicking a tile shows related business listings.</p>
                  </div>
                  <button className="btn btn-primary add-banner-btn" onClick={handleCatAddClick}>
                    <Plus size={18} /><span>Add Category</span>
                  </button>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'1rem', marginTop:'1.5rem' }}>
                  {serviceCategories && serviceCategories.length > 0 ? (
                    serviceCategories.map((cat) => (
                      <div key={cat.id} className="glass" style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(0,0,0,0.07)' }}>
                        <div style={{ padding:'1.25rem', textAlign:'center' }}>
                          {cat.logo || cat.image ? (
                            <img src={cat.logo || cat.image} alt={cat.title || cat.name} style={{ width:'60px', height:'60px', objectFit:'contain', borderRadius:'8px', margin:'0 auto 0.5rem', display:'block' }} />
                          ) : (
                            <div style={{ fontSize:'2.4rem', marginBottom:'0.5rem' }}>{cat.emoji || '💼'}</div>
                          )}
                          <h4 style={{ margin:0, fontSize:'0.95rem', fontWeight:'700', color:'#0f172a' }}>{cat.title || cat.name}</h4>
                        </div>
                        <div style={{ display:'flex', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                          {confirmDeleteCatId === cat.id ? (
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', justifyContent:'center', padding:'0.6rem', width:'100%' }}>
                              <span style={{ fontSize:'0.78rem', fontWeight:'600', color:'#ef4444' }}>Delete?</span>
                              <button onClick={() => handleDeleteCat(cat.id)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>Yes</button>
                              <button onClick={() => setConfirmDeleteCatId(null)} style={{ background:'#e2e8f0', color:'#374151', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>No</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleCatEditClick(cat)} style={{ flex:1, padding:'0.5rem', background:'none', border:'none', cursor:'pointer', color:'#3b82f6', fontWeight:'600', fontSize:'0.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                                <Edit3 size={13}/>Edit
                              </button>
                              <button onClick={() => setConfirmDeleteCatId(cat.id)} style={{ flex:1, padding:'0.5rem', background:'none', border:'none', borderLeft:'1px solid rgba(0,0,0,0.06)', cursor:'pointer', color:'#ef4444', fontWeight:'600', fontSize:'0.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                                <Trash2 size={13}/>Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-table-hint" style={{ gridColumn:'1 / -1' }}>No categories yet. Add your first category above.</p>
                  )}
                </div>
              </>
            )}

            {/* ── BANNERS SECTION ── */}
            {activeSection === 'banners' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Website Rotating Banners</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Manage dynamic banners displayed on the homepage slider. Dynamic links supported.</p>
                  </div>
                  <button className="btn btn-primary add-banner-btn" onClick={handleBannerAddClick}>
                    <Plus size={18} /><span>Add New Banner</span>
                  </button>
                </div>

                <div className="admin-banners-grid" style={{ marginTop:'1.5rem' }}>
                  {banners && banners.length > 0 ? (
                    banners.map((ban) => (
                      <div key={ban.id} className="admin-banner-row-card glass">
                        <div className="ab-preview" style={{ backgroundImage:`url(${ban.background})` }}>
                          <div className="ab-preview-overlay" style={{ display:'flex', gap:'0.5rem' }}>
                            {confirmDeleteBannerId === ban.id ? (
                              <>
                                <span style={{ color:'white', fontSize:'0.75rem', fontWeight:'600', alignSelf:'center', textShadow:'0 1px 2px rgba(0,0,0,0.5)' }}>Delete?</span>
                                <button onClick={() => handleDeleteBanner(ban.id)} style={{ background:'rgba(239,68,68,0.95)', color:'white', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>Yes</button>
                                <button onClick={() => setConfirmDeleteBannerId(null)} style={{ background:'rgba(255,255,255,0.9)', color:'#374151', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="ab-edit-btn" onClick={() => handleBannerEditClick(ban)} title="Edit" style={{ background:'rgba(59,130,246,0.9)', color:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                  <Edit3 size={14} />
                                </button>
                                <button className="ab-delete-btn" onClick={() => setConfirmDeleteBannerId(ban.id)} title="Delete" style={{ background:'rgba(239,68,68,0.9)', color:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ab-details">
                          <h4 style={{ margin:0, fontWeight:'700' }}>{ban.title}</h4>
                          <p style={{ margin:'0.25rem 0 0.75rem 0', color:'#64748b', fontSize:'0.85rem' }}>{ban.subtitle}</p>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'auto' }}>
                            {ban.cta && <span className="ab-cta-badge">Button: {ban.cta}</span>}
                            <span className="ab-cta-badge" style={{ background:'rgba(16,185,129,0.05)', color:'#059669' }}>Target: {ban.link || '/'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-table-hint" style={{ gridColumn:'1 / -1' }}>No banners in rotation. Add one above.</p>
                  )}
                </div>
              </>
            )}

            {/* ── BRANDING PARTNERS SECTION ── */}
            {activeSection === 'branding' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Branding Partners</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Add partner logos shown on the homepage. Logos must be under 1MB.</p>
                  </div>
                  <button className="btn btn-primary add-banner-btn" onClick={handlePartnerAddClick}>
                    <Plus size={18} /><span>Add Partner</span>
                  </button>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'1rem', marginTop:'1.5rem' }}>
                  {brandingPartners && brandingPartners.length > 0 ? (
                    brandingPartners.map((p) => (
                      <div key={p.id} className="glass" style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(0,0,0,0.07)', position:'relative' }}>
                        <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display:'block', padding:'1.5rem', textDecoration:'none', textAlign:'center' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ width:'80px', height:'80px', objectFit:'contain', borderRadius:'10px', margin:'0 auto 0.75rem' }} />
                          ) : (
                            <div style={{ width:'80px', height:'80px', borderRadius:'10px', background:'linear-gradient(135deg,#1F3A8A,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem', color:'white', fontSize:'1.8rem', fontWeight:'700' }}>
                              {(p.name||'P').charAt(0)}
                            </div>
                          )}
                          <h4 style={{ margin:'0 0 0.25rem', color:'#0f172a', fontSize:'0.95rem', fontWeight:'700' }}>{p.name}</h4>
                          <span style={{ fontSize:'0.75rem', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}><Globe size={12}/>{p.websiteUrl}</span>
                        </a>
                        <div style={{ display:'flex', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                          {confirmDeletePartnerId === p.id ? (
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', justifyContent:'center', padding:'0.6rem', width:'100%' }}>
                              <span style={{ fontSize:'0.78rem', fontWeight:'600', color:'#ef4444' }}>Delete?</span>
                              <button onClick={() => handleDeletePartner(p.id)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>Yes</button>
                              <button onClick={() => setConfirmDeletePartnerId(null)} style={{ background:'#e2e8f0', color:'#374151', border:'none', borderRadius:'6px', padding:'3px 10px', fontSize:'0.75rem', fontWeight:'700', cursor:'pointer' }}>No</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handlePartnerEditClick(p)} style={{ flex:1, padding:'0.5rem', background:'none', border:'none', cursor:'pointer', color:'#3b82f6', fontWeight:'600', fontSize:'0.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                                <Edit3 size={13}/>Edit
                              </button>
                              <button onClick={() => setConfirmDeletePartnerId(p.id)} style={{ flex:1, padding:'0.5rem', background:'none', border:'none', borderLeft:'1px solid rgba(0,0,0,0.06)', cursor:'pointer', color:'#ef4444', fontWeight:'600', fontSize:'0.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                                <Trash2 size={13}/>Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-table-hint" style={{ gridColumn:'1 / -1' }}>No branding partners yet. Add your first partner above.</p>
                  )}
                </div>
              </>
            )}

            {/* ── XEROX ORDERS SECTION ── */}
            {activeSection === 'xerox_orders' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Master Xerox Print Orders</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Track and manage document print requests submitted by users.</p>
                  </div>
                </div>

                <div className="admin-table-container" style={{ marginTop:'1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer / Contact</th>
                        <th>Document Details</th>
                        <th>Pages & Copies</th>
                        <th>Customizations</th>
                        <th>Total Price</th>
                        <th>Delivery Mode</th>
                        <th>Payment Status</th>
                        <th>Status</th>
                        <th style={{ textAlign:'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printOrders && printOrders.length > 0 ? (
                        printOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <div style={{ fontWeight:'700', color:'#0f172a' }}>{order.customerName}</div>
                              <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{order.phoneNumber}</div>
                              <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{order.customerEmail}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.fileName}>
                                📄 {order.fileName || 'document.pdf'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{order.fileSize || 'N/A'}</div>
                              {(order.fileUrl || order.fileBase64 || order.localIndexedDB) ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                  <button
                                    onClick={() => handleDownloadFile(order)}
                                    style={{
                                      border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.72rem',
                                      fontWeight: 600, padding: 0, textDecoration: 'underline', cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                  >
                                    Download
                                  </button>
                                  <span style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>|</span>
                                  <button
                                    onClick={() => handleDirectPrint(order)}
                                    style={{
                                      border: 'none', background: 'none', color: '#0f766e', fontSize: '0.72rem',
                                      fontWeight: 600, padding: 0, textDecoration: 'underline', cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                  >
                                    Direct Print
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                  No file uploaded
                                </span>
                              )}
                              <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'4px' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td>
                              <div style={{ fontSize:'0.85rem', color:'#0f172a', fontWeight:'600' }}>Pages: {order.pages || 'N/A'}</div>
                              <div style={{ fontSize:'0.82rem', color:'#64748b' }}>Copies: {order.copies || 1}</div>
                            </td>
                            <td>
                              <div style={{ fontSize:'0.75rem', color:'#475569' }}>Color: <strong style={{ textTransform:'capitalize' }}>{order.colorMode || order.printColor}</strong></div>
                              <div style={{ fontSize:'0.75rem', color:'#475569' }}>Sides: <strong>{order.sides}</strong></div>
                              <div style={{ fontSize:'0.75rem', color:'#475569' }}>Binding: <strong>{order.bindingType}</strong></div>
                            </td>
                            <td style={{ fontWeight:'800', color:'#2faf9e', fontSize:'1.05rem' }}>
                              ₹{order.totalPrice || 0}
                            </td>
                            <td>
                              <div style={{ fontWeight:'600', fontSize:'0.82rem', color:'#1e293b' }}>{order.deliveryMode || order.deliveryType}</div>
                              {order.deliveryAddress && <div style={{ fontSize:'0.72rem', color:'#64748b', maxWidth:'180px', whiteSpace:'normal', wordBreak:'break-all' }}>{order.deliveryAddress}</div>}
                            </td>
                            <td>
                              <div>
                                <span 
                                  className="status-badge-pill"
                                  style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: order.paymentStatus === 'Paid' ? '#dcfce7' : order.paymentStatus === 'Pending Verification' ? '#fef3c7' : '#fee2e2',
                                    color: order.paymentStatus === 'Paid' ? '#15803d' : order.paymentStatus === 'Pending Verification' ? '#b45309' : '#b91c1c'
                                  }}
                                >
                                  {order.paymentStatus || 'Unpaid'}
                                </span>
                              </div>
                              {order.transactionId && (
                                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px' }}>
                                  UTR: <strong>{order.transactionId}</strong>
                                </div>
                              )}
                              {order.paymentProof && (
                                <button 
                                  onClick={() => setSelectedPaymentProofUrl(order.paymentProof)}
                                  style={{
                                    border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.72rem',
                                    fontWeight: 600, padding: 0, textDecoration: 'underline', cursor: 'pointer',
                                    marginTop: '4px', display: 'block'
                                  }}
                                >
                                  View Proof
                                </button>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge-pill ${order.status === 'Completed' ? 'verified' : 'pending'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign:'right' }}>
                              <div className="table-action-row" style={{ justifyContent:'flex-end', gap: '4px' }}>
                                {order.paymentStatus === 'Pending Verification' && (
                                  <button 
                                    className="btn" 
                                    onClick={() => handleApprovePrintPayment(order)}
                                    style={{
                                      padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', borderRadius:'6px', cursor:'pointer',
                                      background: '#dcfce7', color: '#166534', border:'none'
                                    }}
                                  >
                                    Approve Pay
                                  </button>
                                )}
                                
                                <button 
                                  className="btn" 
                                  onClick={() => handleTogglePrintOrderStatus(order)}
                                  style={{
                                    padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', borderRadius:'6px', cursor:'pointer',
                                    background: order.status === 'Completed' ? '#f1f5f9' : '#dcfce7',
                                    color: order.status === 'Completed' ? '#475569' : '#166534',
                                    border:'none'
                                  }}
                                >
                                  {order.status === 'Completed' ? 'Pending' : 'Complete'}
                                </button>
 
                                {confirmDeletePrintOrderId === order.id ? (
                                  <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                                    <span style={{ fontSize:'0.72rem', color:'#ef4444', fontWeight:'600' }}>Del?</span>
                                    <button onClick={() => handleDeletePrintOrder(order.id)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'6px', padding:'3px 8px', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer' }}>Yes</button>
                                    <button onClick={() => setConfirmDeletePrintOrderId(null)} style={{ background:'#cbd5e1', color:'#334155', border:'none', borderRadius:'6px', padding:'3px 8px', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer' }}>No</button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmDeletePrintOrderId(order.id)} 
                                    style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="empty-table-hint" style={{ textAlign:'center', padding:'2rem' }}>No Xerox orders received yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── HASHTAG ORDERS SECTION ── */}
            {activeSection === 'hashtag_orders' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Hashtag Memories Gift Orders</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Track and manage custom frame and photo gift requests submitted by customers.</p>
                  </div>
                </div>

                <div className="admin-table-container" style={{ marginTop:'1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer / Contact</th>
                        <th>Product Details</th>
                        <th>Price</th>
                        <th>Delivery Mode</th>
                        <th>City / Address</th>
                        <th>Payment Status</th>
                        <th>Status</th>
                        <th style={{ textAlign:'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hashtagOrders && hashtagOrders.length > 0 ? (
                        hashtagOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <div style={{ fontWeight:'700', color:'#0f172a' }}>{order.customerName}</div>
                              <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{order.phoneNumber}</div>
                              <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{order.customerEmail}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight:'700', color:'#1e293b', fontSize:'0.9rem' }}>{order.productName}</div>
                              {order.localOrderId && (
                                <div style={{ fontSize:'0.68rem', color:'#6366f1', fontWeight:700, marginTop:'2px', background:'rgba(99,102,241,0.08)', display:'inline-block', padding:'1px 6px', borderRadius:'5px' }}>
                                  🔖 {order.localOrderId}
                                </div>
                              )}
                              <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td style={{ fontWeight:'800', color:'#2faf9e', fontSize:'1.05rem' }}>
                              ₹{order.price}
                            </td>
                            <td>
                              <span style={{ fontWeight:'600', fontSize:'0.82rem', color:'#475569' }}>{order.deliveryMode}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight:'600', fontSize:'0.82rem', color:'#1e293b' }}>{order.city}</div>
                              {order.deliveryMode === 'Home Delivery' && <div style={{ fontSize:'0.72rem', color:'#64748b', maxWidth:'200px', whiteSpace:'normal', wordBreak:'break-all' }}>{order.deliveryAddress}</div>}
                            </td>
                            <td>
                              <div>
                                <span 
                                  className="status-badge-pill"
                                  style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: order.paymentStatus === 'Paid' ? '#dcfce7' : order.paymentStatus === 'Pending Verification' ? '#fef3c7' : '#fee2e2',
                                    color: order.paymentStatus === 'Paid' ? '#15803d' : order.paymentStatus === 'Pending Verification' ? '#b45309' : '#b91c1c'
                                  }}
                                >
                                  {order.paymentStatus || 'Unpaid'}
                                </span>
                              </div>
                              {order.transactionId && (
                                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px' }}>
                                  UTR: <strong>{order.transactionId}</strong>
                                </div>
                              )}
                              {order.paymentProof && (
                                <button 
                                  onClick={() => setSelectedPaymentProofUrl(order.paymentProof)}
                                  style={{
                                    border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.72rem',
                                    fontWeight: 600, padding: 0, textDecoration: 'underline', cursor: 'pointer',
                                    marginTop: '4px', display: 'block'
                                  }}
                                >
                                  View Proof
                                </button>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge-pill ${order.status === 'Completed' ? 'verified' : 'pending'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign:'right' }}>
                              <div className="table-action-row" style={{ justifyContent:'flex-end', gap: '4px' }}>
                                {order.paymentStatus === 'Pending Verification' && (
                                  <button 
                                    className="btn" 
                                    onClick={() => handleApproveHashtagPayment(order)}
                                    style={{
                                      padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', borderRadius:'6px', cursor:'pointer',
                                      background: '#dcfce7', color: '#166534', border:'none'
                                    }}
                                  >
                                    Approve Pay
                                  </button>
                                )}
                                
                                <button 
                                  className="btn" 
                                  onClick={() => handleToggleHashtagOrderStatus(order)}
                                  style={{
                                    padding:'4px 10px', fontSize:'0.75rem', fontWeight:'700', borderRadius:'6px', cursor:'pointer',
                                    background: order.status === 'Completed' ? '#f1f5f9' : '#dcfce7',
                                    color: order.status === 'Completed' ? '#475569' : '#166534',
                                    border:'none'
                                  }}
                                >
                                  {order.status === 'Completed' ? 'Pending' : 'Complete'}
                                </button>
 
                                {confirmDeleteHashtagOrderId === order.id ? (
                                  <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                                    <span style={{ fontSize:'0.72rem', color:'#ef4444', fontWeight:'600' }}>Del?</span>
                                    <button onClick={() => handleDeleteHashtagOrder(order.id)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'6px', padding:'3px 8px', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer' }}>Yes</button>
                                    <button onClick={() => setConfirmDeleteHashtagOrderId(null)} style={{ background:'#cbd5e1', color:'#334155', border:'none', borderRadius:'6px', padding:'3px 8px', fontSize:'0.72rem', fontWeight:'700', cursor:'pointer' }}>No</button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmDeleteHashtagOrderId(order.id)} 
                                    style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="empty-table-hint" style={{ textAlign:'center', padding:'2rem' }}>No gift orders received yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── BUSINESS DIRECTORY SECTION ── */}
            {activeSection === 'businesses' && (
              <>
                <div className="tab-header">
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Business Listings Directory</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Approve, reject, and manage business directory listings registered by users.</p>
                  </div>
                </div>

                <div className="admin-table-container" style={{ marginTop:'1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Logo & Name</th>
                        <th>Category</th>
                        <th>City & Address</th>
                        <th>Contact Info</th>
                        <th>Verification Status</th>
                        <th style={{ textAlign:'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses && filteredBusinesses.length > 0 ? (
                        filteredBusinesses.map((biz) => (
                          <tr key={biz.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {biz.logo ? (
                                  <img src={biz.logo} alt={biz.businessName} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }} />
                                ) : (
                                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {(biz.businessName || 'B').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight:'700', color:'#0f172a' }}>{biz.businessName}</div>
                                  <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>
                                    Owner: {biz.ownerEmail === 'guest' && biz.userEmail ? biz.userEmail : (biz.ownerEmail || biz.userEmail || 'Guest')}
                                  </div>
                                  {biz.createdAt && <div style={{ fontSize:'0.68rem', color:'#94a3b8' }}>Submitted: {new Date(biz.createdAt).toLocaleDateString()}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{biz.category}</span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{biz.city}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={biz.address}>{biz.address}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: '#334155' }}>📞 {biz.contactNumber || 'N/A'}</div>
                              {biz.whatsappNumber && <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>💬 {biz.whatsappNumber}</div>}
                            </td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                                display: 'inline-block',
                                background: biz.verified ? '#dcfce7' : '#fef3c7',
                                color: biz.verified ? '#15803d' : '#b45309'
                              }}>
                                {biz.verified ? 'Approved / Active' : 'Pending Verification'}
                              </span>
                            </td>
                            <td style={{ textAlign:'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {!biz.verified ? (
                                  <>
                                    <button 
                                      onClick={() => handleApproveBusiness(biz)} 
                                      className="btn btn-primary"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#16a34a', borderColor: '#16a34a', cursor: 'pointer' }}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleRejectBusiness(biz)} 
                                      className="btn btn-outline"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleRevokeBusiness(biz)} 
                                      className="btn btn-outline"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#d97706', borderColor: '#f59e0b', cursor: 'pointer' }}
                                    >
                                      Revoke
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteBusiness(biz)} 
                                      className="btn btn-outline"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#f87171', cursor: 'pointer' }}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="empty-table-hint" style={{ textAlign: 'center', padding: '2rem' }}>
                            No business listings registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── PAYMENT CONFIG SECTION ── */}
            {activeSection === 'payment_settings' && (
              <>
                <div className="tab-header" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ margin:0, fontSize:'1.6rem', color:'#0f172a', fontWeight:'bold' }}>Payment QR & UPI Settings</h2>
                    <p style={{ margin:'0.4rem 0 0 0', color:'#64748b', fontSize:'0.875rem' }}>Configure the UPI QR Code scanner image, payee name, and UPI ID for customer checkout.</p>
                  </div>
                </div>

                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.8)', maxWidth: '600px' }}>
                  <form onSubmit={handleSavePaymentConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Payee Name</label>
                      <input 
                        type="text" 
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        placeholder="e.g. RG OneStop / Rakesh Gorle"
                        style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>UPI ID</label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 916301919669@ybl"
                        style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>UPI QR Code Scanner Image</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => qrFileRef.current.click()}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          Choose QR Screenshot
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Limit: 1MB
                        </span>
                        <input 
                          type="file" 
                          ref={qrFileRef}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setQrImage)}
                          style={{ display: 'none' }}
                        />
                      </div>
                      
                      {qrImage ? (
                        <div style={{ marginTop: '0.5rem', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '12px', background: 'white', display: 'inline-block', width: 'fit-content' }}>
                          <img src={qrImage} alt="QR Scanner Preview" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                          <button 
                            type="button" 
                            onClick={() => setQrImage('')}
                            style={{ display: 'block', margin: '8px auto 0', border: 'none', background: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: '#f8fafc', marginTop: '0.5rem' }}>
                          No QR Code uploaded yet.
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.65rem 1.5rem', fontWeight: 700 }}
                    >
                      Save Configuration
                    </button>

                  </form>
                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {/* ══════════ BANNER MODAL ══════════ */}
      {showBannerModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowBannerModal(false)}>
          <div className="ap-modal-container glass animate-fade-in">
            <button className="ap-modal-close" onClick={() => setShowBannerModal(false)}><X size={20}/></button>
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <ImageIcon className="icon-blue" size={24}/>
                <div>
                  <h3>{editingBannerId ? 'Edit Banner' : 'Add Banner'}</h3>
                  <p>{editingBannerId ? 'Update banner details.' : 'Add a new homepage slider banner.'}</p>
                </div>
              </div>
              <form onSubmit={handleBannerSubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="b-title">Banner Title *</label>
                  <input type="text" id="b-title" placeholder="e.g. Elegant Photo Frames" value={bannerForm.title} onChange={(e) => setBannerForm({...bannerForm, title:e.target.value})} className={bannerErrors.title ? 'error' : ''} />
                  {bannerErrors.title && <span className="error-message">{bannerErrors.title}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="b-subtitle">Subtitle *</label>
                  <input type="text" id="b-subtitle" placeholder="e.g. Capture the moment forever." value={bannerForm.subtitle} onChange={(e) => setBannerForm({...bannerForm, subtitle:e.target.value})} className={bannerErrors.subtitle ? 'error' : ''} />
                  {bannerErrors.subtitle && <span className="error-message">{bannerErrors.subtitle}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="b-cta">CTA Button Text</label>
                  <input type="text" id="b-cta" placeholder="e.g. Shop Now" value={bannerForm.cta} onChange={(e) => setBannerForm({...bannerForm, cta:e.target.value})} />
                </div>
                <div className="input-group">
                  <label htmlFor="b-linkType">Redirect To *</label>
                  <select id="b-linkType" value={bannerForm.linkType} onChange={(e) => setBannerForm({...bannerForm, linkType:e.target.value, selectedPartnerId:'', selectedCatId:''})} style={{ padding:'0.6rem 1rem', background:'white', border:'1px solid #cbd5e1', borderRadius:'8px', color:'#1e293b', fontSize:'0.9rem', outline:'none', width:'100%', cursor:'pointer' }}>
                    <option value="memories">Hashtag Memories & Gifts</option>
                    <option value="xerox">Master Xerox & Printing</option>
                    <option value="onestop">One Stop Categories Section</option>
                    <option value="branding">Branding Partner</option>
                    <option value="custom">Custom Link / URL</option>
                  </select>
                </div>
                {bannerForm.linkType === 'branding' && (
                  <div className="input-group animate-fade-in">
                    <label htmlFor="b-partner">Select Branding Partner *</label>
                    <select 
                      id="b-partner" 
                      value={bannerForm.selectedPartnerId || ''} 
                      onChange={(e) => setBannerForm({...bannerForm, selectedPartnerId:e.target.value})} 
                      style={{ padding:'0.6rem 1rem', background:'white', border:'1px solid #cbd5e1', borderRadius:'8px', color:'#1e293b', fontSize:'0.9rem', outline:'none', width:'100%', cursor:'pointer' }}
                      className={bannerErrors.selectedPartnerId ? 'error' : ''}
                      required
                    >
                      <option value="">-- Choose Partner --</option>
                      {brandingPartners && brandingPartners.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {bannerErrors.selectedPartnerId && <span className="error-message">{bannerErrors.selectedPartnerId}</span>}
                  </div>
                )}
                {bannerForm.linkType === 'onestop' && (
                  <div className="input-group animate-fade-in">
                    <label htmlFor="b-scat">Select Specific Category (Optional)</label>
                    <select 
                      id="b-scat" 
                      value={bannerForm.selectedCatId || ''} 
                      onChange={(e) => setBannerForm({...bannerForm, selectedCatId:e.target.value})} 
                      style={{ padding:'0.6rem 1rem', background:'white', border:'1px solid #cbd5e1', borderRadius:'8px', color:'#1e293b', fontSize:'0.9rem', outline:'none', width:'100%', cursor:'pointer' }}
                    >
                      <option value="">-- All Categories (No filter) --</option>
                      {serviceCategories && serviceCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.title || c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {bannerForm.linkType === 'custom' && (
                  <div className="input-group animate-fade-in">
                    <label htmlFor="b-customLink">Custom URL *</label>
                    <input type="text" id="b-customLink" placeholder="e.g. /my-page or https://example.com" value={bannerForm.customLink} onChange={(e) => setBannerForm({...bannerForm, customLink:e.target.value})} className={bannerErrors.customLink ? 'error' : ''} style={{ padding:'0.6rem 1rem', background:'white', border:'1px solid #cbd5e1', borderRadius:'8px', color:'#1e293b', fontSize:'0.9rem', outline:'none', width:'100%' }} />
                    {bannerErrors.customLink && <span className="error-message">{bannerErrors.customLink}</span>}
                  </div>
                )}
                <div className="input-group">
                  <label>Background Image * <small style={{ color:'#94a3b8', fontWeight:'400' }}>(max 1MB)</small></label>
                  <div className="ap-dropzone" onClick={() => bannerFileRef.current.click()}>
                    <input type="file" ref={bannerFileRef} onChange={(e) => handleImageUpload(e, setBannerImage)} accept="image/*" style={{ display:'none' }} />
                    {bannerImage ? (
                      <div className="ap-preview-box" onClick={(e) => e.stopPropagation()}>
                        <img src={bannerImage} alt="Banner preview" />
                        <button type="button" className="ap-remove-image" onClick={() => setBannerImage(null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Background Image</span>
                        <span className="file-hint">Landscape 800×400 preferred, under 1MB</span>
                      </div>
                    )}
                  </div>
                  {bannerErrors.image && <span className="error-message">{bannerErrors.image}</span>}
                </div>
                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowBannerModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isBannerSubmitting}>
                    {isBannerSubmitting ? <><Loader2 size={16} className="animate-spin"/><span>Saving...</span></> : <span>{editingBannerId ? 'Save Banner' : 'Add to Homepage'}</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ BRANDING PARTNER MODAL ══════════ */}
      {showPartnerModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowPartnerModal(false)}>
          <div className="ap-modal-container glass animate-fade-in">
            <button className="ap-modal-close" onClick={() => setShowPartnerModal(false)}><X size={20}/></button>
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <Building2 className="icon-blue" size={24}/>
                <div>
                  <h3>{editingPartnerId ? 'Edit Branding Partner' : 'Add Branding Partner'}</h3>
                  <p>Add partner logo, name and website link.</p>
                </div>
              </div>
              <form onSubmit={handlePartnerSubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="p-name">Partner / Organization Name *</label>
                  <input type="text" id="p-name" placeholder="e.g. Adikavi Nannaya University" value={partnerForm.name} onChange={(e) => setPartnerForm({...partnerForm, name:e.target.value})} className={partnerErrors.name ? 'error' : ''} />
                  {partnerErrors.name && <span className="error-message">{partnerErrors.name}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="p-url">Website URL *</label>
                  <input type="text" id="p-url" placeholder="e.g. https://aknu.edu.in" value={partnerForm.websiteUrl} onChange={(e) => setPartnerForm({...partnerForm, websiteUrl:e.target.value})} className={partnerErrors.websiteUrl ? 'error' : ''} />
                  {partnerErrors.websiteUrl && <span className="error-message">{partnerErrors.websiteUrl}</span>}
                </div>
                <div className="input-group">
                  <label>Partner Logo * <small style={{ color:'#94a3b8', fontWeight:'400' }}>(max 1MB)</small></label>
                  <div className="ap-dropzone" onClick={() => partnerFileRef.current.click()}>
                    <input type="file" ref={partnerFileRef} onChange={(e) => handleImageUpload(e, setPartnerLogo)} accept="image/*" style={{ display:'none' }} />
                    {partnerLogo ? (
                      <div className="ap-preview-box" style={{ padding:'0.5rem' }} onClick={(e) => e.stopPropagation()}>
                        <img src={partnerLogo} alt="Logo preview" style={{ maxHeight:'80px', objectFit:'contain' }} />
                        <button type="button" className="ap-remove-image" onClick={() => setPartnerLogo(null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Logo</span>
                        <span className="file-hint">Square logo preferred, under 1MB</span>
                      </div>
                    )}
                  </div>
                  {partnerErrors.logo && <span className="error-message">{partnerErrors.logo}</span>}
                </div>
                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowPartnerModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isPartnerSubmitting}>
                    {isPartnerSubmitting ? <><Loader2 size={16} className="animate-spin"/><span>Saving...</span></> : <span>{editingPartnerId ? 'Save Partner' : 'Add Partner'}</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SERVICE CATEGORY MODAL ══════════ */}
      {showCatModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCatModal(false)}>
          <div className="ap-modal-container glass animate-fade-in" style={{ maxWidth:'420px' }}>
            <button className="ap-modal-close" onClick={() => setShowCatModal(false)}><X size={20}/></button>
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <LayoutGrid className="icon-blue" size={24}/>
                <div>
                  <h3>{editingCatId ? 'Edit Category' : 'Add Service Category'}</h3>
                  <p>Category tile shown on homepage. Click = shows business listings.</p>
                </div>
              </div>
              <form onSubmit={handleCatSubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="cat-title">Category Title *</label>
                  <input type="text" id="cat-title" placeholder="e.g. Hospitals & Clinics" value={catForm.title} onChange={(e) => setCatForm({...catForm, title:e.target.value})} className={catErrors.title ? 'error' : ''} />
                  {catErrors.title && <span className="error-message">{catErrors.title}</span>}
                </div>
                <div className="input-group">
                  <label>Category Logo * <small style={{ color:'#94a3b8', fontWeight:'400' }}>(max 1MB)</small></label>
                  <div className="ap-dropzone" onClick={() => catFileRef.current.click()}>
                    <input type="file" ref={catFileRef} onChange={(e) => handleImageUpload(e, setCatLogo)} accept="image/*" style={{ display:'none' }} />
                    {catLogo ? (
                      <div className="ap-preview-box" style={{ padding:'0.5rem' }} onClick={(e) => e.stopPropagation()}>
                        <img src={catLogo} alt="Logo preview" style={{ maxHeight:'80px', objectFit:'contain' }} />
                        <button type="button" className="ap-remove-image" onClick={() => setCatLogo(null)}><X size={14}/></button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Category Logo</span>
                        <span className="file-hint">Square logo preferred, under 1MB</span>
                      </div>
                    )}
                  </div>
                  {catErrors.logo && <span className="error-message">{catErrors.logo}</span>}
                </div>
                {catLogo && catForm.title && (
                  <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'1rem', textAlign:'center' }}>
                    <img src={catLogo} alt="Preview" style={{ width:'60px', height:'60px', objectFit:'contain', margin:'0 auto 4px', display:'block' }} />
                    <div style={{ fontWeight:'600', fontSize:'0.9rem', color:'#0f172a' }}>{catForm.title}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px' }}>Preview</div>
                  </div>
                )}
                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowCatModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isCatSubmitting}>
                    {isCatSubmitting ? <><Loader2 size={16} className="animate-spin"/><span>Saving...</span></> : <span>{editingCatId ? 'Save Category' : 'Add Category'}</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PAYMENT PROOF MODAL ══════════ */}
      {selectedPaymentProofUrl && (
        <div className="ap-modal-backdrop" onClick={() => setSelectedPaymentProofUrl(null)}>
          <div className="ap-modal-container glass animate-fade-in" style={{ maxWidth: '600px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <button className="ap-modal-close" onClick={() => setSelectedPaymentProofUrl(null)}><X size={20}/></button>
            <div className="ap-modal-content" style={{ padding: '1rem' }}>
              <div className="ap-modal-header" style={{ marginBottom: '1rem' }}>
                <CreditCard className="icon-blue" size={24}/>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>Payment Proof Receipt</h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Full receipt uploaded by user for verification</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '1rem', maxHeight: '70vh', overflow: 'hidden' }}>
                <img 
                  src={selectedPaymentProofUrl} 
                  alt="Payment Proof Receipt" 
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
              </div>
              <div className="ap-form-footer" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={() => setSelectedPaymentProofUrl(null)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
