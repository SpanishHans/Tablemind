import uuid
from typing import List
from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser
from shared.handlers.model import ModelHandler
from shared.schemas.model import RequestModel

router = APIRouter(tags=["Models"], prefix = '/model')

@router.get("/fetch/one", response_model=RequestModel)
async def get_model_details(
    model_id: uuid.UUID = Query(..., description="UUID del modelo a obtener"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await ModelHandler(db=db).ModelRead(model_id)



@router.get("/fetch/all", response_model=List[RequestModel])
async def get_models(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await ModelHandler(db=db).ModelReadAll()