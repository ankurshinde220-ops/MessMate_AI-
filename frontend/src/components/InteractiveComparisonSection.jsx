"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_MESSES } from "@/data/mockData";
import { Scale, Check, Star, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function InteractiveComparisonSection() {
  const [selectedIds, setSelectedIds] = useState(["mess-1", "mess-2"]);

  const handleMessChange = (index, newId) => {
    const updated = [...selectedIds];
    updated[index] = newId;
    setSelectedIds(updated);
  };

  const addSlot = () => {
    if (selectedIds.length < 3) {
      const unused = MOCK_MESSES.find(m => !selectedIds.includes(m.id));
      if (unused) setSelectedIds([...selectedIds, unused.id]);
    }
  };

  const removeSlot = (index) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((_, idx) => idx !== index));
    }
  };

  const comparedMesses = selectedIds.map(id => MOCK_MESSES.find(m => m.id === id)).filter(Boolean);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D5] shadow-soft-sm">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Decision Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Compare Mess Plans Side-by-Side
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select any messes below to evaluate pricing, hygiene scores, Sunday specials, and daily menus.
            </p>
          </div>

          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
          >
            <span>Full screen comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {selectedIds.map((id, index) => (
            <div key={index} className="p-3 bg-cream-50 rounded-2xl border border-cream-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mess #{index + 1}
                </span>
                {selectedIds.length > 2 && (
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <select
                value={id}
                onChange={(e) => handleMessChange(index, e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-navy-900 focus:outline-none focus:border-emerald-500"
              >
                {MOCK_MESSES.map(mess => (
                  <option key={mess.id} value={mess.id}>
                    {mess.name} (₹{mess.monthly_price}/mo)
                  </option>
                ))}
              </select>
            </div>
          ))}

          {selectedIds.length < 3 && (
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <button
                onClick={addSlot}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <span>+ Add 3rd Mess to Compare</span>
              </button>
            </div>
          )}
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-cream-100 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 uppercase tracking-wider text-[11px] w-1/4">
                  Feature / Parameter
                </th>
                {comparedMesses.map(mess => (
                  <th key={mess.id} className="p-4 font-extrabold text-navy-900 text-sm">
                    {mess.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Monthly Subscription */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Monthly Price</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4">
                    <span className="text-base font-black text-navy-900">₹{mess.monthly_price}</span>
                    <span className="text-slate-400 text-xs ml-1">/ month</span>
                  </td>
                ))}
              </tr>

              {/* Per-Meal Price */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Single Walk-in Meal</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4 font-bold text-emerald-700">
                    ₹{mess.per_meal_price} / meal
                  </td>
                ))}
              </tr>

              {/* Diet Type */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Diet Classification</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-navy-900">
                      {mess.diet_type === "veg" ? "🌱 Pure Veg" : mess.diet_type === "jain" ? "✨ 100% Jain" : "🍗 Veg & Non-Veg"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Student Rating */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Overall Student Rating</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{mess.average_rating}★</span>
                      <span className="text-[10px] text-slate-400 font-normal">({mess.total_reviews} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Hygiene Rating */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Hygiene Score</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4">
                    <div className="flex items-center gap-1 font-bold text-emerald-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{mess.hygiene_rating} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Distance from Campus */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Campus Distance</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4 font-semibold text-slate-700">
                    {mess.distance_km} km away
                  </td>
                ))}
              </tr>

              {/* Sunday Special Dish */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Sunday Special Feast</td>
                {comparedMesses.map(mess => {
                  const sundayMenu = mess.weekly_menu.find(m => m.day === "Sunday");
                  return (
                    <td key={mess.id} className="p-4 text-xs font-medium text-slate-800">
                      {sundayMenu ? sundayMenu.lunch : "Weekly feast specials"}
                    </td>
                  );
                })}
              </tr>

              {/* Action Button */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-cream-50/50">Full Menu & Details</td>
                {comparedMesses.map(mess => (
                  <td key={mess.id} className="p-4">
                    <Link
                      href={`/messes/${mess.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-colors"
                    >
                      <span>View Menu</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
