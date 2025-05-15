import os
import uuid
from fastapi import Request, HTTPException
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from pydantic import BaseModel, Field

class CurrentUser(BaseModel):
    id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    username: str

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")  # Same as in auth container
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def decode_and_validate_token(token: str, expected_type: str = "access"):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("token_type")
        if token_type != expected_type:
            raise HTTPException(
                status_code=401,
                detail=f"Token type mismatch: expected '{expected_type}', got '{token_type}'"
            )

        return CurrentUser(
            id=uuid.UUID(payload["sub"]),
            username=payload["username"]
        )

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or malformed token")

async def get_current_user(request: Request) -> CurrentUser:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header must start with 'Bearer'")

    token = auth_header.removeprefix("Bearer ").strip()
    return decode_and_validate_token(token, expected_type="access")

async def get_current_user_from_refresh_token(request: Request) -> CurrentUser:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token cookie is missing")

    return decode_and_validate_token(refresh_token, expected_type="refresh")
