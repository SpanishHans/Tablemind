from typing import TYPE_CHECKING
import uuid
from enum import Enum
from datetime import datetime
from typing import List

from sqlalchemy import ForeignKey, func, Text, String, DateTime, Enum as PgEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from shared.models.base import Base
if TYPE_CHECKING:
    from shared.models.user import User_on_db
    from shared.models.job import Job_on_db
    
MAX_FILE_SIZE = 1024 * 1024 * 1024 # 1GB

class MediaType(str, Enum):
    IMAGE_PNG = "image/png"
    IMAGE_JPEG = "image/jpeg"
    VIDEO_MP4 = "video/mp4"
    TABLE_EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    TABLE_OPEN = "application/vnd.oasis.opendocument.spreadsheet"
    TABLE_CSV = "text/csv"
    TABLE_TSV = "text/tab-separated-values"

class File_on_db(Base):
    __tablename__ = "files"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
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

    media_type: Mapped[MediaType] = mapped_column(PgEnum(MediaType), nullable=False)
    filename: Mapped[str] = mapped_column(String(64), nullable=False)
    filepath: Mapped[str] = mapped_column(String(255), nullable=False)
    filehash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)

    user: Mapped["User_on_db"] = relationship("User_on_db", back_populates="files")
    jobs: Mapped[List["Job_on_db"]] = relationship("Job_on_db",  back_populates="file", cascade="all, delete-orphan")

class Prompt_on_db(Base):
    __tablename__ = "prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    prompt_text: Mapped[str] = mapped_column(Text)
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

    hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)

    jobs: Mapped[List["Job_on_db"]] = relationship("Job_on_db", back_populates="prompt", cascade="all, delete-orphan")

class Model_on_db(Base):
    __tablename__ = "models"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(nullable=False, unique=True)  # e.g., gpt-4, deepseek-chat, llama3
    provider: Mapped[str] = mapped_column(nullable=False)  # openai, deepseek, local
    encoder: Mapped[str] = mapped_column(nullable=False)  # openai, deepseek, local
    
    temperature: Mapped[float] = mapped_column(nullable=False)
    top_p: Mapped[float] = mapped_column(nullable=False)
    endpoint_url: Mapped[str] = mapped_column(nullable=False)

    cost_per_1m_input: Mapped[int] = mapped_column(nullable=False)
    cost_per_1m_output: Mapped[int] = mapped_column(nullable=False)

    max_input_tokens: Mapped[int] = mapped_column(nullable=False)
    max_output_tokens: Mapped[int] = mapped_column(nullable=False)
    
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)

    jobs: Mapped[List["Job_on_db"]] = relationship("Job_on_db", back_populates="model", cascade="all, delete-orphan")
    api_keys: Mapped[List["APIKey_on_db"]] = relationship("APIKey_on_db", back_populates="model")

class APIKey_on_db(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("models.id"))
    api_key: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)
    usage_count: Mapped[int] = mapped_column(nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    last_used: Mapped[datetime] = mapped_column(nullable=True)

    model: Mapped["Model_on_db"] = relationship("Model_on_db", back_populates="api_keys")
