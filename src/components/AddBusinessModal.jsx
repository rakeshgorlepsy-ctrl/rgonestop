"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Phone, MessageSquare, MapPin, Clock, FileText, Briefcase, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AddBusinessModal.css';

const CATEGORIES = [
  "Master Xerox & Printing",
  "Hashtag Memories & Gifts",
  "Flex & Banner Printing",
  "Binding & Stationeries",
  "Creative Graphic Design"
];

const CITIES = [
  "Hyderabad",
  "Guntur",
  "Vijayawada",
  "Visakhapatnam",
  "Nellore"
];

const AddBusinessModal = () => {
  const { isAddBusinessModalOpen, setAddBusinessModalOpen, addBusiness, user, serviceCategories } = useAuth();
  
  // Only use dynamic service categories from the database
  const dynamicCategories = [];
  if (serviceCategories && serviceCategories.length > 0) {
    serviceCategories.forEach(scat => {
      const name = scat.title || scat.name;
      if (name && !dynamicCategories.includes(name)) {
        dynamicCategories.push(name);
      }
    });
  }

  // Form Fields State
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    city: 'Hyderabad',
    address: '',
    contactNumber: '',
    whatsappNumber: '',
    sameAsContact: false,
    timings: '9:00 AM - 9:00 PM'
  });

  const [logo, setLogo] = useState(null);
  const [photos, setPhotos] = useState([]);
  
  // UI states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registeredDetails, setRegisteredDetails] = useState(null);

  // File Inputs Refs
  const logoInputRef = useRef(null);
  const photosInputRef = useRef(null);

  if (!isAddBusinessModalOpen) return null;

  const handleClose = () => {
    // Reset form states
    setFormData({
      businessName: '',
      category: '',
      description: '',
      city: 'Hyderabad',
      address: '',
      contactNumber: '',
      whatsappNumber: '',
      sameAsContact: false,
      timings: '9:00 AM - 9:00 PM'
    });
    setLogo(null);
    setPhotos([]);
    setErrors({});
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setRegisteredDetails(null);
    setAddBusinessModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'sameAsContact') {
      setFormData(prev => ({
        ...prev,
        sameAsContact: checked,
        whatsappNumber: checked ? prev.contactNumber : ''
      }));
    } else if (name === 'contactNumber') {
      // Ensure digits only, max 10
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        contactNumber: sanitized,
        whatsappNumber: prev.sameAsContact ? sanitized : prev.whatsappNumber
      }));
    } else if (name === 'whatsappNumber') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        whatsappNumber: sanitized,
        sameAsContact: prev.contactNumber === sanitized ? prev.sameAsContact : false
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Helper to compress images client-side using canvas
  const compressImage = (file, maxDim = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl;
          if (file.type === 'image/png') {
            dataUrl = canvas.toDataURL('image/png');
          } else {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = reader.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // File Readers for instant client-side preview with compression
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: "Logo must be under 50MB" }));
        return;
      }
      try {
        const compressed = await compressImage(file, 200, 0.5);
        setLogo(compressed);
        setErrors(prev => ({ ...prev, logo: null }));
      } catch (err) {
        console.error("Logo compression failed:", err);
        setErrors(prev => ({ ...prev, logo: "Failed to process logo image" }));
      }
    }
  };

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: "Maximum 5 business photos allowed" }));
      return;
    }

    for (let file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photos: "Each photo must be under 50MB" }));
        continue;
      }
      try {
        const compressed = await compressImage(file, 500, 0.5);
        setPhotos(prev => [...prev, compressed]);
        setErrors(prev => ({ ...prev, photos: null }));
      } catch (err) {
        console.error("Photo compression failed:", err);
        setErrors(prev => ({ ...prev, photos: "Failed to process one or more photos" }));
      }
    }
  };

  const handleRemovePhoto = (idxToRemove) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = "Business Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description.trim() || formData.description.length < 15) {
      newErrors.description = "Please provide a description of at least 15 characters";
    }
    if (!formData.address.trim()) newErrors.address = "Business Address is required";
    if (!formData.contactNumber || formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Please enter a valid 10-digit phone number";
    }
    if (!formData.whatsappNumber || formData.whatsappNumber.length < 10) {
      newErrors.whatsappNumber = "Please enter a valid 10-digit WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate database query & verification check
    setTimeout(async () => {
      try {
        const businessObject = {
          ...formData,
          logo,
          photos,
          userEmail: user?.email || 'guest@rgonestop.com',
          userAvatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Guest'}`
        };

        const savedBusiness = await addBusiness(businessObject);
        setRegisteredDetails(savedBusiness);
        setIsSubmitting(false);
        setSubmitSuccess(true);
      } catch (err) {
        console.error("Firestore write failed:", err);
        setErrors(prev => ({
          ...prev,
          submit: err.message || "Failed to register business. Please check connection and permissions."
        }));
        setIsSubmitting(false);
      }
    }, 1800);
  };

  return (
    <div className="add-business-backdrop" onClick={(e) => e.target.className === 'add-business-backdrop' && handleClose()}>
      <div className="add-business-modal-container glass animate-fade-in">
        <button className="add-business-close" onClick={handleClose}>
          <X size={20} />
        </button>

        {!submitSuccess ? (
          <div className="add-business-content">
            <div className="form-header">
              <Briefcase className="header-icon" size={26} />
              <div>
                <h2>Register Your Business</h2>
                <p>Promote your services to thousands of students and locals on RG OneStop.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="business-form">
              <div className="form-grid">
                
                {/* Left Column: Core Info */}
                <div className="form-column">
                  <div className="input-group">
                    <label htmlFor="businessName">Business Name *</label>
                    <div className="input-with-icon">
                      <Briefcase className="field-icon" size={16} />
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        placeholder="e.g. RG Master Xerox & Printers"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className={errors.businessName ? 'error' : ''}
                      />
                    </div>
                    {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="category">Select Business Category *</label>
                    <div className="input-with-icon">
                      <FileText className="field-icon" size={16} />
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={errors.category ? 'error' : ''}
                      >
                        <option value="">-- Choose Category --</option>
                        {dynamicCategories.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                  </div>

                  <div className="input-group">
                    <label htmlFor="description">Business Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      placeholder="Briefly describe what your business offers, special services, and any student discounts..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={errors.description ? 'error' : ''}
                    ></textarea>
                    {errors.description && <span className="error-message">{errors.description}</span>}
                  </div>

                  <div className="form-row-2">
                    <div className="input-group">
                      <label htmlFor="city">City / Operating Area *</label>
                      <div className="input-with-icon">
                        <MapPin className="field-icon" size={16} />
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        >
                          {CITIES.map((city, i) => (
                            <option key={i} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="timings">Business Working Hours</label>
                      <div className="input-with-icon">
                        <Clock className="field-icon" size={16} />
                        <input
                          type="text"
                          id="timings"
                          name="timings"
                          placeholder="e.g. 9:00 AM - 9:00 PM"
                          value={formData.timings}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="address">Full Street Address *</label>
                    <div className="input-with-icon">
                      <MapPin className="field-icon" size={16} />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="e.g. Shop No. 4, RG Plaza, opposite PG College Gate"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                      />
                    </div>
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>
                </div>

                {/* Right Column: Contact & Media */}
                <div className="form-column">
                  <div className="input-group">
                    <label htmlFor="contactNumber">Contact Mobile Number *</label>
                    <div className="input-with-icon">
                      <Phone className="field-icon" size={16} />
                      <input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        placeholder="10-digit Mobile number"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className={errors.contactNumber ? 'error' : ''}
                      />
                    </div>
                    {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
                  </div>

                  <div className="input-group">
                    <div className="label-with-checkbox">
                      <label htmlFor="whatsappNumber">WhatsApp Number *</label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="sameAsContact"
                          checked={formData.sameAsContact}
                          onChange={handleInputChange}
                        />
                        <span>Same as Mobile</span>
                      </label>
                    </div>
                    <div className="input-with-icon">
                      <MessageSquare className="field-icon" size={16} />
                      <input
                        type="tel"
                        id="whatsappNumber"
                        name="whatsappNumber"
                        placeholder="10-digit WhatsApp number"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        disabled={formData.sameAsContact}
                        className={errors.whatsappNumber ? 'error' : ''}
                      />
                    </div>
                    {errors.whatsappNumber && <span className="error-message">{errors.whatsappNumber}</span>}
                  </div>

                  {/* Logo Upload Zone */}
                  <div className="input-group">
                    <label>Upload Business Logo (Square ratio preferred)</label>
                    <div 
                      className="upload-dropzone logo-zone"
                      onClick={() => logoInputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      {logo ? (
                        <div className="logo-preview-container" onClick={(e) => e.stopPropagation()}>
                          <img src={logo} alt="Business logo preview" className="logo-preview-image" />
                          <button type="button" className="remove-preview-btn" onClick={() => setLogo(null)}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="dropzone-placeholder">
                          <Upload className="upload-icon" size={24} />
                          <span>Click or Drag Logo to Upload</span>
                           <span className="file-hint">JPG, PNG, WebP (auto-compressed)</span>
                        </div>
                      )}
                    </div>
                    {errors.logo && <span className="error-message">{errors.logo}</span>}
                  </div>

                  {/* Business Photos Upload Zone */}
                  <div className="input-group">
                    <label>Business / Showcase Photos (Up to 5 photos)</label>
                    <div 
                      className="upload-dropzone photos-zone"
                      onClick={() => photosInputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={photosInputRef}
                        onChange={handlePhotosChange}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                      <div className="dropzone-placeholder">
                        <ImageIcon className="upload-icon" size={24} />
                        <span>Upload Business Showcase Photos ({photos.length}/5)</span>
                        <span className="file-hint">Any file size (auto-compressed)</span>
                      </div>
                    </div>
                    {errors.photos && <span className="error-message">{errors.photos}</span>}

                    {photos.length > 0 && (
                      <div className="photos-preview-grid">
                        {photos.map((photo, idx) => (
                          <div key={idx} className="photo-preview-item">
                            <img src={photo} alt={`Showcase preview ${idx + 1}`} />
                            <button type="button" className="remove-preview-btn" onClick={() => handleRemovePhoto(idx)}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {errors.submit && (
                <div className="error-message" style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center', marginBottom: '1rem', width: '100%' }}>
                  ❌ {errors.submit}
                </div>
              )}

              {/* Action buttons */}
              <div className="form-footer-actions">
                <button type="button" className="btn btn-outline cancel-btn" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Details...</span>
                    </>
                  ) : (
                    <span>Register Business</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="success-overlay-container">
            <div className="success-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
              <div className="success-checkmark-wrapper" style={{ margin: '0 auto 1.5rem', background: '#dcfce7', borderRadius: '50%', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 className="success-checkmark-icon" size={64} style={{ color: '#16a34a' }} />
              </div>
              <h2 className="success-title" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Listing Submitted!</h2>
              <p className="success-desc" style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.6', margin: '0 auto 1.5rem', maxWidth: '420px' }}>
                Congratulations! Your business <strong>{registeredDetails?.businessName || formData.businessName}</strong> is under review.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Your business will be listed under the <strong>{registeredDetails?.category || formData.category}</strong> category once it has been verified and approved by the admin.
              </p>

              <div className="success-details-summary" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.75rem', textAlign: 'left' }}>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.85rem' }}>
                  <span className="summary-label" style={{ color: '#64748b', fontWeight: '500' }}>Listed Area:</span>
                  <span className="summary-value" style={{ color: '#0f172a', fontWeight: '700' }}>{registeredDetails?.city || formData.city}</span>
                </div>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.85rem' }}>
                  <span className="summary-label" style={{ color: '#64748b', fontWeight: '500' }}>Contact Number:</span>
                  <span className="summary-value" style={{ color: '#0f172a', fontWeight: '700' }}>+91 {registeredDetails?.contactNumber || formData.contactNumber}</span>
                </div>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' }}>
                  <span className="summary-label" style={{ color: '#64748b', fontWeight: '500' }}>Registered Owner:</span>
                  <span className="summary-value" style={{ color: '#0f172a', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', whiteSpace: 'nowrap' }} title={user ? `${user.name} (${user.email})` : "Guest User"}>
                    {user ? `${user.name} (${user.email})` : (registeredDetails?.userEmail || formData.userEmail || "Guest User")}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary close-success-btn" onClick={handleClose} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '700' }}>
                Go to Dashboard / Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBusinessModal;
