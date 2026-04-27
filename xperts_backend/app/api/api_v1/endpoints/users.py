from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api import deps
from app.models.models import User
from app.schemas import schemas

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user

@router.get("/me/profile", response_model=schemas.Profile)
def read_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user.profile

@router.put("/me/profile", response_model=schemas.Profile)
def update_user_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: schemas.ProfileUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    profile = current_user.profile
    update_data = profile_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(profile, field, update_data[field])
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
