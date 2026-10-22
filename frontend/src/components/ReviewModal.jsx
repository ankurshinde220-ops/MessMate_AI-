"use client";

import { useState } from "react";
import { useMessMate } from "@/context/MessMateContext";
import { MOCK_MESSES } from "@/data/mockData";
import { X, Star, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ReviewModal({ onClose, defaultMessId = "mess-1" }) {
  const { addStudentReview, currentUser } = useMessMate();

  const [messId, setMessId] = useState(defaultMessId);
  const [authorName, setAuthorName] = useState(currentUser?.displayName || "");
  const [college, setCollege] = useState("COEP Tech / Pune University");
  const [rating, setRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addStudentReview({
        mess_id: messId,
        author_name: authorName.trim() || "Anonymous Hostelite",
        college: college.trim() || "Pune College",
        rating: Number(rating),
        hygiene_rating: Number(hygieneRating),
        comment: comment.trim()
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-bounce-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Student Voice
          </span>
          <h3 className="text-xl font-extrabold text-navy-900 mt-2">Write a Mess Review</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Help other students make the right food choices for their health and budget.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Select Mess</label>
            <select
              value={messId}
              onChange={(e) => setMessId(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:border-emerald-500"
            >
              {MOCK_MESSES.map(mess => (
                <option key={mess.id} value={mess.id}>
                  {mess.name} ({mess.area})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Deshmukh"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">College / Branch</label>
              <input
                type="text"
                placeholder="e.g. MIT-WPU Computer Engg"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Food Taste Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5.0 (Amazing)</option>
                <option value="4">⭐⭐⭐⭐ 4.0 (Good)</option>
                <option value="3">⭐⭐⭐ 3.0 (Average)</option>
                <option value="2">⭐⭐ 2.0 (Poor)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Kitchen Hygiene</label>
              <select
                value={hygieneRating}
                onChange={(e) => setHygieneRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none"
              >
                <option value="5">🧼 5.0 (Spotless RO)</option>
                <option value="4">🧼 4.0 (Very Clean)</option>
                <option value="3">🧼 3.0 (Satisfactory)</option>
                <option value="2">🧼 2.0 (Needs work)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Your Review & Dining Experience</label>
            <textarea
              rows="3"
              placeholder="How are the rotis? Is food freshly prepared? Are Sunday specials worth it?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full px-3 py-2 bg-cream-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-emerald-glow transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Post Verified Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
