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
from shared.schemas.media import MediaIO
from shared.schemas.generic import ResponseMessage

router = APIRouter(tags=["Archivos"], prefix = '/media')

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)



@router.get("/fetch/one", response_class=FileResponse)
async def get_media(
    id: uuid.UUID = Query(..., description="UUID del media a obtener"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileRead(id)



@router.get("/fetch/all", response_model=List[MediaIO])
async def get_all_media(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileReadAll()



@router.post("/upload/tabular", response_model=MediaIO)
async def upload_tabular(
    file: UploadFile = Depends(MediaUtils().validate_file_type(allowed_types=[
        MediaType.TABLE_EXCEL,
        MediaType.TABLE_OPEN,
        MediaType.TABLE_CSV,
        MediaType.TABLE_TSV
    ])),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileCreate(file)



@router.post("/upload/media", response_model=MediaIO)
async def upload_media(
    file: UploadFile = Depends(MediaUtils().validate_file_type(allowed_types=[
        MediaType.IMAGE_PNG,
        MediaType.IMAGE_JPEG,
        MediaType.VIDEO_MP4
    ])),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileCreate(file)



@router.put("/edit", response_model=MediaIO)
async def edit_media(
    id: uuid.UUID = Form(..., description="UUID del media a editar"),
    filename: str = Form(..., description="Nuevo nombre"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileRename(id=id,new_filename=filename)



@router.delete("/delete/", response_model=ResponseMessage)
async def delete_media(
    id: uuid.UUID = Form(..., description="UUID del media a eliminar"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await MediaHandler(db=db, upload_dir=UPLOAD_DIR, current_user=current_user).FileDelete(id)
