"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessMate } from "@/context/MessMateContext";
import { CAMPUS_LOCATIONS } from "@/data/mockData";
import { 
  Utensils, 
  Compass, 
  Scale, 
  CalendarDays, 
  Star, 
  Heart, 
  MapPin, 
  LogIn, 
  User, 
  Menu as MenuIcon, 
  X,
  ChevronDown,
  Navigation,
  Loader2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { 
    favorites, 
    comparisonList, 
    userLocation, 
    setUserLocation, 
    detectUserLocation,
    isDetectingLocation,
    currentUser, 
    logoutStudent,
    showToast
  } = useMessMate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Discover", href: "/messes", icon: Compass },
    { label: "Compare", href: "/compare", icon: Scale, badge: comparisonList.length },
    { label: "Menus", href: "/menus", icon: CalendarDays },
    { label: "Reviews", href: "/reviews", icon: Star },
    { label: "Favorites", href: "/favorites", icon: Heart, badge: favorites.length },
  ];

  const handleSelectCampus = (campus) => {
    setUserLocation({
      name: campus.name,
      lat: campus.lat,
      lng: campus.lng,
      isCustom: true
    });
    setLocationDropdownOpen(false);
    showToast(`Campus set to: ${campus.name}`, "info");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EBE3D5] shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-emerald-glow group-hover:scale-105 transition-transform duration-300">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-navy-900">MessMate</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden sm:block">Smart Mess Platform</p>
          </div>
        </Link>

        {/* Location Selector Pill */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EBE3D5] text-xs font-semibold text-navy-900 hover:border-emerald-500 hover:shadow-soft-sm transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[200px] truncate">{userLocation.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {locationDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-xl border border-slate-200 p-2 z-50 animate-bounce-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Select Your College / Area:
              </span>

              {/* GPS Live Locate Button */}
              <button
                type="button"
                onClick={async () => {
                  await detectUserLocation();
                  setLocationDropdownOpen(false);
                }}
                disabled={isDetectingLocation}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-between mb-1.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? "animate-spin" : ""}`} />
                  <span>{isDetectingLocation ? "Detecting GPS..." : "Detect Live Location (GPS)"}</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                  GPS
                </span>
              </button>

              <div className="space-y-1">
                {CAMPUS_LOCATIONS.map(campus => (
                  <button
                    key={campus.id}
                    onClick={() => handleSelectCampus(campus)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-navy-900 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{campus.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-emerald-glow"
                    : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-tight ${
                    isActive ? "bg-white text-emerald-700" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBE3D5] shadow-soft-sm">
                <img
                  src={currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop"}
                  alt={currentUser.displayName || "User"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-navy-900 max-w-[130px] truncate leading-tight">
                    {currentUser.displayName || currentUser.messName || "User"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 leading-tight">
                    {currentUser.role === "mess" ? "🍲 Mess Partner" : "🎓 Student"}
                  </span>
                </div>
              </div>
              <button
                onClick={logoutStudent}
                title="Sign out"
                className="p-2 rounded-xl bg-white border border-[#EBE3D5] text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 shadow-soft-sm transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#EBE3D5] text-slate-700 hover:bg-slate-50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 bg-white border-b border-slate-200 space-y-2 animate-bounce-in">
          {/* Location mobile selector */}
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 mb-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">Your Location:</span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{userLocation.name}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await detectUserLocation();
                  setMobileMenuOpen(false);
                }}
                disabled={isDetectingLocation}
                className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-1"
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>GPS</span>
              </button>
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? "bg-emerald-600 text-white" : "text-navy-900 hover:bg-emerald-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block truncate">
                      {currentUser.displayName || currentUser.messName}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      {currentUser.role === "mess" ? "🍲 Mess Partner" : "🎓 Verified Student"}
                    </span>
                  </div>
                  <button
                    onClick={() => { logoutStudent(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-navy-900 text-white rounded-xl text-sm font-bold shadow-soft-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to MessMate AI Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
