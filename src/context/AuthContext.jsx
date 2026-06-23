/* eslint-disable react-refresh/only-export-components */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

const AuthContext = createContext();

const INITIAL_PRODUCTS = [];
const INITIAL_BUSINESSES = [];
const INITIAL_BANNERS = [];
const INITIAL_CATEGORIES = [];
const INITIAL_SERVICE_CATEGORIES = [];
const INITIAL_PRINT_ORDERS = [];
const INITIAL_BRANDING_PARTNERS = [];


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('rg_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      }
    }
    return null;
  });
  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [printOrders, setPrintOrders] = useState([]);
  const [hashtagOrders, setHashtagOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({ qrCode: '', upiId: '', payeeName: '' });
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isAddBusinessModalOpen, setAddBusinessModalOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState("Hyderabad");
  const [logo, setLogo] = useState('/assets/logo.png');
  const [brandingPartners, setBrandingPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('rg_detected_city');
      if (savedCity) {
        const timer = setTimeout(() => {
          setCurrentCity(savedCity);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const changeCity = (city) => {
    setCurrentCity(city);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rg_detected_city', city);
    }
  };

  // DB seeding removed — data managed entirely via Firestore in real-time

  // 2. Real-time Listeners for Syncing Firestore collections
  useEffect(() => {
    let loadedCount = 0;
    const TOTAL_LISTENERS = 8; // products, businesses, banners, categories, serviceCategories, printOrders, hashtagOrders, logo
    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_LISTENERS) setIsLoading(false);
    };

    // Sync Products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
      markLoaded();
    }, (error) => { console.error("Error listening to products collection:", error); markLoaded(); });

    // Sync Businesses
    const unsubscribeBusinesses = onSnapshot(collection(db, "businesses"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBusinesses(list);
      markLoaded();
    }, (error) => { console.error("Error listening to businesses collection:", error); markLoaded(); });

    // Sync Banners
    const unsubscribeBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(list);
      markLoaded();
    }, (error) => { console.error("Error listening to banners collection:", error); markLoaded(); });

    // Sync Categories
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
      markLoaded();
    }, (error) => { console.error("Error listening to categories collection:", error); markLoaded(); });

    // Sync Service Categories
    const unsubscribeServiceCategories = onSnapshot(collection(db, "service_categories"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      setServiceCategories(list);
      markLoaded();
    }, (error) => { console.error("Error listening to service_categories collection:", error); markLoaded(); });    // Sync Print Orders
    const unsubscribePrintOrders = onSnapshot(collection(db, "print_orders"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setPrintOrders(list);
      markLoaded();
    }, (error) => { console.error("Error listening to print_orders collection:", error); markLoaded(); });

    // Sync Hashtag Orders
    const unsubscribeHashtagOrders = onSnapshot(collection(db, "hashtag_orders"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setHashtagOrders(list);
      markLoaded();
    }, (error) => { console.error("Error listening to hashtag_orders collection:", error); markLoaded(); });

    // Sync Logo Config
    const unsubscribeLogo = onSnapshot(doc(db, "settings", "logoConfig"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().logo) {
        setLogo(docSnap.data().logo);
      } else {
        setLogo('/assets/logo.png');
      }
      markLoaded();
    }, (error) => { console.error("Error listening to settings/logoConfig:", error); markLoaded(); });

    // Sync Branding Partners (not counted in TOTAL_LISTENERS — bonus load)
    const unsubscribeBrandingPartners = onSnapshot(collection(db, "branding_partners"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      setBrandingPartners(list);
    }, (error) => console.error("Error listening to branding_partners collection:", error));

    // Sync Notifications (bonus load)
    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setNotifications(list);
    }, (error) => console.error("Error listening to notifications collection:", error));

    // Sync Payment Config (bonus load)
    const unsubscribePaymentConfig = onSnapshot(doc(db, "settings", "paymentConfig"), (docSnap) => {
      if (docSnap.exists()) {
        setPaymentConfig(docSnap.data());
      } else {
        setPaymentConfig({ qrCode: '', upiId: '', payeeName: '' });
      }
    }, (error) => console.error("Error listening to settings/paymentConfig:", error));

    return () => {
      unsubscribeProducts();
      unsubscribeBusinesses();
      unsubscribeBanners();
      unsubscribeCategories();
      unsubscribeServiceCategories();
      unsubscribePrintOrders();
      unsubscribeHashtagOrders();
      unsubscribeLogo();
      unsubscribeBrandingPartners();
      unsubscribeNotifications();
      unsubscribePaymentConfig();
    };
  }, []);



  // 4. Authentication logic supporting BOTH Simulated Accounts and Real Firebase Google Sign-In
  const loginWithGoogle = async (userData = null) => {
    if (userData) {
      // Used by Mock user chooser in LoginModal
      setUser(userData);
      localStorage.setItem('rg_user', JSON.stringify(userData));
      setLoginModalOpen(false);
      return userData;
    } else {
      // Used for Real Firebase Google Authentication popup
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const uid = result.user.uid;

        // Base user profile
        const baseProfile = {
          uid,
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${result.user.displayName}`,
          createdAt: new Date().toISOString(),
        };

        // Write to Firestore (merge: true keeps existing role/fields intact)
        try {
          await setDoc(doc(db, "users", uid), baseProfile, { merge: true });
          console.log("✅ User profile synced to Firestore:", result.user.email);
        } catch (firestoreError) {
          console.error("⚠️ Firestore users write failed (check rules):", firestoreError);
        }

        // Fetch full user document (includes role set manually in Firestore)
        let role = null;
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            role = userSnap.data().role || null;
            console.log("🔑 Fetched role from Firestore:", role);
          } else {
            console.warn("⚠️ User document not found in Firestore for uid:", uid);
          }
        } catch (fetchError) {
          console.error("⚠️ Failed to fetch user role from Firestore:", fetchError);
        }

        const realUser = { ...baseProfile, role };
        console.log("👤 Final user object:", realUser);

        setUser(realUser);
        localStorage.setItem('rg_user', JSON.stringify(realUser));
        setLoginModalOpen(false);
        return realUser;
      } catch (error) {
        console.error("Real Google Sign-In failed:", error);
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Firebase SignOut error:", e);
    }
    setUser(null);
    localStorage.removeItem('rg_user');
  };

  // --- Businesses CRUD Operations ---
  const addBusiness = async (businessData) => {
    try {
      const newBusiness = {
        ...businessData,
        createdAt: new Date().toISOString(),
        verified: false,
        ownerEmail: user ? user.email : 'guest'
      };
      const docRef = await addDoc(collection(db, "businesses"), newBusiness);
      return { id: docRef.id, ...newBusiness };
    } catch (error) {
      console.error("Error adding business to Firestore:", error);
      throw error;
    }
  };

  const updateBusiness = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "businesses", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating business in Firestore:", error);
      throw error;
    }
  };

  const deleteBusiness = async (id) => {
    try {
      await deleteDoc(doc(db, "businesses", id));
    } catch (error) {
      console.error("Error deleting business from Firestore:", error);
      throw error;
    }
  };

  // --- Products CRUD Operations ---
  const addProduct = async (productData) => {
    try {
      const newProduct = {
        ...productData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "products"), newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      throw error;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating product in Firestore:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      console.error("Error deleting product from Firestore:", error);
      throw error;
    }
  };

  // --- Banners CRUD Operations ---
  const addBanner = async (bannerData) => {
    try {
      const newBanner = {
        ...bannerData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "banners"), newBanner);
      return { id: docRef.id, ...newBanner };
    } catch (error) {
      console.error("Error adding banner to Firestore:", error);
      throw error;
    }
  };

  const updateBanner = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "banners", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating banner in Firestore:", error);
      throw error;
    }
  };

  const deleteBanner = async (id) => {
    try {
      await deleteDoc(doc(db, "banners", id));
    } catch (error) {
      console.error("Error deleting banner from Firestore:", error);
      throw error;
    }
  };

  // --- Categories CRUD Operations ---
  const addCategory = async (categoryData) => {
    try {
      const newCategory = {
        ...categoryData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "categories"), newCategory);
      return { id: docRef.id, ...newCategory };
    } catch (error) {
      console.error("Error adding category to Firestore:", error);
      throw error;
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "categories", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating category in Firestore:", error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      console.error("Error deleting category from Firestore:", error);
      throw error;
    }
  };

  // --- Service Categories CRUD Operations ---
  const addServiceCategory = async (catData) => {
    try {
      const newCat = {
        ...catData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "service_categories"), newCat);
      return { id: docRef.id, ...newCat };
    } catch (error) {
      console.error("Error adding service category to Firestore:", error);
      throw error;
    }
  };

  const updateServiceCategory = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "service_categories", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating service category in Firestore:", error);
      throw error;
    }
  };

  const deleteServiceCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "service_categories", id));
    } catch (error) {
      console.error("Error deleting service category from Firestore:", error);
      throw error;
    }
  };

  const addPrintOrder = async (orderData) => {
    try {
      const newOrder = {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'Pending'
      };
      const docRef = await addDoc(collection(db, "print_orders"), newOrder);
      return { id: docRef.id, ...newOrder };
    } catch (error) {
      console.error("Error adding print order to Firestore:", error);
      throw error;
    }
  };

  const updatePrintOrderStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, "print_orders", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating print order status in Firestore:", error);
      throw error;
    }
  };

  const deletePrintOrder = async (id) => {
    try {
      await deleteDoc(doc(db, "print_orders", id));
    } catch (error) {
      console.error("Error deleting print order from Firestore:", error);
      throw error;
    }
  };

  const addHashtagOrder = async (orderData) => {
    try {
      const newOrder = {
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'Pending'
      };
      const docRef = await addDoc(collection(db, "hashtag_orders"), newOrder);
      return { id: docRef.id, ...newOrder };
    } catch (error) {
      console.error("Error adding hashtag order to Firestore:", error);
      throw error;
    }
  };

  const updateHashtagOrderStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, "hashtag_orders", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating hashtag order status in Firestore:", error);
      throw error;
    }
  };

  const deleteHashtagOrder = async (id) => {
    try {
      await deleteDoc(doc(db, "hashtag_orders", id));
    } catch (error) {
      console.error("Error deleting hashtag order from Firestore:", error);
      throw error;
    }
  };

  const updateLogo = async (logoData) => {
    try {
      await setDoc(doc(db, "settings", "logoConfig"), {
        logo: logoData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating logo in settings/logoConfig:", error);
      throw error;
    }
  };

  const addBrandingPartner = async (partnerData) => {
    try {
      const newPartner = {
        ...partnerData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "branding_partners"), newPartner);
      return { id: docRef.id, ...newPartner };
    } catch (error) {
      console.error("Error adding branding partner to Firestore:", error);
      throw error;
    }
  };

  const updateBrandingPartner = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "branding_partners", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating branding partner in Firestore:", error);
      throw error;
    }
  };

  const deleteBrandingPartner = async (id) => {
    try {
      await deleteDoc(doc(db, "branding_partners", id));
    } catch (error) {
      console.error("Error deleting branding partner from Firestore:", error);
      throw error;
    }
  };

  // --- Notifications operations ---
  const addNotification = async (notificationData) => {
    try {
      const newNotification = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false
      };
      const docRef = await addDoc(collection(db, "notifications"), newNotification);
      return { id: docRef.id, ...newNotification };
    } catch (error) {
      console.error("Error adding notification to Firestore:", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  // --- Payment Config operations ---
  const updatePaymentConfig = async (config) => {
    try {
      await setDoc(doc(db, "settings", "paymentConfig"), config, { merge: true });
    } catch (error) {
      console.error("Error updating payment config in settings/paymentConfig:", error);
      throw error;
    }
  };

  // --- Generic Order Updates ---
  const updatePrintOrder = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "print_orders", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating print order in Firestore:", error);
      throw error;
    }
  };

  const updateHashtagOrder = async (id, updatedFields) => {
    try {
      const docRef = doc(db, "hashtag_orders", id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error("Error updating hashtag order in Firestore:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      businesses,
      products,
      banners,
      categories,
      serviceCategories,
      isLoading,
      loginWithGoogle,
      logout,
      addBusiness,
      updateBusiness,
      deleteBusiness,
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
      isLoginModalOpen,
      setLoginModalOpen,
      isAddBusinessModalOpen,
      setAddBusinessModalOpen,
      currentCity,
      changeCity,
      printOrders,
      addPrintOrder,
      updatePrintOrderStatus,
      updatePrintOrder,
      deletePrintOrder,
      hashtagOrders,
      addHashtagOrder,
      updateHashtagOrderStatus,
      updateHashtagOrder,
      deleteHashtagOrder,
      logo,
      updateLogo,
      brandingPartners,
      addBrandingPartner,
      updateBrandingPartner,
      deleteBrandingPartner,
      notifications,
      addNotification,
      markNotificationAsRead,
      deleteNotification,
      paymentConfig,
      updatePaymentConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
