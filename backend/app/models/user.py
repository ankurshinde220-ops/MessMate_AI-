import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)
    display_name = Column(String(255), nullable=True)
    photo_url = Column(String(512), nullable=True)
    role = Column(String(32), default="student")
    
    # User preference defaults
    preferred_diet = Column(String(32), default="both") # veg, non-veg, both, jain
    budget_max = Column(Float, default=5000.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
