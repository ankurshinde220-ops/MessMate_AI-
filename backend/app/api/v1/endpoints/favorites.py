from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.favorite import Favorite
from app.models.mess import Mess
from app.schemas.favorite import FavoriteCreate, FavoriteResponse

router = APIRouter()

@router.get("/", response_model=List[FavoriteResponse])
def get_user_favorites(
    user_id: str = Query("guest-student", description="Student identifier or Firebase UID"),
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    effective_user_id = x_user_id or user_id
    favorites = db.query(Favorite).filter(Favorite.user_id == effective_user_id).all()
    return favorites

@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    fav_in: FavoriteCreate,
    user_id: str = Query("guest-student"),
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    effective_user_id = x_user_id or user_id
    mess = db.query(Mess).filter(Mess.id == fav_in.mess_id).first()
    if not mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")

    existing = db.query(Favorite).filter(
        Favorite.user_id == effective_user_id,
        Favorite.mess_id == fav_in.mess_id
    ).first()

    if existing:
        return existing

    new_fav = Favorite(user_id=effective_user_id, mess_id=fav_in.mess_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@router.delete("/{mess_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    mess_id: str,
    user_id: str = Query("guest-student"),
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    effective_user_id = x_user_id or user_id
    fav = db.query(Favorite).filter(
        Favorite.user_id == effective_user_id,
        Favorite.mess_id == mess_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
    return None
