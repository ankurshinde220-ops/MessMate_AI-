from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.mess import MessResponse

class FavoriteCreate(BaseModel):
    mess_id: str = Field(..., example="uuid-mess-id")

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    mess_id: str
    created_at: datetime
    mess: MessResponse

    class Config:
        from_attributes = True
