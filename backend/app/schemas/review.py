from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0, example=4.5)
    hygiene_rating: float = Field(..., ge=1.0, le=5.0, example=4.0)
    food_quality_rating: float = Field(..., ge=1.0, le=5.0, example=4.8)
    comment: str = Field(..., min_length=3, example="Super hygienic dining hall. Rotis are always soft and piping hot.")
    author_name: Optional[str] = Field("Anonymous Student", example="Rahul S.")

class ReviewCreate(ReviewBase):
    mess_id: str

class ReviewResponse(ReviewBase):
    id: str
    mess_id: str
    user_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
