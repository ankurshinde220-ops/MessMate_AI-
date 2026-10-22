from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.review import Review
from app.models.mess import Mess
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()

@router.get("/mess/{mess_id}", response_model=List[ReviewResponse])
def get_mess_reviews(mess_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.mess_id == mess_id).order_by(Review.created_at.desc()).all()
    return reviews

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(review_in: ReviewCreate, db: Session = Depends(get_db)):
    mess = db.query(Mess).filter(Mess.id == review_in.mess_id).first()
    if not mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")

    new_review = Review(**review_in.model_dump())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Recalculate average rating & hygiene rating
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.avg(Review.hygiene_rating).label("avg_hygiene"),
        func.count(Review.id).label("count")
    ).filter(Review.mess_id == review_in.mess_id).first()

    if stats and stats.count:
        mess.average_rating = round(float(stats.avg_rating), 1)
        mess.hygiene_rating = round(float(stats.avg_hygiene), 1)
        mess.total_reviews = int(stats.count)
        db.commit()

    return new_review
