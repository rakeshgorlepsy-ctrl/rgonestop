"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Briefcase, ShoppingBag, ShieldCheck, Check, X, Trash2, Plus, 
  Settings, Home, ArrowUpRight, BarChart2, AlertTriangle, Upload, Loader2, Sparkles,
  Image as ImageIcon, Grid as GridIcon, Edit3, Lock, ShieldAlert, Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const router = useRouter();
  const { 
    user, 
    businesses, 
    products, 
    banners,
    categories,
    serviceCategories,
    addProduct, 
    updateProduct,
    deleteProduct, 
    addBanner,
    updateBanner,
    deleteBanner,
    addCategory,
    updateCategory,
    deleteCategory,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    updateBusiness, 
    deleteBusiness,
    loginWithGoogle,
    logout
  } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Admin authentication specific states
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Product modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // Null = add mode, String = edit mode
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Master Xerox & Printing'
  });
  const [productImage, setProductImage] = useState(null);
  const [productErrors, setProductErrors] = useState({});
  const productFileRef = useRef(null);

  // Banner modal states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null); // Null = add, String = edit
  const [isBannerSubmitting, setIsBannerSubmitting] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    cta: 'Shop Now'
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerErrors, setBannerErrors] = useState({});
  const bannerFileRef = useRef(null);

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null); // Null = add, String = edit
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#1F3A8A',
    path: '/'
  });
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryErrors, setCategoryErrors] = useState({});
  const categoryFileRef = useRef(null);

  // Service Category modal states
  const [showServiceCategoryModal, setShowServiceCategoryModal] = useState(false);
  const [editingServiceCategoryId, setEditingServiceCategoryId] = useState(null);
  const [isServiceCategorySubmitting, setIsServiceCategorySubmitting] = useState(false);
  const [serviceCategoryForm, setServiceCategoryForm] = useState({
    title: '',
    emoji: '💼'
  });
  const [serviceCategoryErrors, setServiceCategoryErrors] = useState({});

  // Authentication gate
  const isAdmin = user && user.email === 'suresh.rg@gmail.com';

  const handleAdminSelectAccount = (account) => {
    setSelectedUser(account);
    setIsAuthenticating(true);
    setTimeout(async () => {
      try {
        await loginWithGoogle(account);
      } catch (err) {
        console.error("Mock Login Error:", err);
      } finally {
        setIsAuthenticating(false);
        setSelectedUser(null);
        setShowGoogleChooser(false);
      }
    }, 1500);
  };

  const handleAdminRealGoogleLogin = async () => {
    setSelectedUser({
      name: "Google Account",
      email: "signing in...",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Google"
    });
    setIsAuthenticating(true);
    try {
      await loginWithGoogle(); // No parameter triggers real Firebase Google Auth
    } catch (err) {
      console.error("Real Google Login Error:", err);
    } finally {
      setIsAuthenticating(false);
      setSelectedUser(null);
      setShowGoogleChooser(false);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    setShowGoogleChooser(false);
    setIsAuthenticating(false);
    setSelectedUser(null);
  };

  if (!user) {
    return (
      <div className="admin-login-backdrop">
        <div className="admin-login-stars-bg"></div>
        <div className="admin-login-card glass animate-fade-in">
          {isAuthenticating ? (
            <div className="admin-google-auth-loading">
              <div className="admin-spinner-wrapper">
                <Loader2 size={56} className="admin-google-spinner" />
                {selectedUser?.avatar && (
                  <img src={selectedUser.avatar} alt="User Avatar" className="admin-loading-avatar" />
                )}
              </div>
              <h3 className="admin-auth-loading-title">Connecting to Google</h3>
              <p className="admin-auth-loading-text">
                Authorizing secure administrative session for <br />
                <strong>{selectedUser?.email}</strong>...
              </p>
            </div>
          ) : !showGoogleChooser ? (
            <div className="admin-login-content">
              <div className="admin-login-shield-wrapper animate-pulse">
                <Lock size={44} className="admin-login-shield-icon" />
              </div>
              <h2 className="admin-login-title">RG Admin Console</h2>
              <p className="admin-login-desc">
                Authorized access only. Please authenticate with your Google account to manage businesses, banners, categories, and products.
              </p>

              <button className="admin-google-signin-btn" onClick={() => setShowGoogleChooser(true)}>
                <div className="admin-google-icon-wrapper">
                  <svg className="admin-google-icon" viewBox="0 0 24 24">
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
                <span className="admin-google-btn-text">Sign in with Google</span>
              </button>

              <button className="admin-back-home-btn" onClick={() => router.push('/')}>
                <Home size={16} />
                <span>Return to Live Site</span>
              </button>
            </div>
          ) : (
            <div className="admin-google-chooser animate-fade-in">
              <div className="admin-chooser-header">
                <svg className="admin-google-logo-sm" viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <h3>Choose an account</h3>
                <p>to continue to <strong>RG Console</strong></p>
              </div>

              <div className="admin-google-accounts-list">
                <button 
                  className="admin-google-account-row highlight-admin"
                  onClick={() => handleAdminSelectAccount({
                    name: "Suresh Kumar",
                    email: "suresh.rg@gmail.com",
                    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Suresh"
                  })}
                >
                  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Suresh" alt="Suresh Avatar" className="admin-google-account-avatar" />
                  <div className="admin-google-account-info">
                    <span className="admin-google-account-name">Suresh Kumar (Admin)</span>
                    <span className="admin-google-account-email">suresh.rg@gmail.com</span>
                  </div>
                  <ShieldCheck size={18} className="admin-highlight-shield" />
                </button>

                <button 
                  className="admin-google-account-row"
                  onClick={() => handleAdminSelectAccount({
                    name: "Rohit Gupta",
                    email: "rohit.gupta@gmail.com",
                    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rohit"
                  })}
                >
                  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Rohit" alt="Rohit Avatar" className="admin-google-account-avatar" />
                  <div className="admin-google-account-info">
                    <span className="admin-google-account-name">Rohit Gupta</span>
                    <span className="admin-google-account-email">rohit.gupta@gmail.com</span>
                  </div>
                </button>

                <button className="admin-google-account-row use-another" onClick={handleAdminRealGoogleLogin}>
                  <div className="admin-google-add-icon-bg">
                    <Plus size={16} />
                  </div>
                  <div className="admin-google-account-info">
                    <span className="admin-google-account-name custom-add">Use another Google Account</span>
                  </div>
                </button>
              </div>

              <button className="admin-chooser-back-btn" onClick={() => setShowGoogleChooser(false)}>
                Go Back
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
          <p className="admin-login-desc">
            Your current account is not registered as an administrator. Access is restricted to designated personnel only.
          </p>

          <div className="admin-unauthorized-profile">
            <img src={user.avatar} alt={user.name} className="unauth-profile-avatar" />
            <div className="unauth-profile-details">
              <span className="unauth-profile-name">{user.name}</span>
              <span className="unauth-profile-email">{user.email}</span>
            </div>
            <span className="unauth-status-pill">Unauthorized</span>
          </div>

          <div className="admin-unauthorized-actions">
            <button className="btn btn-outline admin-switch-account-btn" onClick={handleSwitchAccount}>
              Switch Account
            </button>
            <button className="btn btn-primary admin-gohome-btn" onClick={() => router.push('/')}>
              <Home size={18} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Image Readers ---
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Product CRUD Handlers ---
  const handleProductEditClick = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || '',
      category: p.category || 'Master Xerox & Printing'
    });
    setProductImage(p.image);
    setProductErrors({});
    setShowProductModal(true);
  };

  const handleProductAddClick = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      price: '',
      originalPrice: '',
      category: 'Master Xerox & Printing'
    });
    setProductImage(null);
    setProductErrors({});
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!productForm.name.trim()) newErrors.name = "Product name is required";
    if (!productForm.price.trim()) newErrors.price = "Price is required (e.g. ₹299)";

    if (Object.keys(newErrors).length > 0) {
      setProductErrors(newErrors);
      return;
    }

    setIsProductSubmitting(true);
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          ...productForm,
          image: productImage
        });
      } else {
        await addProduct({
          ...productForm,
          image: productImage
        });
      }
      setShowProductModal(false);
    } catch (error) {
      console.error("Failed to submit product:", error);
      alert("Error saving product: " + error.message);
    } finally {
      setIsProductSubmitting(false);
    }
  };

  // --- Banner CRUD Handlers ---
  const handleBannerAddClick = () => {
    setEditingBannerId(null);
    setBannerForm({ title: '', subtitle: '', cta: 'Shop Now' });
    setBannerImage(null);
    setBannerErrors({});
    setShowBannerModal(true);
  };

  const handleBannerEditClick = (ban) => {
    setEditingBannerId(ban.id);
    setBannerForm({
      title: ban.title,
      subtitle: ban.subtitle,
      cta: ban.cta || 'Shop Now'
    });
    setBannerImage(ban.background);
    setBannerErrors({});
    setShowBannerModal(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!bannerForm.title.trim()) newErrors.title = "Banner title is required";
    if (!bannerForm.subtitle.trim()) newErrors.subtitle = "Banner subtitle is required";
    if (!bannerImage) newErrors.image = "A background display image is required";

    if (Object.keys(newErrors).length > 0) {
      setBannerErrors(newErrors);
      return;
    }

    setIsBannerSubmitting(true);
    try {
      if (editingBannerId) {
        await updateBanner(editingBannerId, {
          ...bannerForm,
          background: bannerImage
        });
      } else {
        await addBanner({
          ...bannerForm,
          background: bannerImage
        });
      }
      setBannerForm({ title: '', subtitle: '', cta: 'Shop Now' });
      setBannerImage(null);
      setShowBannerModal(false);
    } catch (error) {
      console.error("Failed to submit banner:", error);
      alert("Error saving banner: " + error.message);
    } finally {
      setIsBannerSubmitting(false);
    }
  };

  const handleDeleteBanner = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from homepage banner rotation?`)) {
      deleteBanner(id);
    }
  };

  // --- Category CRUD Handlers ---
  const handleCategoryAddClick = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', color: '#1F3A8A', path: '/' });
    setCategoryImage(null);
    setCategoryErrors({});
    setShowCategoryModal(true);
  };

  const handleCategoryEditClick = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      color: cat.color || '#1F3A8A',
      path: cat.path || '/'
    });
    setCategoryImage(cat.image);
    setCategoryErrors({});
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!categoryForm.name.trim()) newErrors.name = "Category name is required";
    if (!categoryImage) newErrors.image = "An icon/logo image is required";

    if (Object.keys(newErrors).length > 0) {
      setCategoryErrors(newErrors);
      return;
    }

    setIsCategorySubmitting(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          ...categoryForm,
          image: categoryImage
        });
      } else {
        await addCategory({
          ...categoryForm,
          image: categoryImage
        });
      }
      setCategoryForm({ name: '', color: '#1F3A8A', path: '/' });
      setCategoryImage(null);
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to submit category:", error);
      alert("Error saving category: " + error.message);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  // --- Service Category CRUD Handlers ---
  const handleServiceCategoryAddClick = () => {
    setEditingServiceCategoryId(null);
    setServiceCategoryForm({ title: '', emoji: '💼' });
    setServiceCategoryErrors({});
    setShowServiceCategoryModal(true);
  };

  const handleServiceCategoryEditClick = (cat) => {
    setEditingServiceCategoryId(cat.id);
    setServiceCategoryForm({
      title: cat.title || cat.name || '',
      emoji: cat.emoji || '💼'
    });
    setServiceCategoryErrors({});
    setShowServiceCategoryModal(true);
  };

  const handleServiceCategorySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!serviceCategoryForm.title.trim()) newErrors.title = "Category name is required";
    if (!serviceCategoryForm.emoji.trim()) newErrors.emoji = "Category Emoji is required";

    if (Object.keys(newErrors).length > 0) {
      setServiceCategoryErrors(newErrors);
      return;
    }

    setIsServiceCategorySubmitting(true);
    try {
      if (editingServiceCategoryId) {
        await updateServiceCategory(editingServiceCategoryId, {
          title: serviceCategoryForm.title,
          emoji: serviceCategoryForm.emoji
        });
      } else {
        await addServiceCategory({
          title: serviceCategoryForm.title,
          emoji: serviceCategoryForm.emoji
        });
      }
      setShowServiceCategoryModal(false);
    } catch (error) {
      console.error("Failed to submit service category:", error);
      alert("Error saving service category: " + error.message);
    } finally {
      setIsServiceCategorySubmitting(false);
    }
  };

  const handleDeleteServiceCategory = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete service category "${title}"?`)) {
      deleteServiceCategory(id);
    }
  };

  const handleVerifyToggle = (id, currentStatus) => {
    updateBusiness(id, { verified: !currentStatus });
  };

  const handleDeleteBusiness = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete business "${name}"?`)) {
      deleteBusiness(id);
    }
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete product "${name}"?`)) {
      deleteProduct(id);
    }
  };

  // Aggregated Stats
  const totalBusinesses = businesses.length;
  const verifiedBusinesses = businesses.filter(b => b.verified).length;
  const pendingBusinesses = totalBusinesses - verifiedBusinesses;
  const totalProducts = products.length;
  const totalBanners = banners.length;
  const totalCategories = categories.length;
  const totalServiceCategories = serviceCategories ? serviceCategories.length : 0;

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="admin-brand-details">
            <span className="admin-brand-title">RG ADMIN</span>
            <span className="admin-brand-subtitle">Console Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart2 size={18} />
            <span>Overview Dashboard</span>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <ImageIcon size={18} />
            <span>Manage Banners</span>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <GridIcon size={18} />
            <span>Manage Categories</span>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'serviceCategories' ? 'active' : ''}`}
            onClick={() => setActiveTab('serviceCategories')}
          >
            <Layers size={18} />
            <span>Service Categories</span>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} />
            <span>Manage Products</span>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'businesses' ? 'active' : ''}`}
            onClick={() => setActiveTab('businesses')}
          >
            <Briefcase size={18} />
            <span>Manage Businesses</span>
            {pendingBusinesses > 0 && <span className="pending-badge-count">{pendingBusinesses}</span>}
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>System Configs</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="sidebar-footer-btn return-home-btn">
            <Home size={16} />
            <span>View Live Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main-content">
        {/* Main Header */}
        <header className="admin-main-header">
          <div className="header-breadcrumbs">
            <span className="bc-parent">Admin Dashboard</span>
            <span className="bc-separator">/</span>
            <span className="bc-current text-capitalize">{activeTab}</span>
          </div>

          <div className="admin-header-profile">
            <img src={user.avatar} alt={user.name} className="admin-profile-avatar" />
            <div className="admin-profile-info">
              <span className="admin-profile-name">{user.name}</span>
              <span className="admin-profile-role">Super Administrator</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Content */}
        <div className="admin-inner-panel">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content animate-fade-in">
              <div className="tab-header-compact">
                <h2>Overview Dashboard</h2>
                <p>Real-time platform summaries, verification pending queues, and active catalog counts.</p>
              </div>

              {/* Stats Grid Cards */}
              <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                  <div className="stat-card-left">
                    <ImageIcon size={24} className="icon-purple" />
                    <span className="stat-label">Active Banners</span>
                    <span className="stat-value">{totalBanners}</span>
                  </div>
                  <div className="stat-card-badge positive">Slides Rotating</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-left">
                    <GridIcon size={24} className="icon-blue" />
                    <span className="stat-label">Main Categories</span>
                    <span className="stat-value">{totalCategories}</span>
                  </div>
                  <div className="stat-card-badge positive">Homepage Active</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-left">
                    <Layers size={24} className="icon-orange" style={{ color: '#f97316' }} />
                    <span className="stat-label">Service Categories</span>
                    <span className="stat-value">{totalServiceCategories}</span>
                  </div>
                  <div className="stat-card-badge positive">Business Index</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-left">
                    <ShoppingBag size={24} className="icon-teal" />
                    <span className="stat-label">Trending Products</span>
                    <span className="stat-value">{totalProducts}</span>
                  </div>
                  <div className="stat-card-badge positive">Listed Catalog</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-left">
                    <Briefcase size={24} className="icon-yellow" />
                    <span className="stat-label">Verified Listings</span>
                    <span className="stat-value">{verifiedBusinesses}</span>
                  </div>
                  <div className="stat-card-badge positive">{pendingBusinesses} Pending Approvals</div>
                </div>
              </div>

              {/* Recent activities */}
              <div className="overview-sub-grid">
                <div className="overview-sub-card">
                  <div className="sub-card-header">
                    <h3>Recent Business Listings</h3>
                    <button className="view-all-tab-btn" onClick={() => setActiveTab('businesses')}>Manage All</button>
                  </div>
                  <div className="sub-card-list">
                    {businesses.length === 0 ? (
                      <p className="no-listings-label">No listings found in the index.</p>
                    ) : (
                      businesses.slice(0, 3).map((b) => (
                        <div key={b.id} className="overview-list-row">
                          <div className="row-business-branding">
                            <div className="row-initial-avatar">
                              {b.businessName.charAt(0)}
                            </div>
                            <div className="row-info-col">
                              <span className="row-b-name">{b.businessName}</span>
                              <span className="row-b-cat">{b.category}</span>
                            </div>
                          </div>
                          <div className="row-meta-col">
                            <span className="row-b-city">{b.city}</span>
                            <span className={`status-pill ${b.verified ? 'verified' : 'pending'}`}>
                              {b.verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="overview-sub-card">
                  <div className="sub-card-header">
                    <h3>System Vital Logs</h3>
                  </div>
                  <div className="vitals-column-list">
                    <div className="vital-row">
                      <span className="v-label">Vite Dev Server</span>
                      <span className="v-value text-success">Online (Port 5173)</span>
                    </div>
                    <div className="vital-row">
                      <span className="v-label">Simulated Database Connection</span>
                      <span className="v-value text-success">Connected (MongoDB Cluster)</span>
                    </div>
                    <div className="vital-row">
                      <span className="v-label">Mock REST API Endpoints</span>
                      <span className="v-value text-success">Status 200 OK</span>
                    </div>
                    <div className="vital-row">
                      <span className="v-label">Security Protocol Layer</span>
                      <span className="v-value text-success">JWT OAuth Activated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE BANNERS TAB */}
          {activeTab === 'banners' && (
            <div className="banners-tab-content animate-fade-in">
              <div className="tab-header">
                <div>
                  <h2>Manage Homepage Banners</h2>
                  <p>Add new slider banners, customize titles/taglines, and delete elements from slide rotation.</p>
                </div>
                <button className="btn btn-primary add-banner-btn" onClick={handleBannerAddClick}>
                  <Plus size={18} />
                  <span>Add New Banner</span>
                </button>
              </div>

              {/* Banners Admin Grid */}
              <div className="admin-banners-grid">
                {banners && banners.length > 0 ? (
                  banners.map((ban) => (
                    <div key={ban.id} className="admin-banner-row-card glass">
                      <div className="ab-preview" style={{ backgroundImage: `url(${ban.background})` }}>
                        <div className="ab-preview-overlay" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="ab-edit-btn"
                            onClick={() => handleBannerEditClick(ban)}
                            title="Edit banner"
                            style={{ background: 'rgba(59, 130, 246, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="ab-delete-btn"
                            onClick={() => handleDeleteBanner(ban.id, ban.title)}
                            title="Delete banner"
                            style={{ background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="ab-details">
                        <h4>{ban.title}</h4>
                        <p>{ban.subtitle}</p>
                        {ban.cta && <span className="ab-cta-badge">Button: {ban.cta}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-table-hint" style={{ gridColumn: '1 / -1' }}>No banners in rotation.</p>
                )}
              </div>
            </div>
          )}

          {/* MANAGE CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="categories-tab-content animate-fade-in">
              <div className="tab-header">
                <div>
                  <h2>Manage Homepage Categories</h2>
                  <p>Add new category circles, configure brand themes, and manage target navigation routes.</p>
                </div>
                <button className="btn btn-primary add-category-btn" onClick={handleCategoryAddClick}>
                  <Plus size={18} />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Categories Admin Grid */}
              <div className="admin-categories-grid">
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat.id} className="admin-category-circle-card glass">
                      <div className="ac-circle-wrapper" style={{ position: 'relative' }}>
                        <img src={cat.image} alt={cat.name} className="ac-avatar-image" />
                        <div className="ac-actions-wrapper" style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '4px' }}>
                          <button 
                            className="ac-edit-btn"
                            onClick={() => handleCategoryEditClick(cat)}
                            title="Edit category"
                            style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Edit3 size={10} />
                          </button>
                          <button 
                            className="ac-delete-btn"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            title="Delete category"
                            style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="ac-info">
                        <h4>{cat.name}</h4>
                        <span className="ac-route-tag">Path: {cat.path || '/'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-table-hint" style={{ gridColumn: '1 / -1' }}>No categories registered.</p>
                )}
              </div>
            </div>
          )}

          {/* MANAGE SERVICE CATEGORIES TAB */}
          {activeTab === 'serviceCategories' && (
            <div className="categories-tab-content animate-fade-in">
              <div className="tab-header">
                <div>
                  <h2>Manage Service Categories</h2>
                  <p>Add, edit, or delete business categories that appear on the public directory index grid.</p>
                </div>
                <button className="btn btn-primary add-category-btn" onClick={handleServiceCategoryAddClick}>
                  <Plus size={18} />
                  <span>Add Service Category</span>
                </button>
              </div>

              {/* Service Categories Admin Grid */}
              <div className="admin-categories-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {serviceCategories && serviceCategories.length > 0 ? (
                  serviceCategories.map((cat) => (
                    <div key={cat.id} className="admin-category-circle-card glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', position: 'relative' }}>
                      <div className="ac-circle-wrapper" style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {cat.emoji || '💼'}
                      </div>
                      
                      <div className="ac-actions-wrapper" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                        <button 
                          className="ac-edit-btn"
                          onClick={() => handleServiceCategoryEditClick(cat)}
                          title="Edit Service Category"
                          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          className="ac-delete-btn"
                          onClick={() => handleDeleteServiceCategory(cat.id, cat.title || cat.name)}
                          title="Delete Service Category"
                          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="ac-info" style={{ textAlign: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>{cat.title || cat.name}</h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-table-hint" style={{ gridColumn: '1 / -1' }}>No service categories registered.</p>
                )}
              </div>
            </div>
          )}

          {/* BUSINESSES TAB */}
          {activeTab === 'businesses' && (
            <div className="businesses-tab-content animate-fade-in">
              <div className="tab-header">
                <div>
                  <h2>Manage Directory Listings</h2>
                  <p>Approve new business listings, verify academic xerox shops, and manage listings details.</p>
                </div>
              </div>

              <div className="admin-table-container glass">
                {businesses.length === 0 ? (
                  <p className="empty-table-hint">No listings exist in the system yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Business details</th>
                        <th>Location & Address</th>
                        <th>Contact info</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <div className="table-b-branding">
                              {b.logo ? (
                                <img src={b.logo} alt="Business logo" className="table-b-logo" />
                              ) : (
                                <div className="table-b-initial">{b.businessName.charAt(0)}</div>
                              )}
                              <div className="table-b-info">
                                <span className="tb-name">{b.businessName}</span>
                                <span className="tb-category">{b.category}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-col-details">
                              <span className="tb-city-tag">{b.city}</span>
                              <span className="tb-address">{b.address}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-col-details">
                              <span className="tb-phone">📞 +91 {b.contactNumber}</span>
                              <span className="tb-whatsapp">💬 +91 {b.whatsappNumber}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge-pill ${b.verified ? 'verified' : 'pending'}`}>
                              {b.verified ? 'Verified & Listed' : 'Pending Verification'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-row">
                              <button 
                                className={`action-btn-circle ${b.verified ? 'unverify' : 'verify'}`}
                                onClick={() => handleVerifyToggle(b.id, b.verified)}
                                title={b.verified ? "Reject/Revoke verification" : "Approve and list business"}
                              >
                                {b.verified ? <X size={14} /> : <Check size={14} />}
                              </button>
                              <button 
                                className="action-btn-circle delete"
                                onClick={() => handleDeleteBusiness(b.id, b.businessName)}
                                title="Delete listing permanently"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="products-tab-content animate-fade-in">
              <div className="tab-header">
                <div>
                  <h2>Manage Homepage Products</h2>
                  <p>Add new products to the public homepage slider, edit prices, and delete obsolete listings.</p>
                </div>
                <button className="btn btn-primary add-product-btn" onClick={handleProductAddClick}>
                  <Plus size={18} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Admin Grid */}
              <div className="admin-products-grid">
                {products.length === 0 ? (
                  <p className="empty-table-hint">No products listed in catalog.</p>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="admin-product-card glass">
                      <div className="ap-image-wrapper">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop'} 
                          alt={p.name} 
                        />
                        <div className="ap-actions-overlay">
                          <button 
                            className="ap-overlay-action-btn edit"
                            onClick={() => handleProductEditClick(p)}
                            title="Edit product"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            className="ap-overlay-action-btn delete"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="ap-details">
                        <span className="ap-category">{p.category || "General Gift"}</span>
                        <h3>{p.name}</h3>
                        <div className="ap-pricing">
                          <span className="ap-price">{p.price}</span>
                          {p.originalPrice && <span className="ap-old-price">{p.originalPrice}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-header-compact">
                <h2>System Configurations</h2>
                <p>Inspect active front-end parameters, back-end environment models, and system features variables.</p>
              </div>

              <div className="settings-split-grid">
                <div className="settings-panel-card glass">
                  <div className="sp-header">
                    <ShieldCheck size={20} className="icon-blue" />
                    <h3>Secure Backend Variables (.env)</h3>
                  </div>
                  <p className="sp-desc">
                    These parameters are protected by node servers and never delivered to standard public builds.
                  </p>
                  
                  <div className="env-lines-list">
                    <div className="env-line">
                      <span className="env-k">NODE_ENV</span>
                      <span className="env-v">production</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">DATABASE_URL</span>
                      <span className="env-v-secure">mongodb+srv://rg_admin:••••••••••••••••@cluster0...</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">JWT_SECRET</span>
                      <span className="env-v-secure">••••••••••••••••••••••••••••••••</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">SMTP_SERVER</span>
                      <span className="env-v">smtp.gmail.com</span>
                    </div>
                  </div>
                </div>

                <div className="settings-panel-card glass">
                  <div className="sp-header">
                    <Sparkles size={20} className="icon-teal" />
                    <h3>Client Frontend Variables (.env.local)</h3>
                  </div>
                  <p className="sp-desc">
                    These environment definitions are bundled into client resources via Next.js at build triggers.
                  </p>

                  <div className="env-lines-list">
                    <div className="env-line">
                      <span className="env-k">NEXT_PUBLIC_API_BASE_URL</span>
                      <span className="env-v text-highlight">http://localhost:5000/api</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span>
                      <span className="env-v text-highlight">google_oauth_client_id_placeholder.apps...</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">NEXT_PUBLIC_WEBSITE_NAME</span>
                      <span className="env-v">"RG OneStop"</span>
                    </div>
                    <div className="env-line">
                      <span className="env-k">NEXT_PUBLIC_SUPPORT_WHATSAPP</span>
                      <span className="env-v">+916301919669</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- Overlay Add/Edit Product Form Modal Dialog --- */}
      {showProductModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target.className === 'ap-modal-backdrop' && setShowProductModal(false)}>
          <div className="ap-modal-container glass animate-fade-in">
            <button className="ap-modal-close" onClick={() => setShowProductModal(false)}>
              <X size={20} />
            </button>
            
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <ShoppingBag className="icon-blue" size={24} />
                <div>
                  <h3>{editingProductId ? 'Edit Trending Product' : 'Add Trending Product'}</h3>
                  <p>{editingProductId ? 'Update pricing or title details in real-time.' : 'Publish a new item directly to the public homepage slider.'}</p>
                </div>
              </div>

              <form onSubmit={handleProductSubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="name">Product Title *</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g. Personalized Wooden Collage Frame"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className={productErrors.name ? 'error' : ''}
                  />
                  {productErrors.name && <span className="error-message">{productErrors.name}</span>}
                </div>

                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="price">Offer Price *</label>
                    <input
                      type="text"
                      id="price"
                      placeholder="e.g. ₹399"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      className={productErrors.price ? 'error' : ''}
                    />
                    {productErrors.price && <span className="error-message">{productErrors.price}</span>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="originalPrice">Original Price (Strikeout)</label>
                    <input
                      type="text"
                      id="originalPrice"
                      placeholder="e.g. ₹599"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="category">Catalog Category</label>
                  <select
                    id="category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  >
                    <option value="Master Xerox & Printing">Master Xerox & Printing</option>
                    <option value="Hashtag Memories & Gifts">Hashtag Memories & Gifts</option>
                    <option value="Flex & Banners">Flex & Banners</option>
                    <option value="Corporate Giveaways">Corporate Giveaways</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Product Display Image</label>
                  <div 
                    className="ap-dropzone"
                    onClick={() => productFileRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={productFileRef}
                      onChange={(e) => handleImageUpload(e, setProductImage)}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {productImage ? (
                      <div className="ap-preview-box" onClick={(e) => e.stopPropagation()}>
                        <img src={productImage} alt="Product preview" />
                        <button type="button" className="ap-remove-image" onClick={() => setProductImage(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Showcase Image</span>
                        <span className="file-hint">Ratio 1:1 preferred, under 2MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowProductModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isProductSubmitting}>
                    {isProductSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingProductId ? 'Save Product' : 'Add to Homepage'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Add Banner Form Modal Dialog --- */}
      {showBannerModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target.className === 'ap-modal-backdrop' && setShowBannerModal(false)}>
          <div className="ap-modal-container glass animate-fade-in">
            <button className="ap-modal-close" onClick={() => setShowBannerModal(false)}>
              <X size={20} />
            </button>
            
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <ImageIcon className="icon-blue" size={24} />
                <div>
                  <h3>{editingBannerId ? 'Edit Homepage Slide Banner' : 'Add Homepage Slide Banner'}</h3>
                  <p>{editingBannerId ? 'Update slide titles or details in real-time.' : 'Design dynamic rotating billboards for the public top-level slider.'}</p>
                </div>
              </div>

              <form onSubmit={handleBannerSubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="b-title">Banner Title *</label>
                  <input
                    type="text"
                    id="b-title"
                    placeholder="e.g. Elegant Photo Frames"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                    className={bannerErrors.title ? 'error' : ''}
                  />
                  {bannerErrors.title && <span className="error-message">{bannerErrors.title}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="b-subtitle">Banner Subtitle Tagline *</label>
                  <input
                    type="text"
                    id="b-subtitle"
                    placeholder="e.g. Capture the moment forever."
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                    className={bannerErrors.subtitle ? 'error' : ''}
                  />
                  {bannerErrors.subtitle && <span className="error-message">{bannerErrors.subtitle}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="b-cta">Call-To-Action Button Name</label>
                  <input
                    type="text"
                    id="b-cta"
                    placeholder="e.g. Shop Now"
                    value={bannerForm.cta}
                    onChange={(e) => setBannerForm({...bannerForm, cta: e.target.value})}
                  />
                </div>

                <div className="input-group">
                  <label>Background Display Image *</label>
                  <div 
                    className="ap-dropzone"
                    onClick={() => bannerFileRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={bannerFileRef}
                      onChange={(e) => handleImageUpload(e, setBannerImage)}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {bannerImage ? (
                      <div className="ap-preview-box" onClick={(e) => e.stopPropagation()}>
                        <img src={bannerImage} alt="Banner background preview" />
                        <button type="button" className="ap-remove-image" onClick={() => setBannerImage(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Background Graphic</span>
                        <span className="file-hint">Horizontal 800x400 preferred, under 2MB</span>
                      </div>
                    )}
                  </div>
                  {bannerErrors.image && <span className="error-message">{bannerErrors.image}</span>}
                </div>

                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowBannerModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isBannerSubmitting}>
                    {isBannerSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Publishing Banner...</span>
                      </>
                    ) : (
                      <span>{editingBannerId ? 'Save Banner' : 'Add to Homepage'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Add Category Form Modal Dialog --- */}
      {showCategoryModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target.className === 'ap-modal-backdrop' && setShowCategoryModal(false)}>
          <div className="ap-modal-container glass animate-fade-in">
            <button className="ap-modal-close" onClick={() => setShowCategoryModal(false)}>
              <X size={20} />
            </button>
            
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <GridIcon className="icon-blue" size={24} />
                <div>
                  <h3>{editingCategoryId ? 'Edit Homepage Category' : 'Add Homepage Category'}</h3>
                  <p>{editingCategoryId ? 'Update Category titles, brand colors, or routes.' : 'Design circular category listings for dynamic main page groupings.'}</p>
                </div>
              </div>

              <form onSubmit={handleCategorySubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="cat-name">Category Title Name *</label>
                  <input
                    type="text"
                    id="cat-name"
                    placeholder="e.g. Master Class"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className={categoryErrors.name ? 'error' : ''}
                  />
                  {categoryErrors.name && <span className="error-message">{categoryErrors.name}</span>}
                </div>

                <div className="form-row-2">
                  <div className="input-group">
                    <label htmlFor="cat-color">Brand Accent Color</label>
                    <input
                      type="color"
                      id="cat-color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                      style={{ padding: '0.2rem', height: '38px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="cat-path">Redirect Link Route</label>
                    <input
                      type="text"
                      id="cat-path"
                      placeholder="e.g. /hashtag-memories"
                      value={categoryForm.path}
                      onChange={(e) => setCategoryForm({...categoryForm, path: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Circle Icon Display Image *</label>
                  <div 
                    className="ap-dropzone"
                    onClick={() => categoryFileRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={categoryFileRef}
                      onChange={(e) => handleImageUpload(e, setCategoryImage)}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {categoryImage ? (
                      <div className="ap-preview-box" onClick={(e) => e.stopPropagation()}>
                        <img src={categoryImage} alt="Category icon preview" />
                        <button type="button" className="ap-remove-image" onClick={() => setCategoryImage(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="ap-dropzone-placeholder">
                        <Upload size={24} className="icon-gray" />
                        <span>Upload Circular Icon Image</span>
                        <span className="file-hint">Square 1:1 image preferred, under 2MB</span>
                      </div>
                    )}
                  </div>
                  {categoryErrors.image && <span className="error-message">{categoryErrors.image}</span>}
                </div>

                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowCategoryModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isCategorySubmitting}>
                    {isCategorySubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving Category...</span>
                      </>
                    ) : (
                      <span>{editingCategoryId ? 'Save Category Changes' : 'Save Category'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Add/Edit Service Category Form Modal Dialog --- */}
      {showServiceCategoryModal && (
        <div className="ap-modal-backdrop" onClick={(e) => e.target.className === 'ap-modal-backdrop' && setShowServiceCategoryModal(false)}>
          <div className="ap-modal-container glass animate-fade-in" style={{ maxWidth: '480px' }}>
            <button className="ap-modal-close" onClick={() => setShowServiceCategoryModal(false)}>
              <X size={20} />
            </button>
            
            <div className="ap-modal-content">
              <div className="ap-modal-header">
                <Layers className="icon-blue" size={24} style={{ color: '#f97316' }} />
                <div>
                  <h3>{editingServiceCategoryId ? 'Edit Service Category' : 'Add Service Category'}</h3>
                  <p>{editingServiceCategoryId ? 'Modify category title or icon.' : 'Create a new category for local directory registrations.'}</p>
                </div>
              </div>

              <form onSubmit={handleServiceCategorySubmit} className="ap-modal-form">
                <div className="input-group">
                  <label htmlFor="scat-title">Category Title Name *</label>
                  <input
                    type="text"
                    id="scat-title"
                    placeholder="e.g. Restaurants & Cafés"
                    value={serviceCategoryForm.title}
                    onChange={(e) => setServiceCategoryForm({...serviceCategoryForm, title: e.target.value})}
                    className={serviceCategoryErrors.title ? 'error' : ''}
                  />
                  {serviceCategoryErrors.title && <span className="error-message">{serviceCategoryErrors.title}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="scat-emoji">Emoji Icon / Glyph *</label>
                  <input
                    type="text"
                    id="scat-emoji"
                    placeholder="e.g. 🍔 or 🏥"
                    value={serviceCategoryForm.emoji}
                    onChange={(e) => setServiceCategoryForm({...serviceCategoryForm, emoji: e.target.value})}
                    className={serviceCategoryErrors.emoji ? 'error' : ''}
                    style={{ fontSize: '1.5rem', padding: '0.4rem 0.8rem' }}
                  />
                  <span className="file-hint" style={{ marginTop: '4px' }}>Paste any emoji (Win + . shortcut) to represent this category.</span>
                  {serviceCategoryErrors.emoji && <span className="error-message">{serviceCategoryErrors.emoji}</span>}
                </div>

                <div className="ap-form-footer">
                  <button type="button" className="btn btn-outline cancel-btn" onClick={() => setShowServiceCategoryModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isServiceCategorySubmitting} style={{ background: '#f97316', borderColor: '#f97316' }}>
                    {isServiceCategorySubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingServiceCategoryId ? 'Save Changes' : 'Create Category'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
