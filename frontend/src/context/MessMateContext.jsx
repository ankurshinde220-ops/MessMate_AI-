"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { MOCK_MESSES } from "@/data/mockData";
import { getBrowserCurrentPosition, GOOGLE_MAPS_API_KEY } from "@/lib/location";

const MessMateContext = createContext();

export function MessMateProvider({ children }) {
  // Favorites State with LocalStorage persistence
  const [favorites, setFavorites] = useState([]);
  // Comparison Tray (up to 3 messes)
  const [comparisonList, setComparisonList] = useState(["mess-1", "mess-2"]);
  // User Location State
  const [userLocation, setUserLocation] = useState({
    name: "FC Road, Shivajinagar (Near Fergusson / COEP)",
    lat: 18.5236,
    lng: 73.8415,
    isCustom: false
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  // Authenticated Student State
  const [currentUser, setCurrentUser] = useState(null);
  // Reviews Store (mock + dynamically submitted reviews)
  const [allReviews, setAllReviews] = useState(() => {
    return MOCK_MESSES.flatMap(m => m.featured_reviews.map(r => ({ ...r, mess_id: m.id, mess_name: m.name })));
  });
  // Active Global Filters
  const [filters, setFilters] = useState({
    search: "",
    diet: "all", // veg, both, jain
    budget: 5000,
    mealPlan: "monthly", // monthly, 15-day, per-meal
    minRating: 0,
    maxDistance: 10,
    sortBy: "recommended" // recommended, price-low, rating-high, distance-near
  });

  // Toast Notification System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load favorites from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("messmate_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites(["mess-1", "mess-3"]); // default initial bookmarks
      }

      const savedUser = localStorage.getItem("messmate_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Storage access notice:", e);
    }
  }, []);

  // Save favorites whenever changed
  const toggleFavorite = (messId) => {
    setFavorites(prev => {
      let updated;
      const mess = MOCK_MESSES.find(m => m.id === messId);
      const messName = mess ? mess.name : "Mess";

      if (prev.includes(messId)) {
        updated = prev.filter(id => id !== messId);
        showToast(`Removed "${messName}" from your saved favorites`, "info");
      } else {
        updated = [...prev, messId];
        showToast(`Saved "${messName}" to your favorites!`, "success");
      }
      try {
        localStorage.setItem("messmate_favorites", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isFavorite = (messId) => favorites.includes(messId);

  // Toggle Mess in Comparison Tray
  const toggleCompare = (messId) => {
    const mess = MOCK_MESSES.find(m => m.id === messId);
    const messName = mess ? mess.name : "Mess";

    setComparisonList(prev => {
      if (prev.includes(messId)) {
        const next = prev.filter(id => id !== messId);
        showToast(`Removed "${messName}" from comparison`, "info");
        return next;
      }
      if (prev.length >= 3) {
        showToast("You can compare up to 3 messes at a time. Remove one first.", "warning");
        return prev;
      }
      showToast(`Added "${messName}" to comparison tray!`, "success");
      return [...prev, messId];
    });
  };

  const clearCompare = () => {
    setComparisonList([]);
    showToast("Cleared comparison list", "info");
  };

  // Submit Student Review
  const addStudentReview = (reviewData) => {
    const mess = MOCK_MESSES.find(m => m.id === reviewData.mess_id);
    const newEntry = {
      id: `user-rev-${Date.now()}`,
      author_name: reviewData.author_name || currentUser?.displayName || "Student Eater",
      college: reviewData.college || "Pune University Affiliate",
      rating: Number(reviewData.rating) || 5.0,
      hygiene_rating: Number(reviewData.hygiene_rating) || 5.0,
      comment: reviewData.comment,
      date: "Just now",
      avatar: currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop",
      mess_id: reviewData.mess_id,
      mess_name: mess ? mess.name : "Student Mess"
    };

    setAllReviews(prev => [newEntry, ...prev]);
    showToast("Your review has been verified and posted!", "success");
    return newEntry;
  };

  // Authentication Helpers
  const loginStudent = (userData = {}) => {
    const studentUser = {
      role: "student",
      displayName: userData.displayName || userData.name || "Student Eater",
      email: userData.email || "student@campus.edu",
      college: userData.college || "Pune University / COEP",
      dietPreference: userData.dietPreference || "veg",
      photoURL: userData.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop",
      ...userData
    };
    setCurrentUser(studentUser);
    try {
      localStorage.setItem("messmate_user", JSON.stringify(studentUser));
    } catch (e) {}
    showToast(`Welcome back, ${studentUser.displayName}! (Student Account)`, "success");
    return studentUser;
  };

  const loginMess = (messData = {}) => {
    const messUser = {
      role: "mess",
      messId: messData.messId || messData.id || "mess-1",
      messName: messData.messName || messData.name || "Annapurna Pure Veg Mess",
      displayName: messData.ownerName || messData.messName || "Mess Manager",
      email: messData.email || "partner@messmate.ai",
      phone: messData.phone || "+91 98230 11223",
      area: messData.area || "Shivajinagar, Pune",
      dietType: messData.dietType || "veg",
      photoURL: messData.photoURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&fit=crop",
      ...messData
    };
    setCurrentUser(messUser);
    try {
      localStorage.setItem("messmate_user", JSON.stringify(messUser));
    } catch (e) {}
    showToast(`Welcome back, ${messUser.messName}! (Mess Partner Account)`, "success");
    return messUser;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("messmate_user");
    } catch (e) {}
    showToast("Signed out successfully", "info");
  };

  const logoutStudent = logout;

  // Live GPS Location Detection
  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    showToast("Detecting your location via GPS...", "info");
    try {
      const pos = await getBrowserCurrentPosition();
      const detectedLoc = {
        name: `Current Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`,
        lat: pos.lat,
        lng: pos.lng,
        isCustom: true,
        isGps: true,
      };
      setUserLocation(detectedLoc);
      showToast("📍 Live location updated successfully!", "success");
      return detectedLoc;
    } catch (err) {
      console.warn("Location detection failed:", err);
      showToast("Could not access live GPS. Using Pune FC Road campus.", "warning");
      return userLocation;
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <MessMateContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        comparisonList,
        toggleCompare,
        clearCompare,
        userLocation,
        setUserLocation,
        detectUserLocation,
        isDetectingLocation,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        currentUser,
        loginStudent,
        loginMess,
        logout,
        logoutStudent,
        allReviews,
        addStudentReview,
        filters,
        setFilters,
        showToast
      }}
    >
      {children}

      {/* Global Real Feedback Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-bounce-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-900/90 text-white border-emerald-500/40 shadow-emerald-950/20" :
            toast.type === "warning"
              ? "bg-amber-900/90 text-white border-amber-500/40 shadow-amber-950/20"
              : "bg-navy-900/90 text-white border-navy-700 shadow-navy-950/20"
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </MessMateContext.Provider>
  );
}

export function useMessMate() {
  const context = useContext(MessMateContext);
  if (!context) {
    throw new Error("useMessMate must be used within a MessMateProvider");
  }
  return context;
}
