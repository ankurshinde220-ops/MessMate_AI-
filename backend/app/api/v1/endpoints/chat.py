from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.mess import Mess
from app.core.config import settings
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatStatusResponse
)
from app.services.chat_ai import MessChatService

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Process incoming chat query with grounded mess database context,
    location-based distance calculations, Gemini API integration, and safety guardrails.
    """
    try:
        response = await MessChatService.process_chat(db=db, request=request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating chat response: {str(e)}"
        )

@router.get("/status", response_model=ChatStatusResponse)
def get_chat_status(db: Session = Depends(get_db)):
    """
    Check AI Chatbot service health, Gemini API configuration status, and database metrics.
    """
    count = db.query(Mess).count()
    has_gemini = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)
    return ChatStatusResponse(
        configured=True,
        provider="gemini" if has_gemini else "messmate-grounded-ai",
        gemini_key_set=has_gemini,
        model=settings.GEMINI_MODEL,
        total_messes_in_db=count
    )
