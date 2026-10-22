"use client";

import Link from "next/link";
import { useMessMate } from "@/context/MessMateContext";
import { 
  Star, 
  MapPin, 
  Heart, 
  Scale, 
  Utensils, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Car
} from "lucide-react";
import { calculateDistanceKm, getGoogleMapsDirectionsUrl } from "@/lib/location";

export default function MessCard({ mess }) {
  const { toggleFavorite, isFavorite, comparisonList, toggleCompare, userLocation } = useMessMate();

  const isFav = isFavorite(mess.id);
  const isCompared = comparisonList.includes(mess.id);
  const liveDistance = calculateDistanceKm(
    userLocation?.lat,
    userLocation?.lng,
    mess.latitude,
    mess.longitude
  ) ?? mess.distance_km ?? 1.2;

  const getDietBadge = (diet) => {
    switch (diet) {
      case "veg":
        return { label: "Pure Veg", bg: "bg-emerald-600 text-white", icon: "🌱" };
      case "jain":
        return { label: "100% Jain", bg: "bg-amber-600 text-white", icon: "✨" };
      case "both":
      default:
        return { label: "Veg & Non-Veg", bg: "bg-navy-900 text-white", icon: "🍗" };
    }
  };

  const dietBadge = getDietBadge(mess.diet_type);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#EBE3D5] hover:border-emerald-500/60 shadow-soft-sm hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Header & Image */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={mess.image_urls || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop"}
            alt={mess.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-black/30" />

          {/* Diet & Food Category Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${dietBadge.bg}`}>
              {dietBadge.icon} {dietBadge.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/90 text-navy-900 shadow-sm backdrop-blur-md">
              {mess.food_category || "Unlimited Thali"}
            </span>
          </div>

          {/* Quick Favorite Action Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(mess.id);
            }}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-soft-md transition-all z-10 active:scale-90 ${
              isFav 
                ? "bg-rose-500 text-white scale-105" 
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500"
            }`}
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-white text-white" : ""}`} />
          </button>

          {/* Bottom Overlay Info (Distance & Rating) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-1 text-xs font-semibold drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{liveDistance} km away</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-navy-900/80 border border-white/20 text-xs font-black backdrop-blur-md shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{mess.average_rating}</span>
              <span className="text-[10px] text-slate-300 font-normal">({mess.total_reviews})</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/messes/${mess.id}`} className="group-hover:text-emerald-700 transition-colors">
                <h3 className="font-extrabold text-lg text-navy-900 leading-tight">
                  {mess.name}
                </h3>
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {mess.landmark || mess.address}
            </p>
          </div>

          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1.5">
            {mess.cuisine_tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cream-200 text-navy-800"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Hygiene & Student Quality Chips */}
          <div className="flex items-center gap-2 pt-1 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{mess.hygiene_rating}★ Hygiene</span>
            </span>
            <span className="text-slate-500 line-clamp-1 text-[10px]">
              • {mess.opening_hours || "Open Daily"}
            </span>
          </div>

          {/* Pricing Highlight */}
          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Monthly Plan</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-navy-900">₹{mess.monthly_price}</span>
                <span className="text-xs font-semibold text-slate-500">/ mo</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Single Meal</span>
              <span className="text-xs font-black text-emerald-700">₹{mess.per_meal_price} / plate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Actions (All functional!) */}
      <div className="px-5 pb-5 pt-1 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: View Menu */}
          <Link
            href={`/messes/${mess.id}#menu`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Menu</span>
          </Link>

          {/* Action 2: Add to Compare */}
          <button
            onClick={() => toggleCompare(mess.id)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              isCompared 
                ? "bg-navy-900 text-white border-navy-900 shadow-soft-sm" 
                : "bg-white text-navy-900 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? "In Compare" : "Compare"}</span>
          </button>
        </div>

        {/* Action 3: Directions & Full Details CTA */}
        <div className="flex items-center gap-2">
          {mess.latitude && mess.longitude && (
            <a
              href={getGoogleMapsDirectionsUrl({
                destinationLat: mess.latitude,
                destinationLng: mess.longitude,
                destinationName: mess.name,
                originLat: userLocation?.lat,
                originLng: userLocation?.lng,
              })}
              target="_blank"
              rel="noopener noreferrer"
              title="Get directions in Google Maps"
              className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors flex items-center justify-center shrink-0"
            >
              <Car className="w-4 h-4" />
            </a>
          )}
          <Link
            href={`/messes/${mess.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 shadow-soft-sm transition-all active:scale-[0.98]"
          >
            <span>Explore Details & Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
