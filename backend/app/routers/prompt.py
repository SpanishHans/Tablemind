import os
from typing import List
import uuid

from fastapi import APIRouter, Depends, Query, Form

from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser

from shared.handlers.prompt import PromptHandler
from shared.schemas.prompt import RequestPrompt, ResponsePrompt, validate_prompt
from shared.schemas.generic import ResponseMessage

router = APIRouter(tags=["Prompts"], prefix = '/prompt')

@router.post("/new", response_model=ResponsePrompt)
async def upload_media(
    prompt: RequestPrompt = Depends(validate_prompt),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptCreate(prompt.prompt_text)



@router.get("/fetch/one", response_model=ResponsePrompt)
async def get_media(
    prompt_id: uuid.UUID = Query(..., description="UUID del prompt a obtener"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptRead(prompt_id)



@router.get("/fetch/all", response_model=List[ResponsePrompt])
async def get_all_media(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptReadAll()



@router.put("/update/", response_model=ResponsePrompt)
async def replace_media(
    prompt_id: uuid.UUID = Form(...,description='UUID del prompt a modificar'),
    prompt_text: str = Form(...,description='Nueva tarea a realizar'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptUpdate(prompt_id, prompt_text)



@router.delete("/delete/", response_model=ResponseMessage)
async def delete_media(
    prompt_id: uuid.UUID = Form(...,description='UUID del prompt a eliminar'),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await PromptHandler(db=db, current_user=current_user).PromptDelete(prompt_id)
