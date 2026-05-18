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
  const { isAddBusinessModalOpen, setAddBusinessModalOpen, addBusiness, user } = useAuth();
  
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

  // File Readers for instant client-side preview
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: "Logo must be under 2MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        setErrors(prev => ({ ...prev, logo: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: "Maximum 5 business photos allowed" }));
      return;
    }

    files.forEach(file => {
      if (file.size > 3 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photos: "Each photo must be under 3MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
        setErrors(prev => ({ ...prev, photos: null }));
      };
      reader.readAsDataURL(file);
    });
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

    // Simulate high-fidelity database query & verification check
    setTimeout(() => {
      const businessObject = {
        ...formData,
        logo,
        photos,
        userEmail: user?.email || 'suresh.rg@gmail.com',
        userAvatar: user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Suresh'
      };

      const savedBusiness = addBusiness(businessObject);
      setRegisteredDetails(savedBusiness);
      setIsSubmitting(false);
      setSubmitSuccess(true);
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
                        {CATEGORIES.map((cat, i) => (
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
                          <span className="file-hint">JPG, PNG, WebP up to 2MB</span>
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
                        <span className="file-hint">Images up to 3MB each</span>
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
            <div className="success-card">
              <div className="success-checkmark-wrapper">
                <CheckCircle2 className="success-checkmark-icon" size={72} />
              </div>
              <h2 className="success-title">Listing Created Successfully!</h2>
              <p className="success-desc">
                Congratulations! <strong>{registeredDetails?.businessName}</strong> has been listed under the <strong>{registeredDetails?.category}</strong> category and is now active in <strong>{registeredDetails?.city}</strong>.
              </p>

              <div className="success-details-summary">
                <div className="summary-row">
                  <span className="summary-label">Listed Area:</span>
                  <span className="summary-value">{registeredDetails?.city}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Contact Number:</span>
                  <span className="summary-value">+91 {registeredDetails?.contactNumber}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Registered Owner:</span>
                  <span className="summary-value">{user?.name || "Suresh Kumar"} ({user?.email || "suresh.rg@gmail.com"})</span>
                </div>
              </div>

              <button className="btn btn-primary close-success-btn" onClick={handleClose}>
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
