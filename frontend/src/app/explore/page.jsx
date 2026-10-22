"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Scale 
} from "lucide-react";

export default function ExplorePage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const [featuredMesses, setFeaturedMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.getMesses({ limit: 4 });
        setFeaturedMesses(data);
      } catch (err) {
        setFeaturedMesses([
          {
            id: "sample-1",
            name: "Annapurna Pure Veg Mess",
            address: "FC Road, Shivajinagar, Pune",
            diet_type: "veg",
            monthly_price: 3200,
            per_meal_price: 85,
            average_rating: 4.6,
            hygiene_rating: 4.7,
            cuisine_tags: "Pure Veg, Maharashtrian, Unlimited Thali",
            image_urls: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80"
          },
          {
            id: "sample-2",
            name: "Sai Krupa Deluxe Mess",
            address: "Near MIT WPU, Kothrud, Pune",
            diet_type: "both",
            monthly_price: 3600,
            per_meal_price: 100,
            average_rating: 4.4,
            hygiene_rating: 4.3,
            cuisine_tags: "Punjabi, Mughlai, Rice Plate",
            image_urls: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80"
          },
          {
            id: "sample-3",
            name: "Navratna Jain Bhojanalaya",
            address: "Opposite Bharati Vidyapeeth, Katraj",
            diet_type: "jain",
            monthly_price: 3000,
            per_meal_price: 80,
            average_rating: 4.8,
            hygiene_rating: 4.9,
            cuisine_tags: "100% Jain, Pure Ghee, Marwadi",
            image_urls: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80"
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchKeyword.trim()) query.set("search", searchKeyword.trim());
    if (dietFilter !== "all") query.set("diet", dietFilter);
    router.push(`/messes?${query.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI-Driven Mess Discovery for Students & Hostellers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Next Mess. <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-amber-600">
              Fresh Food, Fair Prices, Zero Hassle.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Discover verified messes near your college campus. Explore weekly menus, real student reviews, hygiene ratings, and let our AI match your monthly budget.
          </p>

          <form 
            onSubmit={handleSearchSubmit} 
            className="mt-8 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 px-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, locality (e.g. FC Road, Kothrud, Katraj)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                aria-label="Dietary Preference"
                className="px-3 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Diets</option>
                <option value="veg">Pure Veg</option>
                <option value="both">Veg & Non-Veg</option>
                <option value="jain">Jain Friendly</option>
              </select>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-md shadow-brand-600/30 transition-all active:scale-95"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Messes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Top Student-Rated Messes
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Verified food quality and student-approved hygiene scores
            </p>
          </div>
          <Link
            href="/messes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Explore all messes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMesses.map((mess) => (
            <div 
              key={mess.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={mess.image_urls || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                  alt={mess.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                    mess.diet_type === "veg" ? "bg-emerald-500/90 text-white" :
                    mess.diet_type === "jain" ? "bg-amber-500/90 text-white" : "bg-slate-900/80 text-white"
                  }`}>
                    {mess.diet_type === "veg" ? "Pure Veg" : mess.diet_type === "jain" ? "Jain Friendly" : "Veg & Non-Veg"}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-bold shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{mess.average_rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">
                    {mess.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{mess.address}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    {mess.cuisine_tags}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Monthly Mess</span>
                    <span className="text-base font-extrabold text-slate-900">₹{mess.monthly_price}</span>
                  </div>
                  <Link
                    href={`/messes/${mess.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
