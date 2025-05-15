import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.utils.text import TextUtils

from shared.ops.prompt import PromptDb
from shared.schemas.prompt import PromptIO
from shared.schemas.generic import ResponseMessage

class PromptHandler:
    def __init__(self, db: AsyncSession, current_user: CurrentUser):
        self.db = db
        self.user = current_user
        self.textutils = TextUtils()
        self.promptondb = PromptDb(self.db, self.user)



    async def PromptCreate(self, prompt_str: str) -> PromptIO:
        prompt_text = self.textutils.sanitize_text(prompt_str)
        hash = self.textutils.generate_text_hash(prompt_str)

        dup = await self.promptondb.check_prompt_duplicity(hash)
        if dup:
            new_prompt = await self.promptondb.update_prompt_entry(id= dup.id, prompt_text=prompt_text, hash=hash)
            return PromptIO(
                id=new_prompt.id,
                prompt_text=new_prompt.prompt_text)

        prompt = await self.promptondb.create_prompt_entry(prompt_text, hash)
        return PromptIO(
            id=prompt.id,
            prompt_text=prompt.prompt_text)



    async def PromptUpdate(self, id: uuid.UUID, prompt_str: str) -> PromptIO:
        prompt_text = self.textutils.sanitize_text(prompt_str)
        hash = self.textutils.generate_text_hash(prompt_str)

        dup = await self.promptondb.check_prompt_duplicity(hash)
        if dup:
            new_prompt = await self.promptondb.update_prompt_entry(id= dup.id, prompt_text=prompt_text, hash=hash)
            return PromptIO(
                id=new_prompt.id,
                prompt_text=new_prompt.prompt_text)

        prompt = await self.promptondb.update_prompt_entry(id, prompt_text, hash)
        return PromptIO(
            id=prompt.id,
            prompt_text=prompt.prompt_text)



    async def PromptRead(self, id: uuid.UUID) -> PromptIO:

        prompt = await self.promptondb.get_prompt_entry(id)
        return PromptIO(
            id=prompt.id,
            prompt_text=prompt.prompt_text)



    async def PromptReadAll(self) -> List[PromptIO]:

        mediaqueries = await self.promptondb.get_all_prompt_entries()
        prompts = []
        for i in mediaqueries:
            prompts.append(PromptIO(
                id=i.id,
                prompt_text=i.prompt_text,
            ))
        return prompts



    async def PromptDelete(self, id: uuid.UUID) -> ResponseMessage:
        await self.promptondb.delete_prompt_entry(id)
        return ResponseMessage(message="Prompt eliminado correctamente")
