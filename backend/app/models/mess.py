import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class Mess(Base):
    __tablename__ = "messes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(512), nullable=False)
    city = Column(String(100), index=True, default="Pune")
    landmark = Column(String(255), nullable=True)
    
    # Geographic location for OpenStreetMap and distance calculation
    latitude = Column(Float, nullable=False, default=18.5204)
    longitude = Column(Float, nullable=False, default=73.8567)

    # Dietary & Pricing
    diet_type = Column(String(32), default="both") # veg, non-veg, both, jain
    monthly_price = Column(Float, nullable=False, default=3200.0)
    per_meal_price = Column(Float, nullable=False, default=90.0)

    # Aggregated Ratings
    average_rating = Column(Float, default=4.0)
    hygiene_rating = Column(Float, default=4.0)
    total_reviews = Column(Integer, default=0)

    # Features & Tags
    cuisine_tags = Column(String(512), default="North Indian, Maharashtrian")
    amenities = Column(String(512), default="RO Water, Parcel Service, Clean Dining")
    image_urls = Column(Text, default="https://images.unsplash.com/photo-1546069901-ba9599a7e63c")
    contact_phone = Column(String(50), nullable=True)
    opening_hours = Column(String(100), default="8:00 AM - 10:30 PM")
    is_verified = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    menus = relationship("Menu", back_populates="mess", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="mess", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="mess", cascade="all, delete-orphan")
