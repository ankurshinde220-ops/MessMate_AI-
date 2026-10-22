from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.menu import Menu
from app.models.mess import Mess
from app.schemas.menu import MenuCreate, MenuResponse

router = APIRouter()

@router.get("/mess/{mess_id}", response_model=List[MenuResponse])
def get_mess_menus(mess_id: str, db: Session = Depends(get_db)):
    mess = db.query(Mess).filter(Mess.id == mess_id).first()
    if not mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")
    
    menus = db.query(Menu).filter(Menu.mess_id == mess_id).all()
    return menus

@router.post("/", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
def create_menu_entry(menu_in: MenuCreate, db: Session = Depends(get_db)):
    mess = db.query(Mess).filter(Mess.id == menu_in.mess_id).first()
    if not mess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mess not found")

    db_menu = Menu(**menu_in.model_dump())
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu
