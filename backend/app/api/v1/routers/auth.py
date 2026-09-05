from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models import User
from app.schemas import Token
from app.security import verify_password, create_access_token
from app.config import settings

from app.api.deps import get_current_active_user

from fastapi import APIRouter, Depends, HTTPException, status, Response

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token", response_model=Token)
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )

    # Set secure HttpOnly cookie for XSS-proof session storage
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False  # Set True in production HTTPS
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"status": "logged_out", "message": "HttpOnly session cookie deleted."}

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    role_key_map = {
        "Superadmin": "SUPER_ADMIN",
        "Operator": "OPERATOR",
        "Investigator": "INVESTIGATOR",
        "Department Admin": "DEPT_ADMIN",
        "Viewer": "VIEWER"
    }
    return {
        "id": current_user.id,
        "username": current_user.username,
        "badge_number": current_user.username,
        "full_name": current_user.full_name or current_user.username,
        "designation": current_user.designation or current_user.department.name,
        "role": current_user.role.name,
        "role_key": role_key_map.get(current_user.role.name, "SUPER_ADMIN"),
        "department": current_user.department.name
    }
