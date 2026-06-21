from __future__ import annotations

from fastapi import HTTPException, status


class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: str | None = None) -> None:
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} '{identifier}' not found"
        super().__init__(msg, status.HTTP_404_NOT_FOUND)


class ConflictError(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(message, status.HTTP_409_CONFLICT)


class ValidationError(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)


class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(AppException):
    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class RateLimitError(AppException):
    def __init__(self) -> None:
        super().__init__("Rate limit exceeded", status.HTTP_429_TOO_MANY_REQUESTS)


class BusinessRuleError(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


def raise_not_found(resource: str, identifier: str | None = None) -> None:
    raise NotFoundError(resource, identifier)


def raise_conflict(message: str) -> None:
    raise ConflictError(message)
