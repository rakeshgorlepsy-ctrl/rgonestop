"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, User, Briefcase, ChevronDown, Loader2, LogOut, Check, Sparkles } from 'lucide-react';
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
  { name: "Master Xerox", type: "Category", path: "/" },
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
    changeCity
  } = useAuth();

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
            
            const city = data.city || data.locality || data.principalSubdivision || "Hyderabad";
            changeCity(city);
          } catch (error) {
            console.error("Location reverse-geocode failed, using fallback:", error);
            changeCity("Hyderabad");
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied, using default:", error);
          changeCity("Hyderabad");
          setIsDetecting(false);
        },
        { timeout: 6000 }
      );
    } else {
      changeCity("Hyderabad");
      setIsDetecting(false);
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
            <img src="/assets/logo.png" alt="RG OneStop" className="logo-image" />
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
                      {businesses.length === 0 ? (
                        <p className="no-businesses-hint">No listings created yet.</p>
                      ) : (
                        <div className="user-menu-listings-scroll">
                          {businesses.map((b) => (
                            <div key={b.id} className="menu-business-item">
                              <span className="b-name">{b.businessName}</span>
                              <span className="b-city">{b.city}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
      <LoginModal />
      <AddBusinessModal />
    </>
  );
};

export default Header;
