from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., example="user") # "user" | "assistant" | "system"
    content: str = Field(..., example="Find the nearest mess")

class UserLocationContext(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    accuracy: Optional[float] = None
    label: Optional[str] = None
    permission_granted: bool = False

class ChatFilterContext(BaseModel):
    max_budget: Optional[float] = None
    diet: Optional[str] = None # "veg", "both", "jain", "all"
    radius_km: Optional[float] = None # 1, 2, 3, 5

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    user_location: Optional[UserLocationContext] = None
    filters: Optional[ChatFilterContext] = None

class ChatAction(BaseModel):
    type: str # "nearby_messes" | "budget_compare" | "menu_today" | "directions" | "ask_location" | "confirmation_alert"
    title: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    action: Optional[ChatAction] = None
    suggested_questions: List[str] = Field(default_factory=list)
    grounded_sources: List[str] = Field(default_factory=list)
    ai_provider: str = "messmate-grounded-ai" # "gemini" or "messmate-grounded-ai"

class ChatStatusResponse(BaseModel):
    configured: bool
    provider: str
    gemini_key_set: bool
    model: str
    total_messes_in_db: int
