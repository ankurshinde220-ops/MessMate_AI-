"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Scale, Check, X, Star, ShieldCheck, ArrowRight, Utensils } from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const initialMess1 = searchParams.get("mess1") || "";

  const [allMesses, setAllMesses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMesses() {
      try {
        setLoading(true);
        const data = await api.getMesses();
        setAllMesses(data);
        if (data.length > 0) {
          const first = initialMess1 && data.some(m => m.id === initialMess1)
            ? initialMess1
            : data[0].id;
          const second = data.length > 1 ? (data[0].id === first ? data[1].id : data[0].id) : first;
          setSelectedIds([first, second].filter(Boolean));
        }
      } catch (err) {
        console.warn("Failed to load messes for comparison, using fallback:", err);
        const fallback = [
          {
            id: "pune-1",
            name: "Annapurna Pure Veg Mess",
            diet_type: "veg",
            monthly_price: 3200,
            per_meal_price: 85,
            average_rating: 4.6,
            hygiene_rating: 4.7,
            amenities: "RO Water, AC Dining Room, Parcel Service",
            cuisine_tags: "Maharashtrian, North Indian, Unlimited Thali"
          },
          {
            id: "pune-2",
            name: "Sai Krupa Deluxe Mess",
            diet_type: "both",
            monthly_price: 3600,
            per_meal_price: 100,
            average_rating: 4.4,
            hygiene_rating: 4.3,
            amenities: "WiFi, Water Purifier, Outdoor Seating",
            cuisine_tags: "Punjabi, Mughlai, Rice Plate"
          }
        ];
        setAllMesses(fallback);
        setSelectedIds(["pune-1", "pune-2"]);
      } finally {
        setLoading(false);
      }
    }
    loadMesses();
  }, [initialMess1]);

  const comparedMesses = allMesses.filter(m => selectedIds.includes(m.id));

  const handleSelectChange = (slotIndex, newId) => {
    const updated = [...selectedIds];
    updated[slotIndex] = newId;
    setSelectedIds(updated);
  };

  const addSlot = () => {
    if (selectedIds.length < 3 && allMesses.length > selectedIds.length) {
      const unused = allMesses.find(m => !selectedIds.includes(m.id));
      if (unused) setSelectedIds([...selectedIds, unused.id]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Decision Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Compare Mess Plans & Menus
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Evaluate prices, weekly specials, food hygiene, and amenities side-by-side
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-4">
        {selectedIds.map((id, idx) => (
          <div key={idx} className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Mess {idx + 1}
            </label>
            <select
              value={id}
              onChange={(e) => handleSelectChange(idx, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
            >
              {allMesses.map(m => (
                <option key={m.id} value={m.id}>{m.name} (₹{m.monthly_price}/mo)</option>
              ))}
            </select>
          </div>
        ))}
        {selectedIds.length < 3 && allMesses.length > selectedIds.length && (
          <button
            onClick={addSlot}
            className="mt-5 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl text-xs font-bold hover:border-brand-500 hover:text-brand-600 transition-colors"
          >
            + Add Another Mess
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 sm:p-5 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-1/4">
                  Feature
                </th>
                {comparedMesses.map(m => (
                  <th key={m.id} className="p-4 sm:p-5 font-extrabold text-slate-900 text-base">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Monthly Subscription */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Monthly Price</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5">
                    <span className="text-lg font-black text-slate-900">₹{m.monthly_price}</span>
                    <span className="text-slate-400 text-xs ml-1">/ month</span>
                  </td>
                ))}
              </tr>

              {/* Per-Meal Cost */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Per-Meal Walk-in Price</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5 font-bold text-slate-800">
                    ₹{m.per_meal_price}
                  </td>
                ))}
              </tr>

              {/* Dietary Type */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Diet Classification</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                      {m.diet_type === "veg" ? "🌱 Pure Veg" : m.diet_type === "jain" ? "✨ Jain Only" : "🍗 Veg & Non-Veg"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Student Rating */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Overall Rating</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{m.average_rating} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Hygiene Rating */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Hygiene Score</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 font-bold text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{m.hygiene_rating} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Cuisine & Specialties */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Cuisine & Specialties</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5 text-slate-600 text-xs">
                    {m.cuisine_tags || "Homestyle Thali"}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Amenities</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5 text-slate-600 text-xs">
                    {m.amenities || "RO Water, Clean Seating"}
                  </td>
                ))}
              </tr>

              {/* Action Link */}
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-700 bg-slate-50/50">Action</td>
                {comparedMesses.map(m => (
                  <td key={m.id} className="p-4 sm:p-5">
                    <Link
                      href={`/messes/${m.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors"
                    >
                      <span>View Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">Loading Comparison Matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
