import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.utils.text import TextUtils

from shared.ops.prompt import PromptDb
from shared.schemas.prompt import ResponsePrompt
from shared.schemas.generic import ResponseMessage

class PromptHandler:
    def __init__(self, db: AsyncSession, current_user: CurrentUser):
        self.db = db
        self.user = current_user
        self.textutils = TextUtils()
        self.promptondb = PromptDb(self.db, self.user)



    async def PromptCreate(self, prompt_str: str) -> ResponsePrompt:
        prompt_text = self.textutils.sanitize_text(prompt_str)
        hash = self.textutils.generate_text_hash(prompt_str)

        dup = await self.promptondb.check_prompt_duplicity(hash)
        if dup:
            new_prompt = await self.promptondb.update_prompt_entry(id= dup.id, prompt_text=prompt_text, hash=hash)
            return ResponsePrompt(
                prompt_id=new_prompt.id)

        prompt = await self.promptondb.create_prompt_entry(prompt_text, hash)
        return ResponsePrompt(
            prompt_id=prompt.id)



    async def PromptUpdate(self, id: uuid.UUID, prompt_str: str) -> ResponsePrompt:
        prompt_text = self.textutils.sanitize_text(prompt_str)
        hash = self.textutils.generate_text_hash(prompt_str)

        dup = await self.promptondb.check_prompt_duplicity(hash)
        if dup:
            new_prompt = await self.promptondb.update_prompt_entry(id= dup.id, prompt_text=prompt_text, hash=hash)
            return ResponsePrompt(
                prompt_id=new_prompt.id)

        prompt = await self.promptondb.update_prompt_entry(id, prompt_text, hash)
        return ResponsePrompt(
            prompt_id=prompt.id)



    async def PromptRead(self, id: uuid.UUID) -> ResponsePrompt:

        prompt = await self.promptondb.get_prompt_entry(id)
        return ResponsePrompt(
            prompt_id=prompt.id)



    async def PromptReadAll(self) -> List[ResponsePrompt]:

        mediaqueries = await self.promptondb.get_all_prompt_entries()
        prompts = []
        for i in mediaqueries:
            prompts.append(ResponsePrompt(prompt_id=i.id))
        return prompts



    async def PromptDelete(self, id: uuid.UUID) -> ResponseMessage:
        await self.promptondb.delete_prompt_entry(id)
        return ResponseMessage(message="Prompt eliminado correctamente")
