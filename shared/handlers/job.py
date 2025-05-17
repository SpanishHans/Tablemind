import os
import uuid
from typing import List, Optional, cast

from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser

from shared.utils.text import TextUtils
from shared.utils.media import MediaUtils
from shared.utils.job import JobUtils, ChunkUtils

from shared.models.job import GranularityLevel, JobStatus

from shared.ops.job import JobDb
from shared.ops.media import MediaDb
from shared.ops.prompt import PromptDb
from shared.ops.model import ModelDb
from shared.ops.user import UsersDb

from shared.schemas.generic import ResponseMessage
from shared.schemas.job import ResponseJob

APIKEYGEMINI = os.getenv("APIKEYGEMINI", "")

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
        ) -> dict:
        prompt = await self.promptondb.get_prompt_entry(prompt_id)
        media = await self.mediaondb.get_media_entry(media_id, self.user.id)
        model = await self.modelondb.get_model_entry(model_id)
        userdata = await self.userondb.get_user_entry(self.user.id)

        if not prompt or not media or not model or not userdata:
            raise HTTPException(status_code=404, detail="No se encontró prompt, media o model")

        price = userdata.user_type.price_per_job

        full_path = os.path.join(media.filepath, media.filename)
        df = self.jobutils.load_dataframe(full_path, media.media_type)

        if granularity == GranularityLevel.PER_CELL and not focus_column:
            raise HTTPException(status_code=400, detail="se requiere focus_column para modo PER_CELL")

        if focus_column and focus_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"No se encontró '{focus_column}' en df.")

        self.input_tokens = self.jobutils.estimate_input_tokens(
            df=df,
            model=model,
            api_keys=APIKEYGEMINI,
            granularity=granularity,
            focus_column=focus_column
        )
        self.output_tokens, self.risk_level = self.jobutils.estimate_output_tokens(
            self.input_tokens,
            verbosity=verbosity,
            model_max_output_tokens=model.max_output_tokens
        )
        self.cost_usd = (((self.input_tokens / 1_000_000) * model.cost_per_1m_input) + \
                        ((self.output_tokens / 1_000_000) * model.cost_per_1m_output)) + \
                        (price)

        return {
            "estimated_input_tokens": self.input_tokens,
            "estimated_output_tokens": self.output_tokens,
            "cost_per_1m_input": model.cost_per_1m_input,
            "cost_per_1m_output": model.cost_per_1m_output,
            "handling_fee": price,
            "estimated_cost": self.cost_usd
        }



    async def JobCreate(
            self,
            granularity: GranularityLevel,
            chunk_size: int,
            focus_column: Optional[str]
        ) -> ResponseJob:
        media = cast(File_on_db, self.media)
        model = cast(Model_on_db, self.model)
        prompt = cast(Prompt_on_db, self.prompt)

        self.hash = self.textutils.generate_text_hash(f"{prompt.id}{media.id}{model.id}")

        dup = await self.jobondb.check_job_duplicity(self.hash)
        if dup:
            new_job = await self.jobondb.update_job_entry(id=dup.id)
            return ResponseJob(
                id=dup.id,
                user_id=self.user.id,
                model_id=model.id,
                prompt_id=prompt.id,
                media_id=media.id,
                job_status=JobStatus.QUEUED,
                cost_estimate_usd=self.cost_usd,
                input_token_count=self.input_tokens,
                output_token_count=self.output_tokens,
                hash=self.hash,
            )

        job = await self.jobondb.create_job_entry(
            model_id=model.id,
            prompt_id=prompt.id,
            media_id=media.id,
            job_status= JobStatus.QUEUED,
            cost_estimate_usd=self.cost_usd,
            input_token_count=self.input_tokens,
            output_token_count=self.output_tokens,
            hash=self.hash,
        )
        return ResponseJob(
            id=job.id,
            user_id=self.user.id,
            model_id=model.id,
            prompt_id=prompt.id,
            media_id=media.id,
            job_status=JobStatus.QUEUED,
            cost_estimate_usd=self.cost_usd,
            input_token_count=self.input_tokens,
            output_token_count=self.output_tokens,
            hash=self.hash,
        )



    async def JobUpdate(self, id: uuid.UUID, job_text: str) -> ResponseJob:
        media = cast(File_on_db, self.media)
        model = cast(Model_on_db, self.model)
        prompt = cast(Prompt_on_db, self.prompt)

        self.job_text = self.textutils.sanitize_text(job_text)
        self.hash = self.textutils.generate_text_hash(job_text)

        job = await self.jobondb.update_job_entry(id=id)
        return ResponseJob(
            id=job.id,
            user_id=self.user.id,
            model_id=model.id,
            prompt_id=prompt.id,
            media_id=media.id,
            job_status=JobStatus.QUEUED,
            cost_estimate_usd=self.cost_usd,
            input_token_count=self.input_tokens,
            output_token_count=self.output_tokens,
            hash=self.hash,
        )



    async def JobRead(self, id: uuid.UUID) -> ResponseJob:
        media = cast(File_on_db, self.media)
        model = cast(Model_on_db, self.model)
        prompt = cast(Prompt_on_db, self.prompt)

        job = await self.jobondb.get_job_entry(id)
        return ResponseJob(
            id=job.id,
            user_id=self.user.id,
            model_id=model.id,
            prompt_id=prompt.id,
            media_id=media.id,
            job_status=JobStatus.QUEUED,
            cost_estimate_usd=self.cost_usd,
            input_token_count=self.input_tokens,
            output_token_count=self.output_tokens,
            hash=self.hash,
        )



    async def JobReadAll(self) -> List[ResponseJob]:
        media = cast(File_on_db, self.media)
        model = cast(Model_on_db, self.model)
        prompt = cast(Prompt_on_db, self.prompt)

        mediaqueries = await self.jobondb.get_all_job_entries()
        jobs = []
        for i in mediaqueries:
            jobs.append(ResponseJob(
                id=i.id,
                user_id=self.user.id,
                model_id=model.id,
                prompt_id=prompt.id,
                media_id=media.id,
                job_status=JobStatus.QUEUED,
                cost_estimate_usd=self.cost_usd,
                input_token_count=self.input_tokens,
                output_token_count=self.output_tokens,
                hash=self.hash,
            ))
        return jobs



    async def JobDelete(self, id: uuid.UUID) -> ResponseMessage:
        await self.jobondb.delete_job_entry(id)
        return ResponseMessage(message="Job eliminado correctamente")
