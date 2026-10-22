"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_MESSES, POPULAR_DISHES } from "@/data/mockData";
import { 
  CalendarDays, 
  Utensils, 
  Star, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Filter,
  CheckCircle2
} from "lucide-react";

export default function MenusPage() {
  const [activeTab, setActiveTab] = useState("daily"); // "daily" | "dishes"
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [dishFilter, setDishFilter] = useState("all");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const filteredDishes = POPULAR_DISHES.filter((d) => {
    if (dishFilter === "all") return true;
    if (dishFilter === "veg") return d.diet === "veg";
    if (dishFilter === "non-veg") return d.diet === "non-veg" || d.diet === "both";
    if (dishFilter === "jain") return d.diet === "jain";
    if (dishFilter === "thali") return d.category === "Thali" || d.category === "Special";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authentic Food & Dishes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            Campus Menus & Verified Dish Photos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real photos according to each dish. Compare lunch and dinner menus across Pune messes.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-cream-200/80 rounded-2xl border border-[#EBE3D5] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "daily"
                ? "bg-white text-navy-900 shadow-soft-sm"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            📅 Daily Menus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dishes")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "dishes"
                ? "bg-white text-navy-900 shadow-soft-sm"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            🍲 Dishes According to Dish
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY LIVE MESS MENUS */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDay === day
                    ? "bg-emerald-600 text-white shadow-emerald-glow"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Mess Menus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MESSES.map((mess) => {
              const dayMenu = mess.weekly_menu?.find((m) => m.day === selectedDay) || mess.weekly_menu?.[0];
              return (
                <div
                  key={mess.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-sm hover:shadow-soft-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Mess Info */}
                    <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            mess.diet_type === "veg"
                              ? "bg-emerald-100 text-emerald-800"
                              : mess.diet_type === "jain"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }`}>
                            {mess.diet_type === "veg" ? "🌱 Pure Veg" : mess.diet_type === "jain" ? "✨ Jain" : "🍗 Non-Veg"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">₹{mess.per_meal_price}/meal</span>
                        </div>
                        <h3 className="font-extrabold text-base text-navy-900 line-clamp-1">{mess.name}</h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{mess.area}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 px-2 py-1 rounded-lg bg-amber-50 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{mess.average_rating}</span>
                      </div>
                    </div>

                    {/* Meal Dishes with Accurate Photos */}
                    <div className="p-5 space-y-4">
                      {/* Lunch Dish */}
                      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 overflow-hidden">
                        <div className="relative h-32 w-full bg-slate-100">
                          <img
                            src={dayMenu?.lunch_image || mess.image_urls}
                            alt={dayMenu?.lunch_dish || "Lunch dish"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-amber-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ☀️ Lunch ({selectedDay})
                          </div>
                          {dayMenu?.special && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              Special
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-amber-950 mb-1">
                            {dayMenu?.lunch_dish || "Signature Lunch Dish"}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                            {dayMenu?.lunch}
                          </p>
                        </div>
                      </div>

                      {/* Dinner Dish */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <div className="relative h-28 w-full bg-slate-100">
                          <img
                            src={dayMenu?.dinner_image || mess.gallery?.[1] || mess.image_urls}
                            alt={dayMenu?.dinner_dish || "Dinner dish"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-navy-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🌙 Dinner ({selectedDay})
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-navy-900 mb-1">
                            {dayMenu?.dinner_dish || "Signature Dinner Dish"}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                            {dayMenu?.dinner}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Monthly Mess</span>
                      <span className="text-sm font-extrabold text-navy-900">₹{mess.monthly_price}/mo</span>
                    </div>
                    <Link
                      href={`/messes/${mess.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-navy-900 text-white hover:bg-emerald-600 transition-colors"
                    >
                      <span>View Full Mess</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DISHES ACCORDING TO DISH GALLERY */}
      {activeTab === "dishes" && (
        <div className="space-y-6">
          {/* Dish Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "All Dishes" },
              { id: "thali", label: "🍛 Thalis & Feasts" },
              { id: "veg", label: "🌱 Pure Veg Curries" },
              { id: "non-veg", label: "🍗 Chicken & Non-Veg" },
              { id: "jain", label: "✨ Jain Desi Ghee" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDishFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  dishFilter === f.id
                    ? "bg-navy-900 text-white shadow-soft-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft-sm hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                        dish.diet === "veg"
                          ? "bg-emerald-600/90 text-white"
                          : dish.diet === "jain"
                          ? "bg-amber-600/90 text-white"
                          : "bg-navy-900/90 text-white"
                      }`}>
                        {dish.diet === "veg" ? "Pure Veg" : dish.diet === "jain" ? "100% Jain" : "Non-Veg"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/90 text-navy-900 shadow-sm backdrop-blur-md">
                        {dish.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-navy-900 font-extrabold text-sm px-2.5 py-1 rounded-xl shadow-sm">
                      ₹{dish.price}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-base text-navy-900">{dish.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{dish.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Served at <span className="text-navy-900 font-bold">{dish.mess_name}</span> ({dish.area})
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exact Photo Match</span>
                  </div>
                  <Link
                    href="/messes"
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-navy-900 transition-colors"
                  >
                    <span>Find Mess</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
