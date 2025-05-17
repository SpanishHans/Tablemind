import os
from typing import List
import uuid

from fastapi import APIRouter, Depends, UploadFile, Query, Form
from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser
from shared.utils.media import MediaUtils
from shared.models.resources import MediaType

from shared.handlers.media import MediaHandler
from shared.schemas.media import ResponseMedia
from shared.schemas.generic import ResponseMessage

router = APIRouter(tags=["Archivos"], prefix = '/media')

BASE_UPLOAD_DIR = os.getenv("BASE_UPLOAD_DIR", "/app/uploads")

os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)



@router.get("/fetch/one", response_class=FileResponse)
async def get_media(
    media_id: uuid.UUID = Query(..., description="UUID del media a obtener"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileRead(media_id)



@router.get("/fetch/all", response_model=List[ResponseMedia])
async def get_all_media(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileReadAll()



@router.post("/upload/tabular", response_model=ResponseMedia)
async def upload_tabular(
    file: UploadFile = Depends(MediaUtils().validate_file(allowed_types=[
        MediaType.TABLE_EXCEL,
        MediaType.TABLE_OPEN,
        MediaType.TABLE_CSV,
        MediaType.TABLE_TSV
    ])),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileCreate(file)



@router.post("/upload/media", response_model=ResponseMedia)
async def upload_media(
    file: UploadFile = Depends(MediaUtils().validate_file(allowed_types=[
        MediaType.IMAGE_PNG,
        MediaType.IMAGE_JPEG,
        MediaType.VIDEO_MP4
    ])),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileCreate(file)



@router.put("/edit", response_model=ResponseMedia)
async def edit_media(
    media_id: uuid.UUID = Form(..., description="UUID del media a editar"),
    filename: str = Form(..., description="Nuevo nombre"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileRename(id=media_id,new_filename=filename)



@router.delete("/delete/", response_model=ResponseMessage)
async def delete_media(
    media_id: uuid.UUID = Form(..., description="UUID del media a eliminar"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=BASE_UPLOAD_DIR, current_user=current_user).FileDelete(media_id)
