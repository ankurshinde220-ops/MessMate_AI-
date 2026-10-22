from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MenuBase(BaseModel):
    day_of_week: str = Field(..., example="Monday")
    meal_type: str = Field(..., example="Lunch") # Breakfast, Lunch, Snacks, Dinner
    items: str = Field(..., example="Paneer Masala, Dal Tadka, 4 Chapatis, Jeera Rice, Salad")
    is_special: bool = Field(False, example=False)

class MenuCreate(MenuBase):
    mess_id: str

class MenuUpdate(BaseModel):
    day_of_week: Optional[str] = None
    meal_type: Optional[str] = None
    items: Optional[str] = None
    is_special: Optional[bool] = None

class MenuResponse(MenuBase):
    id: str
    mess_id: str
    created_at: datetime

    class Config:
        from_attributes = True
