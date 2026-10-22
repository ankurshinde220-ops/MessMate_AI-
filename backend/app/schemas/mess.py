from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class MessBase(BaseModel):
    name: str = Field(..., example="Shree Krishna Pure Veg Mess")
    description: Optional[str] = Field(None, example="Homestyle unlimited pure veg thali with daily specials.")
    address: str = Field(..., example="Near Gate 2, FC Road, Shivajinagar")
    city: str = Field("Pune", example="Pune")
    landmark: Optional[str] = Field(None, example="Opposite Fergusson College Main Gate")
    latitude: float = Field(18.5204, example=18.5204)
    longitude: float = Field(73.8567, example=73.8567)
    diet_type: str = Field("veg", example="veg") # veg, non-veg, both, jain
    monthly_price: float = Field(3200.0, example=3200.0)
    per_meal_price: float = Field(90.0, example=90.0)
    cuisine_tags: Optional[str] = Field("North Indian, Maharashtrian", example="North Indian, Maharashtrian")
    amenities: Optional[str] = Field("RO Water, Parcel Service, Clean Dining", example="RO Water, AC Dining")
    image_urls: Optional[str] = Field("https://images.unsplash.com/photo-1546069901-ba9599a7e63c", example="https://images.unsplash.com/photo-1546069901-ba9599a7e63c")
    contact_phone: Optional[str] = Field(None, example="+91 98765 43210")
    opening_hours: Optional[str] = Field("8:00 AM - 10:30 PM", example="8:00 AM - 10:30 PM")
    is_verified: bool = Field(True, example=True)

class MessCreate(MessBase):
    pass

class MessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    diet_type: Optional[str] = None
    monthly_price: Optional[float] = None
    per_meal_price: Optional[float] = None
    cuisine_tags: Optional[str] = None
    amenities: Optional[str] = None
    image_urls: Optional[str] = None
    contact_phone: Optional[str] = None
    opening_hours: Optional[str] = None
    is_verified: Optional[bool] = None

class MessResponse(MessBase):
    id: str
    average_rating: float
    hygiene_rating: float
    total_reviews: int
    created_at: datetime
    updated_at: datetime
    distance_km: Optional[float] = None # Injected dynamically during location queries

    class Config:
        from_attributes = True
