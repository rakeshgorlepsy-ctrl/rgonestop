"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HMMobileNav from '../components/hm/HMMobileNav';
import { Upload, FileText, Check, Plus, Minus, Info, X, ChevronDown, ChevronUp, ShoppingCart, Truck, MessageSquare, Tag, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MasterXeroxPage.css';

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

// Dynamic PDF.js script loader to handle PDF parsing on the client side
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Parse page syntax like "1-3,5,7-9" into an array of page numbers
const parseCustomPages = (inputString, totalPages) => {
  if (!inputString || !inputString.trim()) return [];
  
  const pages = new Set();
  const parts = inputString.split(',');
  
  for (let part of parts) {
    part = part.trim();
    if (part.includes('-')) {
      const range = part.split('-');
      if (range.length === 2) {
        const start = parseInt(range[0].trim(), 10);
        const end = parseInt(range[1].trim(), 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) {
              pages.add(i);
            }
          }
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
};

const MasterXeroxPage = () => {
  const { addPrintOrder, user, setLoginModalOpen, paymentConfig } = useAuth();
  
  // Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentProofBase64, setPaymentProofBase64] = useState('');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [copiedField, setCopiedField] = useState(null); // 'upi' | 'amount' | 'orderid'
  // Page Configuration States
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [filePages, setFilePages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw'); // 'bw', 'color', 'custom'
  const [printSides, setPrintSides] = useState('single'); // 'single', 'both'
  const [isScanning, setIsScanning] = useState(false);
  
  // Additional Sheets, Binding and Delivery States
  const [bindingType, setBindingType] = useState('none'); // 'none', 'spiral', 'tape', 'thesis'
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup', 'delivery'
  
  // Show more details toggle
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('other');
  const [customPagesInput, setCustomPagesInput] = useState('');
  const [colorPagesList, setColorPagesList] = useState([]);
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' or 'nextday'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Parse custom pages whenever input or filePages changes
  useEffect(() => {
    const parsed = parseCustomPages(customPagesInput, filePages);
    setColorPagesList(parsed);
  }, [customPagesInput, filePages]);

  // Render first page of PDF as print preview
  useEffect(() => {
    if (selectedFile && !isScanning) {
      const renderPdfPreview = async () => {
        try {
          const pdfjs = await loadPdfJs();
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const typedarray = new Uint8Array(event.target.result);
              const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
              const page = await pdf.getPage(1);
              
              const canvas = canvasRef.current;
              if (!canvas) return;
              
              const context = canvas.getContext('2d');
              
              // Calculate scale based on container width
              const desiredWidth = canvas.parentElement ? canvas.parentElement.clientWidth - 20 : 350;
              const originalViewport = page.getViewport({ scale: 1 });
              const scale = desiredWidth / originalViewport.width;
              const viewport = page.getViewport({ scale: scale || 1 });
              
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              const renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              
              await page.render(renderContext).promise;
            } catch (error) {
              console.error("Error rendering PDF preview: ", error);
            }
          };
          reader.readAsArrayBuffer(selectedFile);
        } catch (err) {
          console.error("Failed to load PDF library for preview: ", err);
        }
      };
      
      const timer = setTimeout(renderPdfPreview, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedFile, isScanning]);

  const GRAPH_SHEET_PRICE = 1.00;

  // Calculate final price in real-time
  const calculateTotalPrice = () => {
    if (!selectedFile) return 0;
    
    // Page cost
    let pageCost = 0;
    if (colorMode === 'bw') {
      if (printSides === 'single') {
        pageCost = filePages * 1.60;
      } else {
        pageCost = Math.ceil(filePages / 2) * 1.80; // 1.80 per sheet double-sided
      }
    } else if (colorMode === 'color') {
      if (printSides === 'single') {
        pageCost = filePages * 10.00; // 10.00 per page single-sided
      } else {
        pageCost = Math.ceil(filePages / 2) * 18.00; // 18.00 per sheet double-sided
      }
    } else { // custom
      const colorCount = colorPagesList.length;
      const bwCount = Math.max(0, filePages - colorCount);
      if (printSides === 'single') {
        pageCost = (colorCount * 10.00) + (bwCount * 1.60);
      } else {
        pageCost = (colorCount * 9.00) + (bwCount * 0.90);
      }
    }
    const documentCost = pageCost * copies;
    
    // Additional graph sheets cost is 0 since we removed them from UI
    const extraSheetsCost = 0;
    
    // Binding cost calculation: Spiral/Tape is ₹30 per 100pg, Thesis is ₹200 flat
    let bindingCost = 0;
    if (bindingType === 'spiral' || bindingType === 'tape') {
      bindingCost = Math.ceil(filePages / 100) * 30 * copies;
    } else if (bindingType === 'thesis') {
      bindingCost = 200 * copies;
    }
    
    // Delivery cost: 0 for pickup, standard (₹50) or next day (₹30) for other address, 0 for colleges
    let deliveryCost = 0;
    if (deliveryOption === 'delivery') {
      if (deliveryLocation === 'other') {
        deliveryCost = deliverySpeed === 'standard' ? 50 : 30;
      } else {
        deliveryCost = 0;
      }
    }
    
    return Math.ceil(documentCost + extraSheetsCost + bindingCost + deliveryCost);
  };

  const totalPrice = calculateTotalPrice();

  // Dynamic Date calculation
  const [deliveryDateText, setDeliveryDateText] = useState('');
  useEffect(() => {
    const today = new Date();
    // Delivery tomorrow (or dynamic day)
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + 1);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[delivery.getDay()];
    const dateNum = delivery.getDate();
    const monthName = months[delivery.getMonth()];
    
    setDeliveryDateText(`Next day delivery by ${dayName}, ${dateNum} ${monthName}`);
  }, []);

  // Handle URL deep-linking options on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      const sidesParam = params.get('sides');
      const bindingParam = params.get('binding');
      
      if (typeParam === 'bw' || typeParam === 'color' || typeParam === 'custom') {
        setColorMode(typeParam);
      }
      if (sidesParam === 'single' || sidesParam === 'both') {
        setPrintSides(sidesParam);
      }
      if (bindingParam === 'none' || bindingParam === 'spiral' || bindingParam === 'tape' || bindingParam === 'thesis') {
        setBindingType(bindingParam);
      }
    }
  }, []);

  // Handle PDF file upload selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Basic validation of extension/MIME type
      const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
      const isPdfMime = file.type === 'application/pdf';
      if (!isPdfExtension && !isPdfMime) {
        alert("Please upload a valid PDF file.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsScanning(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const typedarray = new Uint8Array(event.target.result);
            
            // Verify PDF Magic Bytes (%PDF)
            if (typedarray.length < 4 || 
                typedarray[0] !== 0x25 || // '%'
                typedarray[1] !== 0x50 || // 'P'
                typedarray[2] !== 0x44 || // 'D'
                typedarray[3] !== 0x46) {  // 'F'
              alert("The uploaded file does not appear to be a valid PDF. Please ensure it is not corrupted.");
              setSelectedFile(null);
              setFilePages(1);
              if (fileInputRef.current) fileInputRef.current.value = '';
              setIsScanning(false);
              return;
            }
            
            const pdfjs = await loadPdfJs();
            const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
            setFilePages(pdf.numPages);
            setCustomPagesInput('');
            setSelectedFile(file);
            
            if (file.size <= 1 * 1024 * 1024) {
              const base64Reader = new FileReader();
              base64Reader.onloadend = () => {
                setFileBase64(base64Reader.result);
              };
              base64Reader.readAsDataURL(file);
            } else {
              setFileBase64('');
            }
          } catch (error) {
            console.error("Error parsing PDF pages: ", error);
            alert("Could not read the PDF page count. Please ensure it is a valid, uncorrupted PDF.");
            setSelectedFile(null);
            setFileBase64('');
            setFilePages(1);
            if (fileInputRef.current) fileInputRef.current.value = '';
          } finally {
            setIsScanning(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error("Failed to process file: ", err);
        alert("An error occurred while processing the file.");
        setSelectedFile(null);
        setFileBase64('');
        setFilePages(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsScanning(false);
      }
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileBase64('');
    setFilePages(1);
    setCustomPagesInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProceedToPayClick = () => {
    if (!selectedFile) {
      alert("Please upload a PDF file first!");
      return;
    }

    if (!user) {
      alert("Please log in to proceed with payment and place your order.");
      setLoginModalOpen(true);
      return;
    }

    if (deliveryOption === 'delivery') {
      if (deliveryLocation === 'other' && !deliveryAddress.trim()) {
        alert("Please enter a delivery address!");
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.length !== 10) {
        alert("Please enter a valid 10-digit phone number!");
        return;
      }
    }

    setUtrNumber('');
    setPaymentProofBase64('');
    setPaymentProofName('');
    // Generate a unique Order ID for this payment session
    const newOrderId = 'RGX-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setCurrentOrderId(newOrderId);
    setIsPaymentModalOpen(true);
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

    setIsScanning(true);
    setIsPaymentModalOpen(false);
    
    try {
      const bindingText = 
        bindingType === 'none' ? 'No Binding' : 
        bindingType === 'spiral' ? 'Spiral Binding' : 
        bindingType === 'tape' ? 'Tape Binding' : 'Thesis Binding';
        
      const deliveryPrice = deliveryOption === 'delivery' 
        ? (deliveryLocation === 'other' ? (deliverySpeed === 'standard' ? 50 : 30) : 0)
        : 0;
      
      let deliveryModeLabel = 'Store Pickup';
      if (deliveryOption === 'delivery') {
        if (deliveryLocation === 'other') {
          deliveryModeLabel = `Delivery (${deliverySpeed === 'standard' ? 'Standard' : 'Next Day'} - Address: ${deliveryAddress.trim()}, Phone: ${phoneNumber})`;
        } else {
          deliveryModeLabel = `Delivery (College: ${deliveryLocation}, Phone: ${phoneNumber})`;
        }
      }

      // Attempt Firebase Storage Upload with Graceful Fallback
      let fileUrl = '';
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../lib/firebase');
        const storageRef = ref(storage, `print_orders/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        fileUrl = await getDownloadURL(snapshot.ref);
        console.log("PDF uploaded to Firebase Storage successfully:", fileUrl);
      } catch (err) {
        console.warn("Firebase Storage upload failed. Falling back to Base64/IndexedDB:", err);
      }

      let saveBase64InFirestore = fileBase64;
      let isLocalIndexedDB = false;
      const orderIdPlaceholder = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (!fileUrl && selectedFile.size > 1 * 1024 * 1024) {
        isLocalIndexedDB = true;
        saveBase64InFirestore = ''; // Clear to bypass the 1MB Firestore limit
        try {
          await localDb.saveFile(`print_file_${orderIdPlaceholder}`, selectedFile);
          console.log("Large file saved in local IndexedDB:", `print_file_${orderIdPlaceholder}`);
        } catch (dbErr) {
          console.error("Failed to save file to IndexedDB:", dbErr);
        }
      }

      await addPrintOrder({
        localOrderId: orderIdPlaceholder,
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileUrl: fileUrl,
        fileBase64: saveBase64InFirestore,
        localIndexedDB: isLocalIndexedDB,
        pages: filePages,
        copies: copies,
        colorMode: colorMode === 'bw' ? 'Black & White' : colorMode === 'color' ? 'Color' : `Custom (Color pages: ${customPagesInput || 'None'})`,
        sides: printSides === 'single' ? 'Single Side' : 'Both Sides',
        lineGraphQty: 0,
        semiLogQty: 0,
        bindingType: bindingText,
        totalPrice: totalPrice,
        userEmail: user ? user.email : 'guest@rgonestop.com',
        customerName: user ? user.name : 'Guest User',
        deliveryMode: deliveryModeLabel,
        deliveryPrice: deliveryPrice,
        phoneNumber: phoneNumber,
        deliveryAddress: deliveryLocation === 'other' ? deliveryAddress : '',
        paymentStatus: 'Pending Verification',
        transactionId: utrNumber,
        paymentProof: paymentProofBase64
      });
      
      setIsAddedToCart(true);
      setSelectedFile(null);
      setFileBase64('');
      setFilePages(1);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to submit print order to database:", error);
      alert("Error submitting print job: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="xerox-page-main container">
        <div className="xerox-grid-container">
          
          {/* Left Column: Massive Upload Area or PDF Print Preview */}
          <div className="xerox-left-col">
            {isScanning ? (
              <div className="pdf-upload-zone is-scanning">
                <div className="scanning-container">
                  <div className="scanning-bar"></div>
                  <FileText size={48} className="scanning-icon animate-pulse text-primary" />
                  <p>Analyzing document pages...</p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="pdf-preview-container glass animate-scale-in">
                <button className="clear-file-btn" onClick={handleClearFile} title="Remove file">
                  <X size={18} />
                </button>
                <div className="canvas-wrapper">
                  <canvas ref={canvasRef} className="pdf-preview-canvas" />
                </div>
                <div className="file-info-banner">
                  <h4 className="file-name" title={selectedFile.name}>{selectedFile.name}</h4>
                  <p className="file-meta" style={{ margin: '0.25rem 0 0.5rem' }}>
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span className="divider-dot">•</span>
                    <span className="page-count-badge">{filePages} pages</span>
                  </p>
                  {selectedFile.size > 1 * 1024 * 1024 && (
                    <div style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '6px 10px', fontSize: '0.72rem', margin: '0.5rem 0', textAlign: 'left', lineHeight: '1.4' }}>
                      ⚠️ Note: This file is larger than 1MB. It will require a working Firebase Storage configuration on your live server to place successfully.
                    </div>
                  )}
                  <button className="change-file-btn" onClick={() => fileInputRef.current.click()} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    Change File
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="pdf-upload-zone"
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                />
                <div className="upload-placeholder">
                  <div className="upload-icon-circle">
                    <Upload size={32} />
                  </div>
                  <h3>Tap to upload PDF</h3>
                  <p className="upload-limit-hint">Supports files up to 50MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Customization Controls */}
          <div className="xerox-right-col">
            <div className="xerox-details-header">
              <h1>Master Xerox & Printing</h1>
            </div>

            {/* The pricing card is moved to a modal popup accessible via the floating edge button */}

            {/* Stepper Option: Number of Copies */}
            <div className="control-row" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="control-label">Number of Copies</span>
                {selectedFile && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.15rem', fontWeight: 500 }}>
                    File 1 ({filePages} {filePages === 1 ? 'Page' : 'Pages'})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="stepper-control">
                  <button 
                    className="step-btn" 
                    disabled={copies <= 1} 
                    onClick={() => setCopies(copies - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="step-value">{copies}</span>
                  <button 
                    className="step-btn" 
                    onClick={() => setCopies(copies + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {selectedFile && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.25rem', fontWeight: 600 }}>
                    ₹{totalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Segment Control: Color */}
            <div className="control-section">
              <span className="control-section-title">Color</span>
              <div className="segmented-selector">
                <button 
                  className={`segment-btn ${colorMode === 'bw' ? 'active' : ''}`}
                  onClick={() => setColorMode('bw')}
                >
                  Black & White
                </button>
                <button 
                  className={`segment-btn ${colorMode === 'color' ? 'active' : ''}`}
                  onClick={() => setColorMode('color')}
                >
                  Color
                </button>
                <button 
                  className={`segment-btn ${colorMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setColorMode('custom')}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Custom Color Pages Input (Only visible when colorMode is 'custom') */}
            {colorMode === 'custom' && (
              <div className="control-section custom-color-pages-section animate-fade-in" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="control-section-title">Custom Pages to be in Color</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>
                    Color count: {colorPagesList.length} pages
                  </span>
                </div>
                <input 
                  type="text" 
                  className="custom-pages-input" 
                  placeholder="eg: 1-3,7,9,11-14..." 
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(e.target.value)}
                />
              </div>
            )}

            {/* Segment Control: Sides */}
            <div className="control-section">
              <span className="control-section-title">Sides</span>
              <div className="segmented-selector two-columns">
                <button 
                  className={`segment-btn ${printSides === 'single' ? 'active' : ''}`}
                  onClick={() => setPrintSides('single')}
                >
                  Single Side
                </button>
                <button 
                  className={`segment-btn ${printSides === 'both' ? 'active' : ''}`}
                  onClick={() => setPrintSides('both')}
                >
                  Both Sides
                </button>
              </div>
            </div>

            {/* Binding Options */}
            <div className="control-section" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.25rem' }}>
              <div className="addon-row binding-selector" style={{ borderBottom: 'none', padding: '0' }}>
                <div className="addon-info">
                  <span className="control-section-title">Binding Type</span>
                </div>
                <div className="binding-select-wrapper">
                  <select 
                    className="binding-select" 
                    value={bindingType} 
                    onChange={(e) => setBindingType(e.target.value)}
                  >
                    <option value="none">No Binding</option>
                    <option value="spiral">Spiral Binding (₹30 / 100pg)</option>
                    <option value="tape">Tape Binding (₹30 / 100pg)</option>
                    <option value="thesis">Thesis Binding (₹200 flat)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Option Selector */}
            <div className="control-section delivery-mode-section">
              <span className="control-section-title">Delivery Mode</span>
              <div className="segmented-selector two-columns">
                <button 
                  className={`segment-btn ${deliveryOption === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryOption('pickup')}
                >
                  Store Pickup (Free)
                </button>
                <button 
                  className={`segment-btn ${deliveryOption === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryOption('delivery')}
                >
                  Delivery
                </button>
              </div>

              {/* Delivery College Dropdown Selector */}
              {deliveryOption === 'delivery' && (
                <div className="control-section location-selector-section animate-fade-in" style={{ marginTop: '0.8rem', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Delivery Location / College</span>
                  <div className="binding-select-wrapper" style={{ width: '100%' }}>
                    <select 
                      className="binding-select" 
                      value={deliveryLocation} 
                      onChange={(e) => {
                        setDeliveryLocation(e.target.value);
                        // Reset address/speed if college is selected
                        if (e.target.value !== 'other') {
                          setDeliverySpeed('nextday');
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="other">Other Address / Home Delivery</option>
                      <option value="Adikavi Nannaya University">Adikavi Nannaya University (Free Delivery)</option>
                      <option value="GGU (Giet)">GGU (Giet) College (Free Delivery)</option>
                      <option value="BVC Engineering College">BVC Engineering College (Free Delivery)</option>
                      <option value="Arts College">Government Arts College (Free Delivery)</option>
                      <option value="S.K.V.T.">S.K.V.T. College (Free Delivery)</option>
                      <option value="S.K.L.R.">S.K.L.R. College (Free Delivery)</option>
                      <option value="Rajamahendri College">Rajamahendri College (Free Delivery)</option>
                      <option value="Rajeev Gandhi">Rajeev Gandhi College (Free Delivery)</option>
                      <option value="Vikas Pharmaceutical College">Vikas Pharmaceutical College (Free Delivery)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Delivery Speed and Address Inputs (Only for 'other' address delivery) */}
              {deliveryOption === 'delivery' && deliveryLocation === 'other' && (
                <>
                  {/* Delivery Speed Selector */}
                  <div className="control-section speed-selector-section animate-fade-in" style={{ marginTop: '0.8rem', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Delivery Speed</span>
                    <div className="segmented-selector two-columns">
                      <button 
                        className={`segment-btn ${deliverySpeed === 'standard' ? 'active' : ''}`}
                        onClick={() => setDeliverySpeed('standard')}
                      >
                        Standard (₹50)
                      </button>
                      <button 
                        className={`segment-btn ${deliverySpeed === 'nextday' ? 'active' : ''}`}
                        onClick={() => setDeliverySpeed('nextday')}
                      >
                        Next Day (₹30)
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address Textarea */}
                  <div className="control-section address-section animate-fade-in" style={{ marginTop: '0.8rem', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Delivery Address</span>
                    <textarea 
                      className="custom-pages-input" 
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      placeholder="Enter your complete home address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Phone Number Input (Required for all home & college deliveries) */}
              {deliveryOption === 'delivery' && (
                <div className="control-section phone-section animate-fade-in" style={{ marginTop: '0.8rem', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Phone Number</span>
                  <input 
                    type="tel"
                    className="custom-pages-input"
                    placeholder="Enter 10-digit mobile number..."
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(val);
                    }}
                  />
                </div>
              )}

              <p className="delivery-hint-text">
                {deliveryOption === 'delivery' 
                  ? deliveryLocation === 'other'
                    ? deliverySpeed === 'standard'
                      ? `Standard delivery charges of ₹50 apply. ${deliveryDateText} 🚚.`
                      : `Next Day delivery charges of ₹30 apply. ${deliveryDateText} 🚚.`
                    : `Next Day Free Delivery to your college campus! ${deliveryDateText} 🎉.`
                  : "Pick up from our store as soon as your order is printed."}
              </p>
            </div>

            {/* Description Info Accordion */}
            <div className="document-info-accordion">
              <div className="accordion-summary" onClick={() => setShowMoreDetails(!showMoreDetails)}>
                <span>Next Day Delivery & Details</span>
                {showMoreDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              <div className={`accordion-details ${showMoreDetails ? 'expanded' : ''}`}>
                <p>
                  Get your documents printed professionally. We offer high-quality black & white or color printing on premium 70 GSM paper, ideal for academic files, study materials, college projects, thesis reports, and office documents.
                </p>
                <div className="printing-features-grid">
                  <div className="feature-pill">✓ Premium 70 GSM paper</div>
                  <div className="feature-pill">✓ Single/Both Sides support</div>
                  <div className="feature-pill">✓ Spiral, Tape, & Thesis Binding</div>
                  <div className="feature-pill">✓ Next Day Home Delivery</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Sticky Bottom Actions Bar (Matches mobile & desktop layout footer cleanly) */}
      <div className="sticky-checkout-bar glass">
        <div className="container sticky-bar-container">
          <div className="price-display-section">
            <span className="price-label">Estimated Total Price {deliveryOption === 'delivery' && '(Incl. Delivery)'}</span>
            <span className="price-amount">₹{totalPrice.toFixed(2)}</span>
          </div>

          <button 
            className={`btn btn-accent checkout-cart-btn ${isAddedToCart ? 'success' : ''}`}
            disabled={!selectedFile || isScanning}
            onClick={handleProceedToPayClick}
          >
            {isAddedToCart ? (
              <>
                <Check size={18} />
                <span>Order Submitted!</span>
              </>
            ) : (
              <>
                <CreditCard size={18} />
                <span>Proceed to Pay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Edge Button for Price Details */}
      <button className="rates-edge-button" onClick={() => setIsRatesModalOpen(true)} aria-label="View Rates">
        <Tag size={16} />
        <span className="rates-edge-button-text">View Rates</span>
      </button>

      {/* Rates Popup Modal */}
      {isRatesModalOpen && (
        <div className="rates-modal-overlay" onClick={() => setIsRatesModalOpen(false)}>
          <div className="rates-modal-content glass animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="rates-modal-close-btn" onClick={() => setIsRatesModalOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            
            <div className="pricing-card-header">
              <Tag size={18} className="pricing-header-icon" />
              <h3>Official Client Rates</h3>
            </div>
            
            <div className="pricing-rates-grid">
              <div className="rate-item">
                <span className="rate-label-text">Normal (B&W) Single Side</span>
                <span className="rate-price-value">₹1.60<span className="rate-unit">/pg</span></span>
              </div>
              <div className="rate-item">
                <span className="rate-label-text">Normal (B&W) Both Sides</span>
                <span className="rate-price-value">₹1.80<span className="rate-unit">/sheet</span></span>
              </div>
              <div className="rate-item">
                <span className="rate-label-text">Color Xerox</span>
                <span className="rate-price-value">₹10.00<span className="rate-unit">/pg</span></span>
              </div>
              <div className="rate-item">
                <span className="rate-label-text">Spiral / Tape Binding</span>
                <span className="rate-price-value">₹30<span className="rate-unit">/100pg</span></span>
              </div>
              <div className="rate-item full-width">
                <span className="rate-label-text">Thesis Binding</span>
                <span className="rate-price-value">₹200<span className="rate-unit"> flat</span></span>
              </div>
            </div>

            <div className="bulk-order-banner">
              <div className="bulk-info">
                <span className="bulk-title">Bulk Orders & Class Projects</span>
                <p className="bulk-text">Contact us directly for special coupons and group discounts!</p>
              </div>
              <a 
                href="https://wa.me/916301919669?text=Hello%20RG%20OneStop,%20I'm%20inquiring%20about%20special%20coupons%20for%20bulk%20xerox%20printing." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="whatsapp-link-btn"
              >
                <MessageSquare size={14} />
                <span>Get Coupon</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {isPaymentModalOpen && (
        <div 
          className="rates-modal-overlay" 
          onClick={() => setIsPaymentModalOpen(false)}
          style={{ zIndex: 11000 }}
        >
          <div 
            className="rates-modal-content glass animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button 
              className="rates-modal-close-btn" 
              onClick={() => setIsPaymentModalOpen(false)} 
              aria-label="Close payment modal"
              style={{ top: '0.75rem', right: '0.75rem' }}
            >
              <X size={18} />
            </button>
            
            <div className="pricing-card-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <CreditCard size={20} className="pricing-header-icon" style={{ color: '#2faf9e' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Scan to Pay</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', textAlign: 'center' }}>

              {/* Dynamic QR Code */}
              <div style={{ 
                background: 'white', padding: '8px', borderRadius: '14px', 
                border: '2px solid rgba(47, 175, 158, 0.2)', boxShadow: '0 4px 16px rgba(47,175,158,0.1)',
                width: '140px', height: '140px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative'
              }}>
                {paymentConfig && paymentConfig.upiId ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName || 'Payee')}&am=${totalPrice}&tn=${encodeURIComponent('Order:' + currentOrderId)}&tr=${currentOrderId}`)}`}
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
                    📷<br/>QR not configured.<br/>Please copy UPI ID below.
                  </div>
                )}
              </div>

              {/* Amount & Payee Info with Copy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
                {/* Amount row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e293b' }}>₹{totalPrice}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(totalPrice), 'amount')}
                    style={{ fontSize: '0.68rem', background: copiedField === 'amount' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'amount' ? '#15803d' : '#475569', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {copiedField === 'amount' ? 'Copied ✓' : 'Copy Amount'}
                  </button>
                </div>

                {/* UPI ID row */}
                {paymentConfig && paymentConfig.upiId && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{paymentConfig.upiId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentConfig.upiId, 'upi')}
                      style={{ fontSize: '0.65rem', background: copiedField === 'upi' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'upi' ? '#15803d' : '#475569', border: 'none', borderRadius: '5px', padding: '2px 7px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
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
                    style={{ fontSize: '0.65rem', background: copiedField === 'orderid' ? '#dcfce7' : '#f1f5f9', color: copiedField === 'orderid' ? '#15803d' : '#475569', border: 'none', borderRadius: '5px', padding: '2px 7px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {copiedField === 'orderid' ? 'Copied ✓' : 'Copy ID'}
                  </button>
                </div>
              </div>

              {/* Mobile UPI Deep Link Button */}
              {paymentConfig && paymentConfig.upiId && (
                <a
                  href={`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.payeeName || 'Payee')}&am=${totalPrice}&tn=${encodeURIComponent('Order:' + currentOrderId)}&tr=${currentOrderId}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    width: '100%', padding: '0.55rem', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1da462 0%, #0ea05a 100%)',
                    color: 'white', fontWeight: 700, fontSize: '0.82rem',
                    textDecoration: 'none', boxShadow: '0 3px 10px rgba(13,152,86,0.25)'
                  }}
                >
                  📱 Pay via UPI App (GPay / PhonePe / Paytm)
                </a>
              )}

              {/* How to Pay */}
              <div style={{ 
                background: 'rgba(47, 175, 158, 0.05)', border: '1px solid rgba(47, 175, 158, 0.15)',
                borderRadius: '10px', padding: '8px 10px', fontSize: '0.72rem', color: '#0f766e',
                lineHeight: '1.4', textAlign: 'left', width: '100%'
              }}>
                <strong>How to Pay:</strong>
                <ol style={{ margin: '3px 0 0 14px', padding: 0 }}>
                  <li>Scan the QR code <strong>OR</strong> tap the green button (mobile).</li>
                  <li>Pay exactly <strong>₹{totalPrice}</strong> — amount is pre-filled.</li>
                  <li>Add <strong>{currentOrderId}</strong> in the payment note (optional).</li>
                  <li>Take a <strong>screenshot</strong> of payment success screen.</li>
                  <li>Enter UTR number and upload screenshot below.</li>
                </ol>
              </div>

              {/* Fraud Warning */}
              <div style={{ 
                background: '#fff1f2', border: '1.5px solid #fca5a5',
                borderRadius: '10px', padding: '8px 12px', fontSize: '0.72rem', color: '#991b1b',
                lineHeight: '1.45', textAlign: 'left', width: '100%'
              }}>
                ⚠️ <strong>IMPORTANT WARNING:</strong> Submit only after completing the UPI transaction. Entering a fake UTR number or uploading a forged screenshot will result in <strong>immediate order cancellation</strong> and <strong>permanent account block</strong> without any refund.
              </div>

              <form 
                onSubmit={handlePaymentSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    Transaction UTR / Ref No *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter 6–12 digit UTR / Ref No"
                    className="custom-pages-input"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>
                    📸 Upload Payment Screenshot * (REQUIRED)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="change-file-btn"
                      onClick={() => document.getElementById('payment-proof-input').click()}
                      style={{ 
                        padding: '4px 10px', fontSize: '0.75rem', flexShrink: 0,
                        background: paymentProofBase64 ? '#dcfce7' : '#fff1f2',
                        border: `1px solid ${paymentProofBase64 ? '#86efac' : '#fca5a5'}`,
                        color: paymentProofBase64 ? '#15803d' : '#991b1b',
                        borderRadius: '7px', cursor: 'pointer', fontWeight: 700
                      }}
                    >
                      {paymentProofBase64 ? '✓ Screenshot Uploaded' : 'Choose Screenshot'}
                    </button>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                      {paymentProofName || 'No file chosen'}
                    </span>
                    <input 
                      type="file" 
                      id="payment-proof-input"
                      accept="image/*"
                      onChange={handlePaymentScreenshotUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {paymentProofBase64 && (
                    <div style={{ marginTop: '0.3rem', border: '2px solid #86efac', borderRadius: '8px', padding: '3px', maxWidth: '70px' }}>
                      <img src={paymentProofBase64} alt="Screenshot preview" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-accent" 
                  style={{ 
                    width: '100%', marginTop: '0.1rem', padding: '0.65rem', 
                    background: paymentProofBase64 ? '#2faf9e' : '#94a3b8',
                    color: 'white', display: 'flex', justifyContent: 'center', 
                    alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                    border: 'none', borderRadius: '10px', cursor: paymentProofBase64 ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Check size={16} />
                  <span>Submit Order & Payment</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <HMMobileNav />
    </div>
  );
};

export default MasterXeroxPage;
