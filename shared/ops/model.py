import uuid
from typing import Sequence

from fastapi import HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models.resources import Model_on_db


class ModelDb:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    
    
    async def get_model_entry(self, id: uuid.UUID) -> Model_on_db:
        """Get an entry in the database for the model"""
        try:
            result = await self.db.execute(
                select(Model_on_db).where(
                    Model_on_db.id == id,
                )
            )
            existing_model = result.scalar_one_or_none()
            if not existing_model:
                raise HTTPException(status_code=400, detail="El model no existe.")
            return existing_model
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo model desde db: {str(e)}"
            )
    
    
    
    async def get_all_model_entries(self) -> Sequence[Model_on_db]:
        """Get all promot entries in the database for the user"""
        try:
            result = await self.db.execute(
                select(Model_on_db).where(
                )
            )
            existing_model = result.scalars().all()
            if not existing_model:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
            return existing_model
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo varios models desde db: {str(e)}"
            )
