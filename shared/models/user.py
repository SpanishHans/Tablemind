from typing import TYPE_CHECKING
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import func, ForeignKey, DateTime, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from shared.models.base import Base
if TYPE_CHECKING:
    from shared.models.resources import File_on_db, Job_on_db

class User_on_db(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    usertier: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_types.id"),
        nullable=False
    )
    username: Mapped[str] = mapped_column(
        unique=True,
        nullable=False
    )
    email: Mapped[str] = mapped_column(
        unique=True,  # Automatically creates index
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        nullable=False
    )
    profile_picture: Mapped[Optional[str]] = mapped_column(
        nullable=True
    )
    biography: Mapped[Optional[str]] = mapped_column(
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    media_usage: Mapped[int] = mapped_column(nullable=False, default=0)
    
    jobs: Mapped[List["Job_on_db"]] = relationship("Job_on_db", back_populates="user", cascade="all, delete-orphan")
    files: Mapped[List["File_on_db"]] = relationship("File_on_db", back_populates="user", cascade="all, delete-orphan")
    user_type: Mapped["UserTier_on_db"] = relationship("UserTier_on_db", back_populates="users")
    

class UserTier_on_db(Base):
    __tablename__ = "user_types"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(unique=True)  # e.g., "admin", "free", "premium"
    
    media_quota: Mapped[int] = mapped_column(BigInteger, nullable=False)  # bytes
    price_per_job: Mapped[int] = mapped_column(nullable=False, default=10)  # e.g., in usd cents
    can_use_premium_models: Mapped[bool] = mapped_column(default=False)

    users: Mapped[List["User_on_db"]] = relationship("User_on_db", back_populates="user_type")
