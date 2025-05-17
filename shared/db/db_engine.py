from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import os

from shared.models.base import Base

USER_DB = os.getenv("USER_DB", "postgres")
PASS_DB = os.getenv("PASS_DB", "averysecurepassword")
NAME_DB = os.getenv("NAME_DB", "Tablemind")
HOST_DB = os.getenv("HOST_DB", "db")

DATABASE = f"postgresql+asyncpg://{USER_DB}:{PASS_DB}@{HOST_DB}:5432/{NAME_DB}"

engine = create_async_engine(DATABASE, echo=True)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
