from __future__ import annotations

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import AppBaseModel


class LoginRequest(AppBaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RegisterRequest(AppBaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    company_name: str = Field(min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class TokenResponse(AppBaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(AppBaseModel):
    refresh_token: str


class ForgotPasswordRequest(AppBaseModel):
    email: EmailStr


class ResetPasswordRequest(AppBaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class VerifyEmailRequest(AppBaseModel):
    token: str
