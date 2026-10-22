"use client";

import { useState } from "react";
import Link from "next/link";
import { useMessMate } from "@/context/MessMateContext";
import { 
  Star, 
  ShieldCheck, 
  MessageSquarePlus, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2
} from "lucide-react";
import ReviewModal from "@/components/ReviewModal";

export default function StudentReviewsSection() {
  const { allReviews } = useMessMate();
  const [filterRating, setFilterRating] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredReviews = allReviews.filter(rev => {
    if (filterRating === "5") return rev.rating >= 4.8;
    if (filterRating === "hygiene") return rev.hygiene_rating >= 4.8;
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Verified Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Real Student Reviews & Hygiene Ratings
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Unfiltered feedback from college students and hostellers eating daily meals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-emerald-glow transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Student Review</span>
          </button>
          <Link
            href="/reviews"
            className="px-4 py-2.5 rounded-xl bg-white border border-[#EBE3D5] text-navy-900 font-bold text-xs hover:bg-cream-50 transition-colors"
          >
            All Reviews
          </Link>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 text-xs font-bold">
        <button
          onClick={() => setFilterRating("all")}
          className={`px-3.5 py-1.5 rounded-full transition-all ${
            filterRating === "all" ? "bg-navy-900 text-white shadow-soft-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Feedback ({allReviews.length})
        </button>
        <button
          onClick={() => setFilterRating("hygiene")}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full transition-all ${
            filterRating === "hygiene" ? "bg-emerald-600 text-white shadow-soft-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Top Cleanliness (4.8+★)</span>
        </button>
        <button
          onClick={() => setFilterRating("5")}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full transition-all ${
            filterRating === "5" ? "bg-amber-600 text-white shadow-soft-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>5-Star Tastes Only</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.slice(0, 6).map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 border border-[#EBE3D5] hover:border-emerald-500/50 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header: Author & Verified Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop"}
                    alt={rev.author_name}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-navy-900 leading-tight">
                      {rev.author_name}
                    </h4>
                    <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{rev.college}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{rev.rating}</span>
                </div>
              </div>

              {/* Mess Name Tag */}
              <div className="mb-3">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cream-200 text-navy-900">
                  Reviewed: {rev.mess_name || "Verified Student Mess"}
                </span>
              </div>

              {/* Comment */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Footer with Hygiene score & verified timestamp */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hygiene: {rev.hygiene_rating}★</span>
              </div>
              <span className="text-slate-400 font-medium">{rev.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {modalOpen && (
        <ReviewModal onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}
