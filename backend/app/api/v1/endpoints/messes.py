from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.mess import Mess
from app.schemas.mess import MessCreate, MessResponse, MessUpdate
from app.services.recommendation import calculate_haversine_distance

router = APIRouter()

@router.get("/", response_model=List[MessResponse])
def get_messes(
    db: Session = Depends(get_db),
    city: Optional[str] = Query(None, description="Filter by city"),
    diet_type: Optional[str] = Query(None, description="veg, non-veg, both, jain"),
    max_price: Optional[float] = Query(None, description="Max monthly subscription price"),
    min_rating: Optional[float] = Query(None, description="Minimum average rating"),
    search: Optional[str] = Query(None, description="Keyword search in name, landmark, cuisine"),
    user_lat: Optional[float] = Query(None, description="Student latitude for distance sorting"),
    user_lng: Optional[float] = Query(None, description="Student longitude for distance sorting"),
    radius_km: Optional[float] = Query(None, description="Radius limit in km"),
    skip: int = 0,
    limit: int = 50
):
    query = db.query(Mess)

    if city:
        query = query.filter(Mess.city.ilike(f"%{city}%"))
    if diet_type and diet_type != "all":
        query = query.filter(Mess.diet_type == diet_type)
    if max_price:
        query = query.filter(Mess.monthly_price <= max_price)
    if min_rating:
        query = query.filter(Mess.average_rating >= min_rating)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Mess.name.ilike(search_filter)) |
            (Mess.landmark.ilike(search_filter)) |
            (Mess.cuisine_tags.ilike(search_filter)) |
            (Mess.address.ilike(search_filter))
        )

    results = query.offset(skip).limit(limit).all()

    response_items = []
    for item in results:
        res = MessResponse.from_orm(item)
        if user_lat is not None and user_lng is not None:
            dist = calculate_haversine_distance(user_lat, user_lng, item.latitude, item.longitude)
            res.distance_km = dist
            if radius_km and dist > radius_km:
                continue
        response_items.append(res)

    if user_lat is not None and user_lng is not None:
        response_items.sort(key=lambda x: x.distance_km or 9999.0)

    return response_items

@router.get("/{mess_id}", response_model=MessResponse)
def get_mess_by_id(mess_id: str, db: Session = Depends(get_db)):
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")
    return mess

@router.post("/", response_model=MessResponse, status_code=status.HTTP_201_CREATED)
def create_mess(mess_in: MessCreate, db: Session = Depends(get_db)):
    db_mess = Mess(**mess_in.model_dump())
    db.add(db_mess)
    db.commit()
    db.refresh(db_mess)
    return db_mess

@router.put("/{mess_id}", response_model=MessResponse)
def update_mess(mess_id: str, mess_in: MessUpdate, db: Session = Depends(get_db)):
    db_mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not db_mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")
    
    update_data = mess_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_mess, field, value)

    db.commit()
    db.refresh(db_mess)
    return db_mess
