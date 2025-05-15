import uuid
from datetime import datetime
from typing import Sequence, Optional

from fastapi import HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.models.resources import Prompt_on_db


class PromptDb:
    def __init__(self, db: AsyncSession, user: CurrentUser):
        self.db = db
        self.user = user

    async def check_prompt_duplicity(self, hash: str) -> Optional[Prompt_on_db]:
        """Check the hash for a prompt to see if it already exists in the database"""
        try:
            result = await self.db.execute(
                    select(Prompt_on_db).where(
                        Prompt_on_db.hash == hash,
                        Prompt_on_db.user_id == self.user.id
                    )
                )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo prompt desde db: {str(e)}"
            )
    
    
    
    async def get_prompt_entry(self, id: uuid.UUID) -> Prompt_on_db:
        """Get an entry in the database for the prompt"""
        try:
            result = await self.db.execute(
                select(Prompt_on_db).where(
                    Prompt_on_db.id == id,
                    Prompt_on_db.user_id == self.user.id
                )
            )
            existing_prompt = result.scalar_one_or_none()
            if not existing_prompt:
                raise HTTPException(status_code=400, detail="El prompt no existe.")
            return existing_prompt
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo prompt desde db: {str(e)}"
            )
    
    
    
    async def get_all_prompt_entries(self) -> Sequence[Prompt_on_db]:
        """Get all promot entries in the database for the user"""
        try:
            result = await self.db.execute(
                select(Prompt_on_db).where(
                    Prompt_on_db.user_id == self.user.id
                )
            )
            existing_prompt = result.scalars().all()
            if not existing_prompt:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
            return existing_prompt
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo varios prompts desde db: {str(e)}"
            )



    async def create_prompt_entry(self, prompt_text:str, hash: str) -> Prompt_on_db:
        """Create an entry in the database for the prompt"""
        prompt = Prompt_on_db(
            user_id=self.user.id,
            prompt_text=prompt_text,
            hash=hash,
        )
        try:
            self.db.add(prompt)
            await self.db.commit()
            await self.db.refresh(prompt)
            return prompt
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error creando prompt en db: {str(e)}"
            )



    async def update_prompt_entry(self, id: uuid.UUID, prompt_text:str, hash: str) -> Prompt_on_db:
        """Update an entry in the database for a prompt"""
        try:
            result = await self.db.execute(
                select(Prompt_on_db).where(
                    Prompt_on_db.id == id,
                    Prompt_on_db.user_id == self.user.id
                )
            )
            prompt = result.scalar_one_or_none()
            if not prompt:
                raise HTTPException(status_code=400, detail="El prompt no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo prompt desde db: {str(e)}")

        prompt.prompt_text = prompt_text
        prompt.hash = hash
        prompt.updated_at = datetime.utcnow()

        try:
            await self.db.commit()
            await self.db.refresh(prompt)
            return prompt
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error actualizando el prompt: {str(e)}")



    async def delete_prompt_entry(self, id: uuid.UUID) -> None:
        """Delete an entry in the database for the prompt"""
        try:
            result = await self.db.execute(
                select(Prompt_on_db).where(
                    Prompt_on_db.id == id,
                    Prompt_on_db.user_id == self.user.id
                )
            )
            prompt = result.scalar_one_or_none()
            if not prompt:
                raise HTTPException(status_code=400, detail="El prompt no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo prompt desde db: {str(e)}")
        try:
            await self.db.delete(prompt)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error eliminando el prompt: {str(e)}"
            )
