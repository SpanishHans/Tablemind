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



@router.post("/estimar")
async def create_job(
    prompt_id: uuid.UUID = Form(..., description='UUID del prompt'),
    media_id: uuid.UUID = Form(..., description='UUID del archivo'),
    model_id: uuid.UUID = Form(..., description='UUID del modelo'),
    focus_column: Optional[str] = Form(None, description='Columna para modo celda.'),
    granularity: str = Query(..., description='Tipo de contexto: fila completa o columna específica'),
    chunk_size: int = Query(..., description='Cantidad de filas en trabajo'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await JobHandler(db=db, current_user=current_user).EstimateJob(
        prompt_id=prompt_id, 
        media_id=media_id, 
        model_id=model_id,
        granularity=GranularityLevel[granularity],
        chunk_size=chunk_size,
        focus_column=focus_column
    )



@router.post("/test-add")
async def test_add(
    payload: AddPayload,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    pass
