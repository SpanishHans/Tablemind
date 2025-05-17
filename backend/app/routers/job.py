import os
import uuid

from typing import Optional

from fastapi import APIRouter, Depends, Form, Query

from sqlalchemy.ext.asyncio import AsyncSession

from celery import Celery

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser
from shared.models.job import GranularityLevel

from shared.schemas.dispatcher import AddPayload
from shared.schemas.job import ResponseJob, FormParams, QueryParams
from shared.handlers.job import JobHandler

HOST_REDS = os.getenv("HOST_REDS", "redis")

REDIS_URL_BROKER = f"redis://{HOST_REDS}:6379/0"
REDIS_URL_BACKEND = f"redis://{HOST_REDS}:6379/1"

router = APIRouter(tags=["Jobs"], prefix = '/job')
dispatcher = Celery(
    "worker",
    broker=REDIS_URL_BROKER,
    backend=REDIS_URL_BACKEND,
)



@router.post("/estimar", response_model=ResponseJob)
async def create_job(
    form_params: FormParams = Depends(FormParams.as_form),
    query_params: QueryParams = Depends(QueryParams.as_query),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await JobHandler(db=db, current_user=current_user).EstimateJob(
        prompt_id=form_params.prompt_id, 
        media_id=form_params.media_id, 
        model_id=form_params.model_id,
        focus_column=form_params.focus_column,
        granularity=GranularityLevel[query_params.granularity],
        verbosity=query_params.verbosity,
        chunk_size=query_params.chunk_size,
    )



@router.post("/test-add")
async def test_add(
    payload: AddPayload,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    pass
