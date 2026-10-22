"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Heart, Trash2, MapPin, Star, ArrowRight, Utensils } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.warn("Failed to load favorites from backend, using fallback:", err);
      setFavorites([
        {
          id: "fav-1",
          mess: {
            id: "pune-1",
            name: "Annapurna Pure Veg Mess",
            address: "FC Road, Shivajinagar, Pune",
            monthly_price: 3200,
            average_rating: 4.6,
            diet_type: "veg",
            cuisine_tags: "Pure Veg, Maharashtrian, Unlimited Thali",
            image_urls: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (messId) => {
    try {
      await api.removeFavorite(messId);
      setFavorites(favorites.filter(f => f.mess.id !== messId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setFavorites(favorites.filter(f => f.mess.id !== messId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>Student Bookmarks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Saved Messes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep track of your favorite hostel messes, weekly menus, and subscription plans
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">Loading your saved messes...</div>
      ) : favorites.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Saved Messes Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the heart icon on any mess card or details page to bookmark it here for quick access.
          </p>
          <Link
            href="/messes"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <span>Explore Messes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div 
              key={fav.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="relative h-40 bg-slate-100">
                <img
                  src={fav.mess?.image_urls || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                  alt={fav.mess?.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(fav.mess?.id)}
                  title="Remove from favorites"
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{fav.mess?.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{fav.mess?.address}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-1">{fav.mess?.cuisine_tags}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Plan</span>
                    <span className="text-sm font-extrabold text-slate-900">₹{fav.mess?.monthly_price}/mo</span>
                  </div>
                  <Link
                    href={`/messes/${fav.mess?.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
