import os
from typing import List
import uuid

from fastapi import APIRouter, Depends, Query, Form

from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser

from shared.handlers.prompt import PromptHandler
from shared.schemas.prompt import PromptIO
from shared.schemas.generic import ResponseMessage

router = APIRouter(tags=["Prompts"], prefix = '/prompt')

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/new", response_model=PromptIO)
async def upload_media(
    prompt_text: str = Form(...,description='Tarea a realizar con la IA'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptCreate(prompt_text)



@router.get("/fetch/one", response_model=PromptIO)
async def get_media(
    id: uuid.UUID = Query(..., description="UUID del prompt a obtener"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptRead(id)



@router.get("/fetch/all", response_model=List[PromptIO])
async def get_all_media(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptReadAll()



@router.put("/update/", response_model=PromptIO)
async def replace_media(
    id: uuid.UUID = Form(...,description='UUID del prompt a modificar'),
    prompt_text: str = Form(...,description='Nueva tarea a realizar'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptUpdate(id, prompt_text)



@router.delete("/delete/", response_model=ResponseMessage)
async def delete_media(
    id: uuid.UUID = Form(...,description='UUID del prompt a eliminar'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptDelete(id)
