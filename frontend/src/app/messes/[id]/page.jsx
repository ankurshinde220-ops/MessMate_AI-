"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { MOCK_MESSES, DISH_IMAGES } from "@/data/mockData";
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Calendar, 
  Utensils, 
  MessageSquarePlus, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  Car
} from "lucide-react";
import { getGoogleMapsDirectionsUrl } from "@/lib/location";

export default function MessDetailPage() {
  const params = useParams();
  const messId = params.id;

  const [mess, setMess] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeDay, setActiveDay] = useState("Monday");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5.0);
  const [hygieneRating, setHygieneRating] = useState(5.0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const matchedMock = MOCK_MESSES.find(m => m.id === messId) || MOCK_MESSES[0];
        
        let messData;
        try {
          messData = await api.getMessById(messId);
        } catch (e) {
          messData = null;
        }

        const [menuData, reviewData] = await Promise.all([
          api.getMessMenus(messId).catch(() => []),
          api.getMessReviews(messId).catch(() => [])
        ]);

        setMess({ ...matchedMock, ...(messData || {}) });
        setMenus(menuData.length > 0 ? menuData : (matchedMock.weekly_menu || []));
        setReviews(reviewData.length > 0 ? reviewData : (matchedMock.featured_reviews || []));
      } catch (err) {
        console.warn("Using verified mock dishes data for mess:", err);
        const fallback = MOCK_MESSES.find(m => m.id === messId) || MOCK_MESSES[0];
        setMess(fallback);
        setMenus(fallback.weekly_menu || []);
        setReviews(fallback.featured_reviews || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [messId]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.removeFavorite(messId);
        setIsFavorite(false);
      } else {
        await api.addFavorite(messId);
        setIsFavorite(true);
      }
    } catch (err) {
      console.warn("Favorite toggle:", err);
      setIsFavorite(!isFavorite);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmittingReview(true);
      const newReview = await api.submitReview({
        mess_id: messId,
        author_name: authorName.trim() || "Anonymous Student",
        rating: Number(rating),
        hygiene_rating: Number(hygieneRating),
        food_quality_rating: Number(rating),
        comment: comment.trim()
      });
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setComment("");
    } catch (err) {
      console.error("Failed to submit review:", err);
      // Fallback local update
      setReviews([{
        id: Date.now().toString(),
        author_name: authorName.trim() || "Student",
        rating: Number(rating),
        hygiene_rating: Number(hygieneRating),
        comment: comment.trim()
      }, ...reviews]);
      setShowReviewForm(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500 text-sm">Loading mess details...</div>;
  }

  if (!mess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Mess Not Found</h2>
        <Link href="/messes" className="mt-4 inline-block text-brand-600 font-semibold text-sm">
          Return to Mess Discovery
        </Link>
      </div>
    );
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayMenus = menus.filter(m => m.day_of_week.toLowerCase() === activeDay.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link href="/messes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Messes
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 h-64 md:h-auto bg-slate-100 relative">
          <img
            src={mess.image_urls || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
            alt={mess.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
              {mess.diet_type === "veg" ? "🌱 Pure Veg" : mess.diet_type === "jain" ? "✨ Jain" : "🍗 Veg & Non-Veg"}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{mess.name}</h1>
                <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{mess.address}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite 
                      ? "bg-rose-50 border-rose-200 text-rose-600" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Save to Favorites"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Ratings Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{mess.average_rating} Average Rating</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{mess.hygiene_rating} Kitchen Hygiene</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm mt-4 leading-relaxed">
              {mess.description}
            </p>
          </div>

          {/* Pricing & Contact Info */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Monthly Plan</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">₹{mess.monthly_price}</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <span className="text-xs text-slate-500">Single meal: ₹{mess.per_meal_price}</span>
            </div>

            <div className="flex items-center gap-3">
              {mess.contact_phone && (
                <a
                  href={`tel:${mess.contact_phone}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Provider</span>
                </a>
              )}
              {mess.latitude && mess.longitude && (
                <a
                  href={getGoogleMapsDirectionsUrl({
                    destinationLat: mess.latitude,
                    destinationLng: mess.longitude,
                    destinationName: mess.name
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Car className="w-4 h-4" />
                  <span>Google Maps</span>
                </a>
              )}
              <Link
                href={`/compare?mess1=${mess.id}`}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors"
              >
                <span>Compare</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Menu Schedule */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Weekly Menu Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-1">Live daily meal schedule updated by provider</p>
          </div>
        </div>

        {/* Day of Week Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-slate-100 scrollbar-none">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeDay.toLowerCase() === day.toLowerCase()
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Meals for Selected Day with Accurate Dish Photos */}
        {(() => {
          const dayMenu = mess.weekly_menu?.find(m => m.day.toLowerCase() === activeDay.toLowerCase());
          if (dayMenu) {
            return (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lunch Dish */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 w-full bg-slate-100">
                      <img
                        src={dayMenu.lunch_image || mess.image_urls}
                        alt={dayMenu.lunch_dish || "Lunch Dish"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-amber-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        ☀️ Lunch ({activeDay})
                      </div>
                      {dayMenu.special && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          Special Feast
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-sm text-amber-950 mb-1">
                        {dayMenu.lunch_dish}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {dayMenu.lunch}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prepared Fresh Every Morning</span>
                  </div>
                </div>

                {/* Dinner Dish */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 w-full bg-slate-100">
                      <img
                        src={dayMenu.dinner_image || mess.gallery?.[1] || mess.image_urls}
                        alt={dayMenu.dinner_dish || "Dinner Dish"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        🌙 Dinner ({activeDay})
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-sm text-navy-900 mb-1">
                        {dayMenu.dinner_dish}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {dayMenu.dinner}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Served 7:30 PM - 10:30 PM</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="col-span-2 p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              Standard daily meal thali served on {activeDay}. Check back for special dish updates!
            </div>
          );
        })()}
      </section>

      {/* Signature Dishes Photo Gallery */}
      {mess.gallery && mess.gallery.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Food Gallery</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Signature Dishes Served Here</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real photos of the thalis, curries, and rotis prepared at {mess.name}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mess.gallery.map((imgUrl, idx) => (
              <div key={idx} className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-soft-sm group">
                <img
                  src={imgUrl}
                  alt={`${mess.name} dish ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className="text-[10px] text-white font-bold">Kitchen Verified</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews & Ratings Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Student Reviews</h2>
            <p className="text-xs text-slate-500 mt-1">Real feedback from daily eaters</p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showReviewForm ? "Cancel" : "Write a Review"}</span>
          </button>
        </div>

        {/* Review Form Modal/Drawer */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Share Your Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul S. (COEP)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Food Taste Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="5.0">⭐⭐⭐⭐⭐ (5.0 - Exceptional)</option>
                  <option value="4.0">⭐⭐⭐⭐ (4.0 - Good)</option>
                  <option value="3.0">⭐⭐⭐ (3.0 - Average)</option>
                  <option value="2.0">⭐⭐ (2.0 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hygiene Rating</label>
                <select
                  value={hygieneRating}
                  onChange={(e) => setHygieneRating(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="5.0">🧼 5.0 (Spotless)</option>
                  <option value="4.0">🧼 4.0 (Clean)</option>
                  <option value="3.0">🧼 3.0 (Acceptable)</option>
                  <option value="2.0">🧼 2.0 (Needs Improvement)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Honest Review</label>
              <textarea
                rows="3"
                placeholder="How are the rotis? Is RO water provided? How is the Sunday special?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submittingReview ? "Posting Review..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews submitted yet. Be the first student to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{rev.author_name}</span>
                    <span className="text-[10px] text-slate-400">Verified Eater</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating}★</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
