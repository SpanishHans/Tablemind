import os
import aiofiles
import uuid
from datetime import datetime
from typing import Sequence, Optional

from fastapi import UploadFile, HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models.resources import File_on_db, MediaType
from shared.schemas.generic import ResponseMessage

class MediaDb:
    def __init__(self, db: AsyncSession):
        self.db = db



    async def check_duplicity(self, owner:uuid.UUID, filehash: str) -> Optional[File_on_db]:
        """Generate a hash for the file and check if it already exists in the database"""
        try:
            result = await self.db.execute(
                select(File_on_db).where(
                    File_on_db.filehash == filehash,
                    File_on_db.user_id == owner
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error revisando duplicidad de archivo: {str(e)}"
            )



    async def get_media_entry(self, id: uuid.UUID, owner:uuid.UUID) -> Optional[File_on_db]:
        """Create an entry in the database for the uploaded file"""
        try:
            result = await self.db.execute(
                select(File_on_db).where(
                    File_on_db.id == id,
                    File_on_db.user_id == owner,
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo media desde db: {str(e)}"
            )
    
    
    
    async def get_all_media_entries(self, owner:uuid.UUID) -> Sequence[File_on_db]:
        """Create an entry in the database for the uploaded file"""
        try:
            result = await self.db.execute(
                select(File_on_db).where(
                    File_on_db.user_id == owner,
                )
            )
            existing_media = result.scalars().all()
            if not existing_media:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
            return existing_media
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo varios media desde db: {str(e)}"
            )



    async def create_media_entry(self, owner:uuid.UUID, filetype:MediaType, filename:str, filepath: str, filehash: str) -> File_on_db:
        """Create an entry in the database for the uploaded file"""
        media = File_on_db(
            user_id=owner,
            created_at=datetime.utcnow(),
            media_type=filetype.name,
            filename=filename,
            filepath=filepath,
            filehash=filehash
        )
        try:
            self.db.add(media)
            await self.db.commit()
            await self.db.refresh(media)
            return media
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error creando el archivo en db: {str(e)}")



    async def update_media_entry(self,
            id: uuid.UUID,
            owner: uuid.UUID,
            filetype: Optional[MediaType] = None,
            filename: Optional[str] = None,
            filepath: Optional[str] = None,
            filehash: Optional[str] = None
        ) -> File_on_db:
        """Create an entry in the database for the uploaded file"""
        try:
            result = await self.db.execute(
                select(File_on_db).where(
                    File_on_db.id == id,
                    File_on_db.user_id == owner,
                )
            )
            media = result.scalar_one_or_none()
            if not media:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo media desde db: {str(e)}"
            )
            
        if filetype is not None:
            media.media_type = filetype
        if filename is not None:
            media.filename = filename
        if filehash is not None:
            media.filehash = filehash
        if filepath is not None:
            media.filepath = filepath

        try:
            await self.db.commit()
            await self.db.refresh(media)
            return media
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error actualizando el archivo: {str(e)}")



    async def delete_media_entry(self, id: uuid.UUID, owner:uuid.UUID) -> None:
        """Create an entry in the database for the uploaded file"""
        try:
            result = await self.db.execute(
                select(File_on_db).where(
                    File_on_db.id == id,
                    File_on_db.user_id == owner,
                )
            )
            media = result.scalar_one_or_none()
            if not media:
                raise HTTPException(status_code=400, detail="El archivo no existe.")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error adquiriendo media desde db: {str(e)}"
            )

        try:
            await self.db.delete(media)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error eliminando el archivo: {str(e)}")



class MediaDisk:
    async def save_file(
            self,
            user_id: uuid.UUID,
            file: UploadFile,
            filename: str,
            filepath: str,
        ) -> ResponseMessage:
        """Save the file to disk"""

        if not filename:
            raise HTTPException(status_code=400, detail="No se ha proporcionado un nombre de archivo.")

        os.makedirs(filepath, exist_ok=True)

        file_path = os.path.join(filepath, filename)

        try:
            async with aiofiles.open(file_path, "wb") as f:
                while chunk := await file.read(1024 * 1024):
                    await f.write(chunk)
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error inesperado al guardar el archivo: {str(e)}")

        return ResponseMessage(message="Archivo guardado exitosamente.")



    async def rename_file(
            self,
            user_id: uuid.UUID,
            old_filename: str,
            new_filename: str,
            filepath: str,
        ) -> ResponseMessage:
        """Overwrite the file to disk"""

        if not new_filename:
            raise HTTPException(status_code=400, detail="No se ha proporcionado un nombre de archivo.")

        old_file_path = os.path.join(filepath, old_filename)
        new_file_path = os.path.join(filepath, new_filename)

        try:
            os.rename(old_file_path, new_file_path)
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"Error al renombrar el archivo: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error inesperado al guardar el archivo: {str(e)}")

        return ResponseMessage(message="Archivo guardado exitosamente.")



    async def delete_file(
            self,
            user_id: uuid.UUID,
            filename: str,
            filepath: str,
        ) -> ResponseMessage:
        """Save the file to disk"""

        if not filename:
            raise HTTPException(status_code=400, detail="No se ha proporcionado un nombre de archivo.")
        file_path = os.path.join(filepath, filename)

        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return ResponseMessage(message="Archivo eliminado exitosamente.")
            else:
                raise HTTPException(status_code=404, detail="Archivo no encontrado")
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar el archivo: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error inesperado al eliminar el archivo: {str(e)}")
