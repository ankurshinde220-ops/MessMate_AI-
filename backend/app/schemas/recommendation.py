from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.mess import MessResponse

class RecommendationQuery(BaseModel):
    diet_preference: str = Field("veg", example="veg") # veg, non-veg, both, jain
    max_budget: float = Field(4500.0, example=3500.0)
    preferred_lat: Optional[float] = Field(18.5204, example=18.5204)
    preferred_lng: Optional[float] = Field(73.8567, example=73.8567)
    max_distance_km: Optional[float] = Field(10.0, example=5.0)
    cuisine_keywords: Optional[str] = Field("North Indian Thali", example="Maharashtrian, North Indian, Thali")
    min_rating: Optional[float] = Field(3.5, example=3.8)
    limit: int = Field(6, ge=1, le=20)

class RecommendedMessItem(BaseModel):
    mess: MessResponse
    match_score: float = Field(..., example=94.5) # Percentage match
    match_reasons: List[str] = Field(..., example=["Within budget", "Matches pure veg preference", "High hygiene score"])

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendedMessItem]
    total_found: int
    query_summary: str
