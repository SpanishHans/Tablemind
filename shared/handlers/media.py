import uuid
import os
from typing import List

from fastapi import UploadFile
from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.utils.text import TextUtils
from shared.utils.media import MediaUtils

from shared.ops.media import MediaDb, MediaDisk
from shared.schemas.media import ResponseMedia
from shared.schemas.generic import ResponseMessage

class MediaHandler:
    def __init__(self, db: AsyncSession, upload_dir: str, current_user: CurrentUser):
        self.db = db
        self.path = upload_dir
        self.user = current_user

        self.mediautils = MediaUtils()
        self.textutils = TextUtils()
        self.mediaondb = MediaDb(self.db)
        self.mediaondisk = MediaDisk()



    async def FileCreate(self, file: UploadFile) -> ResponseMedia:
        assert file.filename is not None, "File must have a filename"
        assert file.content_type is not None, "File must have a content type"
        filename = self.mediautils.sanitize_filename(file.filename)
        filetype = self.mediautils.check_file_type(file.content_type)
        filehash, filesize = self.mediautils.generate_file_hash(file)
        subpath = self.mediautils.determine_subpath(filetype)
        filepath = os.path.join(self.path, str(self.user.id), subpath)

        existing_file = await self.mediaondb.check_duplicity(self.user.id, filehash)
        if existing_file:
            await self.mediaondisk.rename_file(user_id=self.user.id, old_filename=existing_file.filename, new_filename=filename, filepath=existing_file.filepath)
            await self.mediaondb.update_media_entry(id=existing_file.id, owner=self.user.id, filename=filename)
            return ResponseMedia(media_id=existing_file.id)


        media = await self.mediaondb.create_media_entry(
                owner=self.user.id,
                filetype=filetype,
                filename=filename,
                filepath=filepath,
                filehash=filehash
            )
        file.file.seek(0)
        await self.mediaondisk.save_file(self.user.id, file, filename, media.filepath)
        return ResponseMedia(media_id=media.id)
    
    
    
    async def FileRename(self, id: uuid.UUID, new_filename: str) -> ResponseMedia:
        filename = self.mediautils.sanitize_filename(new_filename)
        media = await self.mediaondb.get_media_entry(id=id, owner=self.user.id)
        
        if media.filename == filename:
            return ResponseMedia(media_id=media.id)

        await self.mediaondisk.rename_file(
            user_id=self.user.id,
            old_filename=media.filename,
            new_filename=filename,
            filepath=media.filepath
        )
        updated_media = await self.mediaondb.update_media_entry(
            id=media.id,
            owner=self.user.id,
            filename=filename
        )
        return ResponseMedia(media_id=updated_media.id)



    async def FileRead(self, id: uuid.UUID) -> FileResponse:
        media = await self.mediaondb.get_media_entry(id=id, owner=self.user.id)
        return FileResponse(
            path=f'{media.filepath}/{media.filename}',
            media_type=media.media_type,
            filename=media.filename
        )



    async def FileReadAll(self) -> List[ResponseMedia]:

        mediaqueries = await self.mediaondb.get_all_media_entries(owner=self.user.id)
        medias = []
        for i in mediaqueries:
            medias.append(ResponseMedia(media_id=i.id))
        return medias



    async def FileDelete(self, id: uuid.UUID) -> ResponseMessage:
        media = await self.mediaondb.get_media_entry(id=id, owner=self.user.id)
        filepath = media.filepath
        filename = media.filename

        await self.mediaondb.delete_media_entry(id=id, owner=self.user.id)
        await self.mediaondisk.delete_file(self.user.id, filename, filepath)
        return ResponseMessage(message="Archivo eliminado correctamente")
