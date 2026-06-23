"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, User, Briefcase, ChevronDown, Loader2, LogOut, Check, Sparkles, X, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import AddBusinessModal from './AddBusinessModal';
import './Header.css';

const INDIAN_CITIES = [
  { name: "Hyderabad", pincode: "500001", state: "Telangana" },
  { name: "Secunderabad", pincode: "500003", state: "Telangana" },
  { name: "Guntur", pincode: "522002", state: "Andhra Pradesh" },
  { name: "Vijayawada", pincode: "520001", state: "Andhra Pradesh" },
  { name: "Visakhapatnam", pincode: "530001", state: "Andhra Pradesh" },
  { name: "Nellore", pincode: "524001", state: "Andhra Pradesh" },
  { name: "Tirupati", pincode: "517501", state: "Andhra Pradesh" },
  { name: "Kurnool", pincode: "518001", state: "Andhra Pradesh" },
  { name: "Kakinada", pincode: "533001", state: "Andhra Pradesh" },
  { name: "Rajahmundry", pincode: "533101", state: "Andhra Pradesh" },
  { name: "Warangal", pincode: "506001", state: "Telangana" },
  { name: "Nizamabad", pincode: "503001", state: "Telangana" },
  { name: "Karimnagar", pincode: "505001", state: "Telangana" },
  { name: "Khammam", pincode: "507001", state: "Telangana" },
  { name: "Anantapur", pincode: "515001", state: "Andhra Pradesh" },
  { name: "Kadapa", pincode: "516001", state: "Andhra Pradesh" },
  { name: "Eluru", pincode: "534001", state: "Andhra Pradesh" },
  { name: "Ongole", pincode: "523001", state: "Andhra Pradesh" },
  { name: "Chittoor", pincode: "517001", state: "Andhra Pradesh" },
  { name: "Vizianagaram", pincode: "535001", state: "Andhra Pradesh" },
  { name: "Srikakulam", pincode: "532001", state: "Andhra Pradesh" }
];

const POPULAR_CITIES = ["Hyderabad", "Guntur", "Vijayawada", "Visakhapatnam", "Nellore"];

const SEARCH_SUGGESTIONS = [
  { name: "Master Xerox", type: "Category", path: "/master-xerox" },
  { name: "Hashtag Memories", type: "Category", path: "/hashtag-memories" },
  { name: "Acrylic Photo Frame", type: "Product", path: "/hashtag-memories" },
  { name: "Photo Chocolate Box", type: "Product", path: "/hashtag-memories" },
  { name: "Polaroid Photo Set", type: "Product", path: "/hashtag-memories" },
  { name: "Custom Keychain", type: "Product", path: "/hashtag-memories" },
  { name: "RG Printing & Xerox", type: "Listing", path: "/" },
  { name: "Shine Photo Studio", type: "Listing", path: "/hashtag-memories" },
  { name: "Vamsi Printers & Bindings", type: "Listing", path: "/" }
];

const Header = () => {
  const router = useRouter();
  const { 
    user, 
    logout, 
    businesses,
    setLoginModalOpen, 
    setAddBusinessModalOpen,
    currentCity,
    changeCity,
    logo,
    notifications,
    markNotificationAsRead
  } = useAuth();

  // Notification States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const userNotifications = (notifications || []).filter(n => user && n.userEmail === user.email);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    const unread = userNotifications.filter(n => !n.read);
    for (let notif of unread) {
      try {
        await markNotificationAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  // Location States
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // User Dropdown State
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Refs for closing dropdowns on outside clicks
  const locDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);

  // IP Geolocation fallback
  const detectLocationByIP = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data && data.city) {
        return data.city;
      }
    } catch (e) {
      console.error("IP geolocation failed:", e);
    }
    return "Hyderabad";
  };

  // Geolocation detector
  const detectLocation = () => {
    setIsDetecting(true);
    setIsLocDropdownOpen(false);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            const city = data.city || data.locality || data.principalSubdivision;
            if (city) {
              changeCity(city);
            } else {
              const ipCity = await detectLocationByIP();
              changeCity(ipCity);
            }
          } catch (error) {
            console.error("Location reverse-geocode failed, using IP fallback:", error);
            const ipCity = await detectLocationByIP();
            changeCity(ipCity);
          } finally {
            setIsDetecting(false);
          }
        },
        async (error) => {
          console.warn("Geolocation permission denied, using IP fallback:", error);
          const ipCity = await detectLocationByIP();
          changeCity(ipCity);
          setIsDetecting(false);
        },
        { timeout: 6000 }
      );
    } else {
      detectLocationByIP().then(ipCity => {
        changeCity(ipCity);
        setIsDetecting(false);
      });
    }
  };

  // Run auto-detect quietly on mount only if there's no cache
  useEffect(() => {
    if (!localStorage.getItem('rg_detected_city')) {
      detectLocation();
    }
  }, []);

  // Handle outside click closures
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target)) {
        setIsLocDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter city suggestions by name or pincode
  const handleLocationQueryChange = (e) => {
    const val = e.target.value;
    setLocationQuery(val);
    
    if (val.trim().length > 0) {
      const filtered = INDIAN_CITIES.filter(city => 
        city.name.toLowerCase().includes(val.toLowerCase()) ||
        city.pincode.includes(val)
      );
      setLocSuggestions(filtered);
    } else {
      setLocSuggestions([]);
    }
  };

  // Filter search suggestions in real time
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = SEARCH_SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.type.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    router.push(suggestion.path);
    
    // Smooth scroll down to categories or product grid
    setTimeout(() => {
      const targetId = suggestion.type === "Category" ? "categories" : "categories";
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleManualCitySelect = (city) => {
    changeCity(city);
    setIsLocDropdownOpen(false);
  };

  const handleAddBusinessClick = () => {
    if (user) {
      setAddBusinessModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <header className="header glass">
        <div className="container header-container">
          
          {/* Left: Logo */}
          <Link href="/" className="header-logo">
            <img src={logo} alt="RG OneStop" className="logo-image" />
          </Link>

          {/* Location Selector (with automated cache + manual override dropdown) */}
          <div className="header-location-wrapper" ref={locDropdownRef}>
            <div 
              className="header-location" 
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
              title="Click to select or detect city"
            >
              {isDetecting ? (
                <Loader2 size={18} className="location-icon animate-spin" />
              ) : (
                <MapPin size={18} className="location-icon" />
              )}
              <div className="location-text">
                <span className="location-label">Delivering to</span>
                <span className="location-value">
                  {currentCity} <ChevronDown size={14} className={`chevron-transition ${isLocDropdownOpen ? 'rotate' : ''}`} />
                </span>
              </div>
            </div>

            {isLocDropdownOpen && (
              <div className="location-dropdown-card glass animate-fade-in">
                <button className="detect-now-btn" onClick={detectLocation}>
                  <Sparkles size={16} />
                  <span>Auto Detect Location</span>
                </button>
                <div className="dropdown-divider">or enter city / pincode</div>
                
                <div className="loc-search-input-wrapper">
                  <Search size={14} className="loc-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search city or pincode..." 
                    className="loc-search-input"
                    value={locationQuery}
                    onChange={handleLocationQueryChange}
                    autoFocus
                  />
                </div>

                <div className="cities-grid-list scrollable-list">
                  {locationQuery.trim().length > 0 ? (
                    locSuggestions.length > 0 ? (
                      locSuggestions.map((city) => (
                        <button 
                          key={city.name + city.pincode} 
                          className={`city-row-btn ${currentCity === city.name ? 'active' : ''}`}
                          onClick={() => {
                            handleManualCitySelect(city.name);
                            setLocationQuery("");
                            setLocSuggestions([]);
                          }}
                        >
                          <div className="city-suggestion-row">
                            <span className="city-name-txt">{city.name}</span>
                            <span className="city-pincode-txt">{city.pincode}</span>
                          </div>
                          {currentCity === city.name && <Check size={14} className="check-color" />}
                        </button>
                      ))
                    ) : (
                      <p className="no-cities-found">No suggestions found</p>
                    )
                  ) : (
                    <>
                      <p className="loc-section-title">Popular Cities</p>
                      {POPULAR_CITIES.map((city) => (
                        <button 
                          key={city} 
                          className={`city-row-btn ${currentCity === city ? 'active' : ''}`}
                          onClick={() => handleManualCitySelect(city)}
                        >
                          <span>{city}</span>
                          {currentCity === city && <Check size={14} className="check-color" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center: Search Bar with Suggestions */}
          <div className="header-search" ref={searchContainerRef}>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search for products, prints, gifts..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}>
                  <X size={14} style={{ color: '#9ca3af' }} />
                </button>
              )}
            </div>
            <button className="search-button">
              <Search size={20} />
            </button>

            {/* Suggestions Droplist overlay */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="search-suggestions-dropdown glass animate-fade-in">
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-row"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} className="suggestion-lens-icon" />
                    <span className="suggestion-name">{suggestion.name}</span>
                    <span className={`suggestion-badge ${suggestion.type.toLowerCase()}`}>
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="header-actions">
            {isMounted && user && (
              <div className="notification-bell-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
                <button 
                  className="action-btn bell-btn" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  title="View notifications"
                  style={{ 
                    position: 'relative', padding: '10px', borderRadius: '50%', 
                    background: 'rgba(0,0,0,0.03)', border: 'none', cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-dark)'
                  }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span 
                      className="bell-badge"
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        background: '#ef4444', color: 'white', fontSize: '9px',
                        fontWeight: 700, borderRadius: '50%', minWidth: '15px',
                        height: '15px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 2px'
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div 
                    className="notifications-dropdown-card glass animate-fade-in"
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                      width: '320px', background: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: '1rem',
                      zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.75rem',
                      color: '#1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          style={{ border: 'none', background: 'none', color: '#2faf9e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: 0 }}></div>
                    
                    <div 
                      className="notifications-list" 
                      style={{ 
                        maxHeight: '240px', overflowY: 'auto', display: 'flex', 
                        flexDirection: 'column', gap: '8px', paddingRight: '4px' 
                      }}
                    >
                      {userNotifications.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', margin: '1rem 0' }}>No notifications yet.</p>
                      ) : (
                        userNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            style={{ 
                              padding: '8px 10px', borderRadius: '8px', 
                              background: notif.read ? 'transparent' : 'rgba(47, 175, 158, 0.05)',
                              borderLeft: notif.read ? '3px solid transparent' : '3px solid #2faf9e',
                              fontSize: '0.8rem', position: 'relative',
                              display: 'flex', flexDirection: 'column', gap: '2px',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontWeight: notif.read ? 600 : 700, color: '#1e293b' }}>{notif.title}</span>
                              {!notif.read && (
                                <button 
                                  onClick={() => markNotificationAsRead(notif.id)}
                                  style={{ border: 'none', background: 'none', color: '#2faf9e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', padding: '0 2px' }}
                                  title="Mark as read"
                                >
                                  ✓
                                </button>
                              )}
                            </div>
                            <span style={{ color: '#475569', fontSize: '0.75rem', lineHeight: '1.3' }}>{notif.message}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '2px' }}>
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isMounted && user ? (
              /* If logged in, show user account dropdown */
              <div className="user-dropdown-wrapper" ref={userDropdownRef}>
                <button 
                  className="action-btn user-profile-btn" 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <img src={user.avatar} alt={user.name} className="user-header-avatar" />
                  <span className="user-header-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`chevron-transition ${isUserDropdownOpen ? 'rotate' : ''}`} />
                </button>

                {isUserDropdownOpen && (
                  <div className="user-dropdown-card glass animate-fade-in">
                    <div className="user-dropdown-profile-header">
                      <img src={user.avatar} alt={user.name} className="user-menu-avatar" />
                      <div className="user-menu-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="user-menu-listings-section">
                      <h5>My Registered Businesses</h5>
                      {(() => {
                        const myBusinesses = (businesses || []).filter(
                          (b) => user && (b.ownerEmail === user.email || b.userEmail === user.email)
                        );
                        return myBusinesses.length === 0 ? (
                          <p className="no-businesses-hint">No listings created yet.</p>
                        ) : (
                          <div className="user-menu-listings-scroll">
                            {myBusinesses.map((b) => (
                              <div key={b.id} className="menu-business-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.02)', marginBottom: '0.35rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                                  <span className="b-name" style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{b.businessName}</span>
                                  <span className="b-city" style={{ color: '#64748b', fontSize: '0.72rem' }}>{b.city}</span>
                                </div>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: b.verified ? '#dcfce7' : '#fef3c7',
                                  color: b.verified ? '#15803d' : '#b45309'
                                }}>
                                  {b.verified ? 'Approved' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="dropdown-divider"></div>

                    <button className="user-logout-btn" onClick={() => { logout(); setIsUserDropdownOpen(false); }}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* If logged out, show default login */
              <button className="action-btn login-btn" onClick={() => setLoginModalOpen(true)}>
                <User size={20} />
                <span>Login / Account</span>
              </button>
            )}

            <button className="btn btn-accent add-business-btn" onClick={handleAddBusinessClick}>
              <Briefcase size={18} />
              <span>Add Your Business</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Mounted Dialogs */}
      <AddBusinessModal />
    </>
  );
};

export default Header;
