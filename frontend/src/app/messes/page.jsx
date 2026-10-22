"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useMessMate } from "@/context/MessMateContext";
import { CAMPUS_LOCATIONS } from "@/data/mockData";
import { calculateDistanceKm, getGoogleMapsDirectionsUrl } from "@/lib/location";
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  Sparkles, 
  Heart, 
  Check, 
  Compass, 
  RefreshCw,
  Navigation,
  Car,
  CheckCircle2,
  Loader2
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const MessMap = dynamic(() => import("@/components/map/MessMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200">
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" />
        <span>Loading Location Dashboard Map...</span>
      </div>
    </div>
  )
});

function MessesContent() {
  const { 
    userLocation, 
    setUserLocation, 
    detectUserLocation, 
    isDetectingLocation, 
    googleMapsApiKey, 
    showToast 
  } = useMessMate();

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialDiet = searchParams.get("diet") || "all";

  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [diet, setDiet] = useState(initialDiet);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [selectedMessId, setSelectedMessId] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // "split" | "list" | "map"

  const fetchMesses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (diet !== "all") params.diet_type = diet;
      if (maxPrice) params.max_price = maxPrice;
      if (minRating > 0) params.min_rating = minRating;

      const data = await api.getMesses(params);
      setMesses(data);
    } catch (err) {
      console.warn("Failed to load messes from API, using fallback data:", err);
      // Fallback sample data for offline / preview
      setMesses([
        {
          id: "pune-1",
          name: "Annapurna Pure Veg Mess",
          description: "Homestyle Maharashtrian and North Indian food with unlimited rotis and daily dal tadka.",
          address: "FC Road, Shivajinagar, Pune",
          latitude: 18.5236,
          longitude: 73.8415,
          diet_type: "veg",
          monthly_price: 3200,
          per_meal_price: 85,
          average_rating: 4.6,
          hygiene_rating: 4.7,
          total_reviews: 42,
          cuisine_tags: "Pure Veg, Maharashtrian, Unlimited Thali",
          image_urls: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        },
        {
          id: "pune-2",
          name: "Sai Krupa Deluxe Mess & Dining",
          description: "Student-friendly mess with special Punjabi gravies and Sunday chicken feast.",
          address: "Lane 4, Paud Road, Kothrud, Pune",
          latitude: 18.5089,
          longitude: 73.8152,
          diet_type: "both",
          monthly_price: 3600,
          per_meal_price: 100,
          average_rating: 4.4,
          hygiene_rating: 4.3,
          total_reviews: 58,
          cuisine_tags: "Punjabi, Mughlai, Rice Plate",
          image_urls: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
        },
        {
          id: "pune-3",
          name: "Navratna Jain Bhojanalaya",
          description: "Specialized 100% Jain food cooked without onion or garlic in pure ghee.",
          address: "Katraj, Opposite Bharati Vidyapeeth, Pune",
          latitude: 18.4575,
          longitude: 73.8508,
          diet_type: "jain",
          monthly_price: 3000,
          per_meal_price: 80,
          average_rating: 4.8,
          hygiene_rating: 4.9,
          total_reviews: 65,
          cuisine_tags: "Jain, Marwadi, Rajasthani, Pure Ghee",
          image_urls: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesses();
  }, [diet, maxPrice, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMesses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-brand-600" />
            Discover Student Messes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {messes.length} messes in your selected area
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "split" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Map Only
            </button>
          </div>

          <Link
            href="/recommendations"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 border border-brand-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommender</span>
          </Link>
        </div>
      </div>

      {/* Location Dashboard Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-soft-xl border border-emerald-700/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
            <MapPin className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Location Dashboard</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700 font-mono">
                Google Maps API: Active
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>{userLocation?.name || "FC Road / Shivajinagar"}</span>
            </h2>
            <p className="text-xs text-emerald-100/70 mt-0.5">
              Live distance calculated relative to your selected campus or GPS location.
            </p>
          </div>
        </div>

        {/* Quick GPS & Campus Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isDetectingLocation ? "Detecting GPS..." : "Use Live Location"}</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            {CAMPUS_LOCATIONS.slice(0, 3).map((campus) => {
              const isSelected = userLocation?.name?.toLowerCase().includes(campus.name.split("/")[0].trim().toLowerCase());
              return (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => {
                    setUserLocation({
                      name: campus.name,
                      lat: campus.lat,
                      lng: campus.lng,
                      isCustom: true
                    });
                    showToast(`Switched campus to: ${campus.name}`, "info");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-navy-950 border-white font-extrabold shadow-sm"
                      : "bg-emerald-800/40 hover:bg-emerald-800 text-emerald-100 border-emerald-700/60"
                  }`}
                >
                  {campus.name.split("/")[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, area, cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Diet Filter */}
          <div>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Diet Types</option>
              <option value="veg">🌱 Pure Veg</option>
              <option value="both">🍗 Veg & Non-Veg</option>
              <option value="jain">✨ Jain Friendly</option>
            </select>
          </div>

          {/* Max Budget Slider */}
          <div className="flex flex-col justify-center px-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Max Budget:</span>
              <span className="font-bold text-slate-900">₹{maxPrice}/mo</span>
            </div>
            <input
              type="range"
              min="2000"
              max="6000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Min Rating */}
          <div className="flex items-center gap-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none"
            >
              <option value="0">Any Rating</option>
              <option value="4.0">⭐ 4.0 & above</option>
              <option value="4.5">⭐ 4.5 & above</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* List of Messes */}
        {(viewMode === "split" || viewMode === "list") && (
          <div className={`${viewMode === "split" ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
                <p className="text-sm">Fetching student messes...</p>
              </div>
            ) : messes.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-600 font-semibold text-sm">No messes found matching your filter criteria.</p>
                <button
                  onClick={() => { setSearch(""); setDiet("all"); setMaxPrice(5000); setMinRating(0); }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              messes.map((mess) => {
                const distance = calculateDistanceKm(
                  userLocation?.lat,
                  userLocation?.lng,
                  mess.latitude,
                  mess.longitude
                );
                const directionsUrl = getGoogleMapsDirectionsUrl({
                  destinationLat: mess.latitude,
                  destinationLng: mess.longitude,
                  destinationName: mess.name,
                  originLat: userLocation?.lat,
                  originLng: userLocation?.lng,
                });

                return (
                  <div
                    key={mess.id}
                    onClick={() => setSelectedMessId(mess.id)}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 ${
                      selectedMessId === mess.id
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                        : "border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="w-full sm:w-44 h-36 bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative">
                      <img
                        src={mess.image_urls || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt={mess.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                          {mess.diet_type === "veg" ? "Pure Veg" : mess.diet_type === "jain" ? "Jain" : "Both"}
                        </span>
                      </div>
                      {distance !== null && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-bold backdrop-blur-md">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{distance} km away</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700">
                            {mess.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0 border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{mess.average_rating || 4.5}</span>
                          </div>
                        </div>

                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{mess.address}</span>
                        </p>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                          {mess.description || mess.cuisine_tags}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monthly Plan</span>
                          <span className="text-sm font-extrabold text-slate-900">₹{mess.monthly_price}</span>
                          <span className="text-[11px] text-slate-400 ml-1">/ (₹{mess.per_meal_price}/meal)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Get directions in Google Maps"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                          >
                            <Car className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Directions</span>
                          </a>

                          <Link
                            href={`/messes/${mess.id}`}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-medium text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            View Menu & Reviews
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Map View */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className={`${viewMode === "split" ? "lg:col-span-5" : "lg:col-span-12"} sticky top-24 h-[600px]`}>
            <MessMap
              messes={messes}
              selectedMessId={selectedMessId}
              onSelectMess={(id) => setSelectedMessId(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">Loading Mess Discovery...</div>}>
      <MessesContent />
    </Suspense>
  );
}
