import logging
import os
import random
import uuid
from typing import List, Optional, Tuple
from datetime import datetime

from fastapi import HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.models.job import Chunk_on_db, GranularityLevel, JobStatus
from shared.ops.job import JobDb
from shared.ops.media import MediaDb
from shared.ops.model import ModelDb
from shared.ops.prompt import PromptDb
from shared.ops.user import UsersDb
from shared.schemas.generic import ResponseMessage
from shared.schemas.job import ResponseJob, ResponseJobDownload
from shared.utils.crypt import CryptoUtils
from shared.utils.job import ChunkUtils, JobUtils
from shared.utils.media import MediaUtils
from shared.utils.text import TextUtils

logger = logging.getLogger(__name__)

KEY_FERNET_ENCRYPTION = os.getenv("KEY_FERNET_ENCRYPTION", "A very safe key").encode()

class JobHandler:
    def __init__(
        self,
        db: AsyncSession,
        current_user: CurrentUser,
    ):
        self.db = db
        self.user = current_user

        self.textutils = TextUtils()
        self.mediautils = MediaUtils()
        self.jobutils = JobUtils()
        self.chunkutils = ChunkUtils(self.db)

        self.jobondb = JobDb(self.db, self.user)
        self.promptondb = PromptDb(self.db, self.user)
        self.mediaondb = MediaDb(self.db)
        self.modelondb = ModelDb(self.db)
        self.userondb = UsersDb(self.db)



    async def EstimateJob(
            self,
            prompt_id: uuid.UUID,
            media_id: uuid.UUID,
            model_id: uuid.UUID,
            granularity: GranularityLevel,
            verbosity: float,
            chunk_size: int,
            focus_column: Optional[str]
        ) -> ResponseJob:
        # Store parameters for future use in JobCreate
        self.prompt_id = prompt_id
        self.media_id = media_id
        self.model_id = model_id
        self.granularity = granularity
        self.verbosity = verbosity
        self.chunk_size = chunk_size
        self.focus_column = focus_column

        # Fetch required data
        self.prompt = await self.promptondb.get_prompt_entry(prompt_id)
        self.media = await self.mediaondb.get_media_entry(media_id, self.user.id)
        self.model = await self.modelondb.get_model_entry(model_id)
        self.userdata = await self.userondb.get_user_entry(self.user.id)

        if not self.prompt or not self.media or not self.model or not self.userdata:
            raise HTTPException(status_code=404, detail="No se encontró prompt, media o model")

        handling_fee = self.userdata.user_type.price_per_job

        full_path = os.path.join(self.media.filepath, self.media.filename)
        self.df = self.jobutils.load_dataframe(full_path, self.media.media_type)
        
        if granularity == GranularityLevel.PER_CELL and not focus_column:
            raise HTTPException(status_code=400, detail="se requiere focus_column para modo PER_CELL")

        if focus_column and focus_column not in self.df.columns:
            raise HTTPException(status_code=400, detail=f"No se encontró '{focus_column}' en df.")

        if not self.model.is_active:
            raise HTTPException(status_code=403, detail=f"El modelo '{self.model.name}' no está activo.")

        random_api_key_obj = random.choice(self.model.api_keys)
        self.api_key = CryptoUtils(key=KEY_FERNET_ENCRYPTION).decrypt(random_api_key_obj.api_key)

        self.input_tokens = self.jobutils.estimate_input_tokens(
            df=self.df,
            model=self.model,
            api_key=self.api_key,
            granularity=granularity,
            focus_column=focus_column,
            prompt_text=self.prompt.prompt_text
        )
        self.output_tokens, self.risk_level = self.jobutils.estimate_output_tokens(
            self.input_tokens,
            verbosity=verbosity,
            model_max_output_tokens=self.model.max_output_tokens
        )
        self.cost_usd = round((((self.input_tokens / 1_000_000) * self.model.cost_per_1m_input) + \
                        ((self.output_tokens / 1_000_000) * self.model.cost_per_1m_output)) + \
                        (handling_fee))

        self.hash = self.textutils.generate_text_hash(f"{self.prompt.id}{self.media.id}{self.model.id}")

        return ResponseJob(
            job_id=None,
            filename=self.media.filename,
            modelname=self.model.name,
            verbosity=verbosity,
            granularity=granularity,
            estimated_input_tokens=self.input_tokens,
            estimated_output_tokens=self.output_tokens,
            cost_per_1m_input=self.model.cost_per_1m_input,
            cost_per_1m_output=self.model.cost_per_1m_output,
            handling_fee=handling_fee,
            estimated_cost=self.cost_usd,
            job_status=None,
            task_id=None,
            task_status=None,
            created_at=None,
            completed_at=None
        )



    async def JobCreate(
                self,
                granularity: Optional[GranularityLevel] = None,
                chunk_size: Optional[int] = None,
                focus_column: Optional[str] = None,
            ) -> ResponseJob:
            granularity = granularity or self.granularity
            chunk_size = chunk_size or self.chunk_size
            focus_column = focus_column if focus_column is not None else self.focus_column

            if not hasattr(self, 'prompt') or not hasattr(self, 'media') or not hasattr(self, 'model'):
                raise HTTPException(status_code=400, detail="Debe ejecutar EstimateJob antes de crear un trabajo")

            try:
                dup = await self.jobondb.check_job_duplicity(self.hash)
                if dup:
                    logger.info(f"Found duplicate job {dup.id} with same hash")
                    await self.jobondb.update_job_entry(
                        id=dup.id,
                        job_status=JobStatus.QUEUED
                    )
                    try:
                        await self.chunkutils.store(
                            job_id=dup.id,
                            user_id=self.user.id,
                            granularity=granularity,
                            df=self.df,
                            chunk_size=chunk_size,
                            focus_column=focus_column or ""
                        )
                    except Exception as chunk_error:
                        logger.error(f"Error storing chunks for job {dup.id}: {str(chunk_error)}")

                    return ResponseJob(
                        job_id=dup.id,
                        filename=self.media.filename,
                        modelname=self.model.name,
                        verbosity=self.verbosity,
                        granularity=str(granularity),
                        estimated_input_tokens=self.input_tokens,
                        estimated_output_tokens=self.output_tokens,
                        cost_per_1m_input=self.model.cost_per_1m_input,
                        cost_per_1m_output=self.model.cost_per_1m_output,
                        handling_fee=self.userdata.user_type.price_per_job if self.userdata and hasattr(self.userdata, 'user_type') else 0,
                        estimated_cost=self.cost_usd,
                        job_status=JobStatus.QUEUED,
                        task_id=None,
                        task_status=None,
                        created_at=None,
                        completed_at=None
                    )
            except Exception as e:
                logger.error(f"Error checking for duplicate job: {str(e)}")

            try:
                job = await self.jobondb.create_job_entry(
                    model_id=self.model.id,
                    prompt_id=self.prompt.id,
                    media_id=self.media.id,
                    job_status=JobStatus.QUEUED,
                    cost_estimate_usd=self.cost_usd,
                    input_token_count=self.input_tokens,
                    output_token_count=self.output_tokens,
                    hash=self.hash,
                )

                try:
                    await self.chunkutils.store(
                        job_id=job.id,
                        user_id=self.user.id,
                        granularity=granularity,
                        df=self.df,
                        chunk_size=chunk_size,
                        focus_column=focus_column or ""
                    )
                except Exception as chunk_error:
                    logger.error(f"Error storing chunks for job {job.id}: {str(chunk_error)}")

                return ResponseJob(
                    job_id=job.id,
                    filename=self.media.filename,
                    modelname=self.model.name,
                    verbosity=self.verbosity,
                    granularity=str(granularity),
                    estimated_input_tokens=self.input_tokens,
                    estimated_output_tokens=self.output_tokens,
                    cost_per_1m_input=self.model.cost_per_1m_input,
                    cost_per_1m_output=self.model.cost_per_1m_output,
                    handling_fee=self.userdata.user_type.price_per_job if self.userdata and hasattr(self.userdata, 'user_type') else 0,
                    estimated_cost=self.cost_usd,
                    job_status=JobStatus.QUEUED,
                    task_id=None,
                    task_status=None,
                    created_at=None,
                    completed_at=None
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error creating job: {str(e)}"
                )



    async def JobUpdate(self, id: uuid.UUID, job_text: str) -> ResponseJob:
            try:
                # Get the job
                job = await self.jobondb.get_job_entry(id)

                # Get associated records
                media = await self.mediaondb.get_media_entry(job.media_id, self.user.id)
                model = await self.modelondb.get_model_entry(job.model_id)
                # Get prompt but we're not using it yet - kept for future expansion
                await self.promptondb.get_prompt_entry(job.prompt_id)

                # Create sanitized text and hash
                self.job_text = self.textutils.sanitize_text(job_text)
                self.hash = self.textutils.generate_text_hash(job_text)

                # Update the job
                updated_job = await self.jobondb.update_job_entry(
                    id=id,
                    job_status=JobStatus.QUEUED,
                    hash=self.hash
                )

                return ResponseJob(
                    job_id=updated_job.id,
                    filename=media.filename,
                    modelname=model.name,
                    verbosity=0.0,  # We don't store this in the job record
                    granularity="",  # We don't store this in the job record
                    estimated_input_tokens=updated_job.input_token_count,
                    estimated_output_tokens=updated_job.output_token_count,
                    cost_per_1m_input=model.cost_per_1m_input,
                    cost_per_1m_output=model.cost_per_1m_output,
                    handling_fee=0,  # We don't know this without user info
                    estimated_cost=updated_job.cost_estimate_usd,
                    job_status=updated_job.job_status,
                    task_id=None,  # Add missing parameter
                    task_status=None,  # Add missing parameter
                    created_at=updated_job.created_at,
                    completed_at=updated_job.completed_at
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error updating job: {str(e)}"
                )



    async def JobRead(self, id: uuid.UUID) -> ResponseJob:
            try:
                # Get the job
                job = await self.jobondb.get_job_entry(id)

                # Get associated records
                media = await self.mediaondb.get_media_entry(job.media_id, self.user.id)
                model = await self.modelondb.get_model_entry(job.model_id)
                # Fetch prompt but not using it now - kept for possible future use
                _ = await self.promptondb.get_prompt_entry(job.prompt_id)

                return ResponseJob(
                    job_id=job.id,
                    filename=media.filename,
                    modelname=model.name,
                    verbosity=0.2,  # Default value since we don't store this in the job record
                    granularity="PER_ROW",  # Default value since we don't store this in the job record
                    estimated_input_tokens=job.input_token_count,
                    estimated_output_tokens=job.output_token_count,
                    cost_per_1m_input=model.cost_per_1m_input,
                    cost_per_1m_output=model.cost_per_1m_output,
                    handling_fee=0,  # We don't know this without user info
                    estimated_cost=job.cost_estimate_usd,
                    job_status=job.job_status,
                    task_id=None,  # Add missing parameter
                    task_status=None,  # Add missing parameter
                    created_at=job.created_at,
                    completed_at=job.completed_at
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error reading job: {str(e)}"
                )



    async def JobReadAll(self) -> List[ResponseJob]:
        try:
            # Get all jobs
            job_entries = await self.jobondb.get_all_job_entries()
            jobs = []

            # Build response for each job
            for job in job_entries:
                try:
                    # Get associated records for each job
                    media = await self.mediaondb.get_media_entry(job.media_id, self.user.id)
                    model = await self.modelondb.get_model_entry(job.model_id)
                    # Fetch the prompt but we're not using it yet - kept for future reference
                    _ = await self.promptondb.get_prompt_entry(job.prompt_id)

                    jobs.append(ResponseJob(
                        job_id=job.id,
                        filename=media.filename,
                        modelname=model.name,
                        verbosity=0.0,  # We don't store this in the job record 
                        granularity="",  # We don't store this in the job record
                        estimated_input_tokens=job.input_token_count,
                        estimated_output_tokens=job.output_token_count,
                        cost_per_1m_input=model.cost_per_1m_input,
                        cost_per_1m_output=model.cost_per_1m_output,
                        handling_fee=0,  # We don't know this without user info
                        estimated_cost=job.cost_estimate_usd,
                        job_status=job.job_status,
                        task_id=None,  # Add required parameter
                        task_status=None,  # Add required parameter
                        created_at=job.created_at,
                        completed_at=job.completed_at
                    ))
                except Exception as e:
                    # Skip jobs with missing associated records
                    logger.error(f"Error loading job {job.id}: {str(e)}")
                    continue

            return jobs
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error reading jobs: {str(e)}"
            )



    async def JobDelete(self, id: uuid.UUID) -> ResponseMessage:
        await self.jobondb.delete_job_entry(id)
        return ResponseMessage(message="Job eliminado correctamente")
        
        
    async def GetChunksStats(self, job_id: uuid.UUID) -> dict:
        """
        Get statistics about chunks for a job
        
        Parameters:
        -----------
        job_id : uuid.UUID
            The UUID of the job to get stats for
            
        Returns:
        --------
        dict
            A dictionary with stats about chunks (total, completed, in_progress, failed)
        """
        from sqlalchemy import func, select
        
        stats = {
            "total": 0,
            "completed": 0,
            "in_progress": 0,
            "failed": 0,
            "queued": 0
        }
        
        try:
            # Get total count
            result = await self.db.execute(
                select(func.count()).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id
                )
            )
            stats["total"] = result.scalar() or 0
            
            # Get completed count
            result = await self.db.execute(
                select(func.count()).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id,
                    Chunk_on_db.status == JobStatus.FINISHED
                )
            )
            stats["completed"] = result.scalar() or 0
            
            # Get in progress count
            result = await self.db.execute(
                select(func.count()).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id,
                    Chunk_on_db.status == JobStatus.RUNNING
                )
            )
            stats["in_progress"] = result.scalar() or 0
            
            # Get failed count
            result = await self.db.execute(
                select(func.count()).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id,
                    Chunk_on_db.status == JobStatus.FAILED
                )
            )
            stats["failed"] = result.scalar() or 0
            
            # Get queued count
            result = await self.db.execute(
                select(func.count()).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id,
                    Chunk_on_db.status == JobStatus.QUEUED
                )
            )
            stats["queued"] = result.scalar() or 0
            
            return stats
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error getting chunk stats: {str(e)}"
            )
    
    
    async def GetJobChunks(self, job_id: uuid.UUID) -> List[Chunk_on_db]:
        """
        Get all chunks for a job

        Parameters:
        -----------
        job_id : uuid.UUID
            The UUID of the job to get chunks for

        Returns:
        --------
        List[Chunk_on_db]
            A list of Chunk_on_db objects for the job
        """
        from sqlalchemy import select

        try:
            # Get all chunks for this job
            result = await self.db.execute(
                select(Chunk_on_db).where(
                    Chunk_on_db.job_id == job_id,
                    Chunk_on_db.user_id == self.user.id
                ).order_by(Chunk_on_db.chunk_index)
            )
            chunks = list(result.scalars().all())

            if not chunks:
                raise HTTPException(
                    status_code=404,
                    detail=f"No chunks found for job {job_id}"
                )

            return chunks

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Error getting job chunks: {str(e)}"
            )
                
