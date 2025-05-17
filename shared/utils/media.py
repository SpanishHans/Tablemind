import re
import hashlib
from fastapi import HTTPException, UploadFile
import unicodedata

from typing import List
from fastapi import File

from shared.models.resources import MediaType

class MediaUtils:
    def sanitize_filename(self, text: str) -> str:
        """
        Sanitize a filename by removing unsafe characters and patterns.
        Prevents directory traversal, control characters, and other unsafe inputs.
        """
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="El nombre del archivo no puede estar vacío.")
    
        text = unicodedata.normalize("NFKC", text)
        text = re.sub(r'[<>:"/\\|?*]', '_', text)  # Replace unsafe file chars
        text = re.sub(r'[\x00-\x1f\x7f]', '', text)  # Remove control characters
        text = text.replace(" ", "_")
        text = re.sub(r'_+', '_', text)
        text = text.strip('_')
    
        if not text or text in {'.', '..'}:
            raise HTTPException(status_code=400, detail="Nombre de archivo inválido.")
    
        if len(text) > 255:
            raise HTTPException(status_code=400, detail="El nombre del archivo excede el límite de 255 caracteres.")
    
        return text



    def check_file_type(self, filetype: str) -> MediaType:
        """Validate and return the MediaType enum if allowed, otherwise raise error."""
        if not filetype:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Archivo sin formato.",
                    "content_type": filetype,
                    "allowed": [m.value for m in MediaType]
                }
            )
        elif filetype not in MediaType._value2member_map_:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Formato de archivo no soportado.",
                    "content_type": filetype,
                    "allowed": [m.value for m in MediaType]
                }
            )
        else:
            return MediaType(filetype)



    def determine_subpath(self, filetype: MediaType):
        """Determine the file type based on its extension."""
        if filetype in {MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG}:
            return "images"
        elif filetype == MediaType.VIDEO_MP4:
            return "videos"
        elif filetype in {
            MediaType.TABLE_EXCEL,
            MediaType.TABLE_OPEN,
            MediaType.TABLE_CSV,
            MediaType.TABLE_TSV,
        }:
            return "tables"
        else:
            raise HTTPException(status_code=400, detail="MediaType desconocido.")



    # def check_user_quota(self, filesize: int, user) -> None:
    #     if user.freespace + filesize > MediaQuota(user.user_type):
    #         raise HTTPException(status_code=403, detail="No tienes suficiente espacio en tu cuota de almacenamiento.")



    def generate_file_hash(self, file: UploadFile) -> tuple[str, int]:
        """Stream file content to generate a memory-efficient SHA-256 hash."""
        try:
            hasher = hashlib.sha256()
            total_size = 0
            while chunk := file.file.read(8192):
                hasher.update(chunk)
                total_size += len(chunk)
            file.file.seek(0)

            if total_size == 0:
                raise HTTPException(status_code=400, detail="Archivo vacío.")

            return hasher.hexdigest(), total_size
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en generación de hash: {str(e)}")
    
    
    
    def validate_file(self, allowed_types: List[str]):
        async def validator(file: UploadFile = File(...)) -> UploadFile:
            if not file:
                raise HTTPException(
                    status_code=400,
                    detail="No se ha proporcionado ningún archivo."
                )
            if not file.filename:
                raise HTTPException(
                    status_code=400,
                    detail="El archivo no tiene nombre."
                )
            if not file.content_type:
                raise HTTPException(
                    status_code=400,
                    detail="No se pudo determinar el tipo de contenido del archivo."
                )
            if file.content_type not in allowed_types:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "error": "Tipo de archivo no permitido.",
                        "content_type": file.content_type,
                        "allowed": allowed_types
                    }
                )
            return file
        return validator

