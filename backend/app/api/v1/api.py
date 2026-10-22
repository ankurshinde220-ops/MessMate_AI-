from fastapi import APIRouter
from app.api.v1.endpoints import messes, menus, reviews, favorites, recommendations, auth, chat

api_router = APIRouter()

api_router.include_router(messes.router, prefix="/messes", tags=["messes"])
api_router.include_router(menus.router, prefix="/menus", tags=["menus"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
