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
  getDocs, 
  setDoc 
} from "firebase/firestore";

const AuthContext = createContext();

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: 'Acrylic Photo Frame',
    price: '₹499',
    originalPrice: '₹799',
    image: '/products/acrylic_frame.png',
    category: 'Hashtag Memories & Gifts'
  },
  {
    id: "p2",
    name: 'Photo Chocolate Box',
    price: '₹599',
    originalPrice: '₹899',
    image: '/products/chocolate.png',
    category: 'Hashtag Memories & Gifts'
  },
  {
    id: "p3",
    name: 'Polaroid Photo Set',
    price: '₹299',
    originalPrice: '₹499',
    image: '/products/polaroid.png',
    category: 'Hashtag Memories & Gifts'
  },
  {
    id: "p4",
    name: 'Custom Keychain',
    price: '₹199',
    originalPrice: '₹299',
    image: '/products/keychain.png',
    category: 'Hashtag Memories & Gifts'
  }
];

const INITIAL_BUSINESSES = [
  {
    id: "b1",
    businessName: "RG Xerox & Digital Printers",
    category: "Master Xerox & Printing",
    description: "Premium high-speed black & white xerox, multi-color digital prints, project bindings, and academic material printing at student-friendly rates.",
    city: "Hyderabad",
    address: "Shop 4, Campus Arcade, opposite PG Gate, Hyderabad",
    contactNumber: "9123456789",
    whatsappNumber: "9123456789",
    timings: "9:00 AM - 9:30 PM",
    verified: true,
    logo: null,
    photos: []
  },
  {
    id: "b2",
    businessName: "Shine Premium Gift Palace",
    category: "Hashtag Memories & Gifts",
    description: "Custom photo frames, acrylic stands, personalized magic mugs, design albums, and customized premium anniversary chocolate gifts.",
    city: "Visakhapatnam",
    address: "Road No. 2, Beach View Complex, Vizag",
    contactNumber: "8885551234",
    whatsappNumber: "8885551234",
    timings: "10:00 AM - 9:00 PM",
    verified: true,
    logo: null,
    photos: []
  }
];

const INITIAL_BANNERS = [
  {
    id: "1",
    title: 'Personalized Gifts',
    subtitle: 'Premium photo products.',
    cta: 'Shop Now',
    background: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "2",
    title: 'Photo Chocolates',
    subtitle: 'Delicious handcrafted chocolates.',
    cta: 'Order Now',
    background: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "3",
    title: 'Magnets & Badges',
    subtitle: 'High-quality printing.',
    cta: 'Shop Designs',
    background: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "4",
    title: 'Custom Mugs',
    subtitle: 'Start your day right.',
    cta: 'Create Mug',
    background: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "5",
    title: 'Printed T-Shirts',
    subtitle: 'Wear your memories.',
    cta: 'Customize Tees',
    background: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "6",
    title: 'Elegant Photo Frames',
    subtitle: 'Capture the moment forever.',
    cta: 'Shop Frames',
    background: 'https://images.unsplash.com/photo-1577083165213-9f5e135aa6d5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "7",
    title: 'Printed Tote Bags',
    subtitle: 'Eco-friendly and stylish.',
    cta: 'Design Yours',
    background: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "8",
    title: 'Personalized Notebooks',
    subtitle: 'Pen down your thoughts.',
    cta: 'Explore Notes',
    background: 'https://images.unsplash.com/photo-1531346878377-a541e4a113fb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: "9",
    title: 'Custom Keychains',
    subtitle: 'Carry loved ones everywhere.',
    cta: 'Shop Accessories',
    background: 'https://images.unsplash.com/photo-1611080340332-9cb77353f47e?q=80&w=800&auto=format&fit=crop'
  }
];

const INITIAL_CATEGORIES = [
  { id: "1", name: 'Master Xerox', image: '/categories/xerox.png', color: '#1F3A8A', path: '/' },
  { id: "2", name: 'Hashtag Memories', image: '/categories/hashtag-memories.png', color: '#2FAF9E', path: '/hashtag-memories' }
];

const INITIAL_SERVICE_CATEGORIES = [
  { id: "s1", title: 'Hospitals & Clinics', emoji: '🏥' },
  { id: "s2", title: 'Govt & Emergency', emoji: '🏛️' },
  { id: "s3", title: 'Education', emoji: '📚' },
  { id: "s4", title: 'Coaching Centers', emoji: '🏫' },
  { id: "s5", title: 'Shops & Stores', emoji: '🛍️' },
  { id: "s6", title: 'Restaurants', emoji: '🍽️' },
  { id: "s7", title: 'Rjy Famous', emoji: '⭐' },
  { id: "s8", title: 'Hotels', emoji: '🏡' },
  { id: "s9", title: 'Entertainment', emoji: '🎬' },
  { id: "s10", title: 'Function Halls', emoji: '🏢' },
  { id: "s11", title: 'Studios', emoji: '📸' },
  { id: "s12", title: 'Public Transport Hub', emoji: '🚂' }
];

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
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isAddBusinessModalOpen, setAddBusinessModalOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState("Hyderabad");

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

  // Helper function to seed initial data if collections are empty in Firestore
  const seedCollectionIfEmpty = async (collectionName, initialData) => {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log(`[Firebase] Seeding empty collection: ${collectionName}`);
        for (const item of initialData) {
          const { id, ...itemData } = item;
          // Set with original id to maintain consistency
          await setDoc(doc(db, collectionName, id), {
            ...itemData,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error(`Failed to seed collection "${collectionName}":`, err);
    }
  };

  // 1. First-time DB initialization (Seeding)
  useEffect(() => {
    const initDatabase = async () => {
      await seedCollectionIfEmpty("products", INITIAL_PRODUCTS);
      await seedCollectionIfEmpty("businesses", INITIAL_BUSINESSES);
      await seedCollectionIfEmpty("banners", INITIAL_BANNERS);
      await seedCollectionIfEmpty("categories", INITIAL_CATEGORIES);
      await seedCollectionIfEmpty("service_categories", INITIAL_SERVICE_CATEGORIES);
    };
    initDatabase();
  }, []);

  // 2. Real-time Listeners for Syncing Firestore collections
  useEffect(() => {
    // Sync Products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    }, (error) => console.error("Error listening to products collection:", error));

    // Sync Businesses
    const unsubscribeBusinesses = onSnapshot(collection(db, "businesses"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBusinesses(list);
    }, (error) => console.error("Error listening to businesses collection:", error));

    // Sync Banners
    const unsubscribeBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(list);
    }, (error) => console.error("Error listening to banners collection:", error));

    // Sync Categories
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    }, (error) => console.error("Error listening to categories collection:", error));

    // Sync Service Categories
    const unsubscribeServiceCategories = onSnapshot(collection(db, "service_categories"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort to maintain layout consistency if needed
      list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      setServiceCategories(list);
    }, (error) => console.error("Error listening to service_categories collection:", error));

    return () => {
      unsubscribeProducts();
      unsubscribeBusinesses();
      unsubscribeBanners();
      unsubscribeCategories();
      unsubscribeServiceCategories();
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
        const realUser = {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${result.user.displayName}`,
        };
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

  return (
    <AuthContext.Provider value={{
      user,
      businesses,
      products,
      banners,
      categories,
      serviceCategories,
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
      changeCity
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
