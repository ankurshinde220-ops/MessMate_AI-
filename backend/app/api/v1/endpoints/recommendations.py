from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.recommendation import RecommendationQuery, RecommendationResponse
from app.services.recommendation import RecommendationEngine

router = APIRouter()

@router.post("/personalized", response_model=RecommendationResponse)
def get_personalized_recommendations(
    query: RecommendationQuery,
    db: Session = Depends(get_db)
):
    """
    AI-driven recommendation endpoint that scores messes against user budget,
    dietary preference, spatial proximity, and cuisine keywords using scikit-learn.
    """
    return RecommendationEngine.recommend(db=db, query=query)
