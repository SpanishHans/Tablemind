import uuid
from typing import Sequence, Optional

from fastapi import HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.models.job import Job_on_db, JobStatus


class JobDb:
    def __init__(self, db: AsyncSession, user: CurrentUser):
        self.db = db
        self.user = user

    async def check_job_duplicity(self, hash: str) -> Optional[Job_on_db]:
        """Check the hash for a job to see if it already exists in the database"""
        try:
            result = await self.db.execute(
                    select(Job_on_db).where(
                        Job_on_db.hash == hash,
                        Job_on_db.user_id == self.user.id
                    )
                )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo job desde db: {str(e)}"
            )



    async def create_job_entry(
            self,
            model_id: uuid.UUID,
            prompt_id: uuid.UUID,
            media_id: uuid.UUID,
            job_status: JobStatus,
            cost_estimate_usd: int,
            input_token_count: int,
            output_token_count: int,
            hash: str,
        ) -> Job_on_db:
        """Create an entry in the database for the job"""
        job = Job_on_db(
            user_id=self.user.id,
        )
        try:
            self.db.add(job)
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error creando job en db: {str(e)}"
            )



    async def get_job_entry(
            self,
            id: uuid.UUID
        ) -> Job_on_db:
        """Get an entry in the database for the job"""
        try:
            result = await self.db.execute(
                select(Job_on_db).where(
                    Job_on_db.id == id,
                    Job_on_db.user_id == self.user.id
                )
            )
            existing_job = result.scalar_one_or_none()
            if not existing_job:
                raise HTTPException(status_code=400, detail="El job no existe.")
            return existing_job
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo job desde db: {str(e)}"
            )



    async def get_all_job_entries(self) -> Sequence[Job_on_db]:
        """Get all promot entries in the database for the user"""
        try:
            result = await self.db.execute(
                select(Job_on_db).where(
                    Job_on_db.user_id == self.user.id
                )
            )
            existing_job = result.scalars().all()
            if not existing_job:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
            return existing_job
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo varios jobs desde db: {str(e)}"
            )



    async def update_job_entry(
            self,
            id: uuid.UUID,
            model_id: Optional[uuid.UUID] = None,
            prompt_id: Optional[uuid.UUID] = None, 
            media_id: Optional[uuid.UUID] = None,
            job_status: Optional[JobStatus] = None,
            cost_estimate_usd: Optional[int] = None,
            input_token_count: Optional[int] = None,
            output_token_count: Optional[int] = None,
            hash: Optional[str] = None,
        ) -> Job_on_db:
        """Update an entry in the database for a job"""
        try:
            result = await self.db.execute(
                select(Job_on_db).where(
                    Job_on_db.id == id,
                    Job_on_db.user_id == self.user.id
                )
            )
            job = result.scalar_one_or_none()
            if not job:
                raise HTTPException(status_code=400, detail="El job no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo job desde db: {str(e)}"
            )
        
        if model_id is not None:
            job.model_id = model_id
        if prompt_id is not None:
            job.prompt_id = prompt_id
        if media_id is not None:
            job.media_id = media_id
        if job_status is not None:
            job.job_status = job_status
        if cost_estimate_usd is not None:
            job.cost_estimate_usd = cost_estimate_usd
        if input_token_count is not None:
            job.input_token_count = input_token_count
        if output_token_count is not None:
            job.output_token_count = output_token_count
        if hash is not None:
            job.hash = hash

        try:
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error actualizando el job: {str(e)}")



    async def delete_job_entry(
            self,
            id: uuid.UUID
        ) -> None:
        """Delete an entry in the database for the job"""
        try:
            result = await self.db.execute(
                select(Job_on_db).where(
                    Job_on_db.id == id,
                    Job_on_db.user_id == self.user.id
                )
            )
            job = result.scalar_one_or_none()
            if not job:
                raise HTTPException(status_code=400, detail="El job no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo job desde db: {str(e)}"
            )
        try:
            await self.db.delete(job)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error eliminando el job: {str(e)}"
            )
