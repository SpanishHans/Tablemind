import uuid
from typing import Sequence, Optional

from fastapi import HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.models.job import Chunk_on_db, JobStatus


class ChunkDb:
    def __init__(self, db: AsyncSession, user: CurrentUser):
        self.db = db
        self.user = user

    async def check_chunk_duplicity(self, hash: str) -> Optional[Chunk_on_db]:
        """Check the hash for a chunk to see if it already exists in the database"""
        try:
            result = await self.db.execute(
                    select(Chunk_on_db).where(
                        Chunk_on_db.hash == hash,
                        Chunk_on_db.user_id == self.user.id
                    )
                )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo chunk desde db: {str(e)}"
            )



    async def create_chunk_entry(
            self,
            model_id: uuid.UUID,
            prompt_id: uuid.UUID,
            media_id: uuid.UUID,
            chunk_status: JobStatus,
            cost_estimate_usd: int,
            input_token_count: int,
            output_token_count: int,
            hash: str,
        ) -> Chunk_on_db:
        """Create an entry in the database for the chunk"""
        chunk = Chunk_on_db(
            user_id=self.user.id,
        )
        try:
            self.db.add(chunk)
            await self.db.commit()
            await self.db.refresh(chunk)
            return chunk
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error creando chunk en db: {str(e)}"
            )



    async def get_chunk_entry(
            self,
            id: uuid.UUID
        ) -> Chunk_on_db:
        """Get an entry in the database for the chunk"""
        try:
            result = await self.db.execute(
                select(Chunk_on_db).where(
                    Chunk_on_db.id == id,
                    Chunk_on_db.user_id == self.user.id
                )
            )
            existing_chunk = result.scalar_one_or_none()
            if not existing_chunk:
                raise HTTPException(status_code=400, detail="El chunk no existe.")
            return existing_chunk
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo chunk desde db: {str(e)}"
            )



    async def get_all_chunk_entries(self) -> Sequence[Chunk_on_db]:
        """Get all promot entries in the database for the user"""
        try:
            result = await self.db.execute(
                select(Chunk_on_db).where(
                    Chunk_on_db.user_id == self.user.id
                )
            )
            existing_chunk = result.scalars().all()
            if not existing_chunk:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
            return existing_chunk
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo varios chunks desde db: {str(e)}"
            )



    async def update_chunk_entry(
            self,
            id: uuid.UUID,
            model_id: Optional[uuid.UUID] = None,
            prompt_id: Optional[uuid.UUID] = None, 
            media_id: Optional[uuid.UUID] = None,
            chunk_status: Optional[JobStatus] = None,
            cost_estimate_usd: Optional[int] = None,
            input_token_count: Optional[int] = None,
            output_token_count: Optional[int] = None,
            hash: Optional[str] = None,
        ) -> Chunk_on_db:
        """Update an entry in the database for a chunk"""
        try:
            result = await self.db.execute(
                select(Chunk_on_db).where(
                    Chunk_on_db.id == id,
                    Chunk_on_db.user_id == self.user.id
                )
            )
            chunk = result.scalar_one_or_none()
            if not chunk:
                raise HTTPException(status_code=400, detail="El chunk no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo chunk desde db: {str(e)}"
            )
        
        if model_id is not None:
            chunk.model_id = model_id
        if prompt_id is not None:
            chunk.prompt_id = prompt_id
        if media_id is not None:
            chunk.media_id = media_id
        if chunk_status is not None:
            chunk.chunk_status = chunk_status
        if cost_estimate_usd is not None:
            chunk.cost_estimate_usd = cost_estimate_usd
        if input_token_count is not None:
            chunk.input_token_count = input_token_count
        if output_token_count is not None:
            chunk.output_token_count = output_token_count
        if hash is not None:
            chunk.hash = hash

        try:
            await self.db.commit()
            await self.db.refresh(chunk)
            return chunk
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error actualizando el chunk: {str(e)}")



    async def delete_chunk_entry(
            self,
            id: uuid.UUID
        ) -> None:
        """Delete an entry in the database for the chunk"""
        try:
            result = await self.db.execute(
                select(Chunk_on_db).where(
                    Chunk_on_db.id == id,
                    Chunk_on_db.user_id == self.user.id
                )
            )
            chunk = result.scalar_one_or_none()
            if not chunk:
                raise HTTPException(status_code=400, detail="El chunk no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo chunk desde db: {str(e)}"
            )
        try:
            await self.db.delete(chunk)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error eliminando el chunk: {str(e)}"
            )
