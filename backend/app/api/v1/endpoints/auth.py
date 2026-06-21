from __future__ import annotations

from fastapi import APIRouter, Request, status

from app.core.dependencies import CurrentUserDep, DatabaseDep
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.base import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=MessageResponse)
async def register(data: RegisterRequest, db: DatabaseDep) -> MessageResponse:
    svc = AuthService(db)
    user = await svc.register(data)
    return MessageResponse(message="Registration successful. Please verify your email.")


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DatabaseDep) -> TokenResponse:
    svc = AuthService(db)
    return await svc.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, db: DatabaseDep) -> TokenResponse:
    svc = AuthService(db)
    return await svc.refresh(data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(user_id: CurrentUserDep, db: DatabaseDep) -> MessageResponse:
    svc = AuthService(db)
    await svc.logout(user_id)
    return MessageResponse(message="Logged out successfully")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(data: VerifyEmailRequest, db: DatabaseDep) -> MessageResponse:
    svc = AuthService(db)
    await svc.verify_email(data.token)
    return MessageResponse(message="Email verified successfully")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest, db: DatabaseDep) -> MessageResponse:
    svc = AuthService(db)
    await svc.forgot_password(data.email)
    return MessageResponse(message="If an account exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: ResetPasswordRequest, db: DatabaseDep) -> MessageResponse:
    svc = AuthService(db)
    await svc.reset_password(data.token, data.password)
    return MessageResponse(message="Password reset successfully")
