import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mess_id = Column(String(36), ForeignKey("messes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    author_name = Column(String(100), default="Anonymous Student")
    
    rating = Column(Float, nullable=False, default=5.0) # 1.0 to 5.0
    hygiene_rating = Column(Float, nullable=False, default=5.0)
    food_quality_rating = Column(Float, nullable=False, default=5.0)
    comment = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    mess = relationship("Mess", back_populates="reviews")
