import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Menu(Base):
    __tablename__ = "menus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mess_id = Column(String(36), ForeignKey("messes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    day_of_week = Column(String(20), nullable=False) # Monday, Tuesday, ... Sunday
    meal_type = Column(String(30), nullable=False) # Breakfast, Lunch, Snacks, Dinner
    items = Column(String(512), nullable=False) # e.g. "Paneer Masala, Dal Fry, 4 Rotis, Rice, Salad, Sweet"
    is_special = Column(Boolean, default=False) # Weekend special feast

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mess = relationship("Mess", back_populates="menus")
