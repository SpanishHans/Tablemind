from pydantic import BaseModel, Field
from fastapi import Form

import uuid

from shared.utils.text import TextUtils

class ResponsePrompt(BaseModel):
    prompt_id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    class Config:
        from_attributes = True

class RequestPrompt(BaseModel):
    prompt_text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="El texto del prompt.",
        examples=["Dado el texto en la columna Y, generar un texto en la columna Z."]
    )

def validate_prompt(
    prompt_text: str = Form(..., description="El texto del prompt.")
) -> RequestPrompt:
    text = TextUtils().sanitize_text(prompt_text)
    return RequestPrompt(prompt_text=text)
