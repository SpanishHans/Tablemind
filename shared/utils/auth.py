import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
import uuid

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1500"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordService:
    def __init__(self, password: str):
        self.password = password

    def hash_password(self) -> str:
        """Hashes a password using bcrypt"""
        return pwd_context.hash(self.password)

    def verify_password(self, hashed_password: str) -> bool:
        """Verifies a hashed password"""
        return pwd_context.verify(self.password, hashed_password)

class TokenService:
    def __init__(self, id: uuid.UUID, username: str):
        self.id = id
        self.username = username
    
    def generate_tokens(self):
        """Generates both Access and Refresh JWT tokens"""
        now = datetime.utcnow()
        access_expires = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_expires = now + timedelta(days=7)

        jti = str(uuid.uuid4())  # Unique ID for refresh token

        access_payload = {
            "sub": str(self.id),
            "username": self.username,
            "exp": access_expires,
            "iat": now,
            "token_type": "access"
        }

        refresh_payload = {
            "sub": str(self.id),
            "username": self.username,
            "exp": refresh_expires,
            "iat": now,
            "jti": jti,
            "token_type": "refresh"
        }

        access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm=ALGORITHM)

        return access_token, refresh_token
