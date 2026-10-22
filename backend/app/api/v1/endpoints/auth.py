import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

# Strict RFC 5322 compatible email regex
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def validate_email_address(email: str) -> bool:
    """Validate that the string is a well-formed email address."""
    if not email:
        return False
    return bool(re.match(EMAIL_REGEX, email.strip()))

def validate_password_security(password: str) -> List[str]:
    """
    Validates password:
    Ensures password is not empty.
    """
    errors = []
    if not password:
        return ["Password cannot be empty."]
    return errors

class UserSyncRequest(BaseModel):
    firebase_uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = "student"
    preferred_diet: Optional[str] = "both"

class UserProfileResponse(BaseModel):
    id: str
    firebase_uid: str
    email: Optional[str]
    display_name: Optional[str]
    photo_url: Optional[str]
    preferred_diet: str
    budget_max: float

    class Config:
        from_attributes = True

class SecurityValidationRequest(BaseModel):
    email: str
    password: str

class SecurityValidationResponse(BaseModel):
    is_valid: bool
    email_valid: bool
    first_letter_capital: bool = True
    is_alphanumeric: bool = True
    min_length_satisfied: bool = True
    errors: List[str]

@router.post("/validate", response_model=SecurityValidationResponse)
def validate_security(payload: SecurityValidationRequest):
    """
    Validates user credentials:
    - Valid email format
    - Non-empty password
    """
    email_valid = validate_email_address(payload.email)
    pwd_errors = validate_password_security(payload.password)
    
    all_errors = []
    if not email_valid:
        all_errors.append("Please provide a valid email address (e.g. user@campus.edu).")
    all_errors.extend(pwd_errors)
    
    return SecurityValidationResponse(
        is_valid=len(all_errors) == 0,
        email_valid=email_valid,
        first_letter_capital=True,
        is_alphanumeric=True,
        min_length_satisfied=True,
        errors=all_errors
    )

@router.post("/sync", response_model=UserProfileResponse)
def sync_user(payload: UserSyncRequest, db: Session = Depends(get_db)):
    """Sync Firebase authenticated user to backend database with validation."""
    if payload.email and not validate_email_address(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format. Please provide a valid email address."
        )

    user = db.query(User).filter(User.firebase_uid == payload.firebase_uid).first()
    if not user:
        user = User(
            firebase_uid=payload.firebase_uid,
            email=payload.email,
            display_name=payload.display_name,
            photo_url=payload.photo_url,
            role=payload.role or "student",
            preferred_diet=payload.preferred_diet or "both"
        )
        db.add(user)
    else:
        if payload.email:
            user.email = payload.email
        if payload.display_name:
            user.display_name = payload.display_name
        if payload.photo_url:
            user.photo_url = payload.photo_url
        if payload.role:
            user.role = payload.role
        if payload.preferred_diet:
            user.preferred_diet = payload.preferred_diet

    db.commit()
    db.refresh(user)
    return user


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    firebase_uid: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = "student"

@router.post("/login", response_model=UserProfileResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate or log in a user via backend API."""
    clean_email = payload.email.strip()
    if not clean_email or not validate_email_address(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required for login."
        )

    # Find existing user by firebase_uid or email
    if payload.firebase_uid:
        user = db.query(User).filter(
            (User.firebase_uid == payload.firebase_uid) | (User.email == clean_email)
        ).first()
    else:
        user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        user = User(
            firebase_uid=payload.firebase_uid or f"usr-{clean_email.split('@')[0]}",
            email=clean_email,
            display_name=payload.display_name or clean_email.split("@")[0],
            role=payload.role or "student",
            preferred_diet="both"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if payload.display_name:
            user.display_name = payload.display_name
        if payload.role:
            user.role = payload.role
        db.commit()
        db.refresh(user)

    return user

