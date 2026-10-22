import math
from typing import List, Tuple
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.models.mess import Mess
from app.schemas.recommendation import RecommendationQuery, RecommendedMessItem, RecommendationResponse
from app.schemas.mess import MessResponse

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RecommendationEngine:
    @staticmethod
    def recommend(db: Session, query: RecommendationQuery) -> RecommendationResponse:
        messes: List[Mess] = db.query(Mess).all()
        if not messes:
            return RecommendationResponse(
                recommendations=[],
                total_found=0,
                query_summary="No messes available in database."
            )

        # Prepare corpus for TF-IDF keyword matching
        corpus = []
        for m in messes:
            text = f"{m.name} {m.description or ''} {m.cuisine_tags or ''} {m.amenities or ''} {m.diet_type}"
            corpus.append(text.lower())

        user_query_text = (query.cuisine_keywords or "homestyle unlimited thali").lower()
        vectorizer = TfidfVectorizer(stop_words="english")
        
        try:
            tfidf_matrix = vectorizer.fit_transform(corpus + [user_query_text])
            user_vector = tfidf_matrix[-1]
            mess_vectors = tfidf_matrix[:-1]
            text_similarities = cosine_similarity(mess_vectors, user_vector).flatten()
        except Exception:
            # Fallback if vocabulary is completely empty or all stop words
            text_similarities = np.zeros(len(messes))

        scored_items: List[Tuple[float, Mess, List[str], float]] = []

        for idx, mess in enumerate(messes):
            reasons = []

            # 1. Diet Compatibility (Weight: 25%)
            diet_score = 1.0
            if query.diet_preference.lower() == "veg":
                if mess.diet_type == "veg":
                    diet_score = 1.0
                    reasons.append("100% Pure Vegetarian")
                elif mess.diet_type in ["both", "jain"]:
                    diet_score = 0.85
                    reasons.append("Dedicated Pure Veg Section")
                else:
                    diet_score = 0.2 # Non-veg only mess
            elif query.diet_preference.lower() == "jain":
                if "jain" in (mess.cuisine_tags or "").lower() or mess.diet_type == "jain":
                    diet_score = 1.0
                    reasons.append("Jain food options available")
                else:
                    diet_score = 0.3
            else:
                diet_score = 1.0

            # 2. Budget Score (Weight: 30%)
            budget_score = 1.0
            if mess.monthly_price <= query.max_budget:
                budget_score = 1.0
                savings = int(query.max_budget - mess.monthly_price)
                if savings > 0:
                    reasons.append(f"Saves ₹{savings}/mo on your ₹{int(query.max_budget)} budget")
                else:
                    reasons.append(f"Fits exactly within your ₹{int(query.max_budget)} budget")
            else:
                # Gradual penalty for over budget
                overage = mess.monthly_price - query.max_budget
                budget_score = max(0.0, 1.0 - (overage / (query.max_budget * 0.4)))

            # 3. Distance & Location (Weight: 15%)
            distance_km = 0.0
            distance_score = 1.0
            if query.preferred_lat is not None and query.preferred_lng is not None:
                distance_km = calculate_haversine_distance(
                    query.preferred_lat, query.preferred_lng, mess.latitude, mess.longitude
                )
                if distance_km <= (query.max_distance_km or 10.0):
                    distance_score = max(0.2, 1.0 - (distance_km / (query.max_distance_km or 10.0)))
                    reasons.append(f"Only {distance_km} km away")
                else:
                    distance_score = 0.1

            # 4. Ratings & Hygiene (Weight: 15%)
            rating_val = mess.average_rating or 4.0
            hygiene_val = mess.hygiene_rating or 4.0
            rating_score = ((rating_val * 0.6) + (hygiene_val * 0.4)) / 5.0
            if hygiene_val >= 4.5:
                reasons.append(f"High hygiene rating ({hygiene_val}★)")
            if rating_val >= 4.3:
                reasons.append(f"Top student rated ({rating_val}★)")

            # 5. Cuisine / Text Similarity (Weight: 15%)
            cuisine_score = float(text_similarities[idx])
            if cuisine_score > 0.2:
                reasons.append("Matches your preferred meal style")

            # Final Weighted Composition (0 to 100%)
            final_score = (
                (0.30 * budget_score) +
                (0.25 * diet_score) +
                (0.15 * distance_score) +
                (0.15 * rating_score) +
                (0.15 * cuisine_score)
            ) * 100.0

            scored_items.append((final_score, mess, reasons, distance_km))

        # Sort descending by final score
        scored_items.sort(key=lambda x: x[0], reverse=True)

        recommendations = []
        for score, mess, reasons, dist in scored_items[:query.limit]:
            mess_resp = MessResponse.from_orm(mess)
            mess_resp.distance_km = dist
            recommendations.append(
                RecommendedMessItem(
                    mess=mess_resp,
                    match_score=round(score, 1),
                    match_reasons=reasons[:4]
                )
            )

        summary = f"Generated {len(recommendations)} personalized mess matches for budget ₹{int(query.max_budget)} and {query.diet_preference} diet."
        return RecommendationResponse(
            recommendations=recommendations,
            total_found=len(recommendations),
            query_summary=summary
        )
