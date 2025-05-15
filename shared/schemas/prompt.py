from pydantic import BaseModel, Field
import uuid

class PromptBase(BaseModel):
    id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    class Config:
        from_attributes = True

class PromptIO(PromptBase):
    prompt_text: str = Field(..., min_length=3, max_length=10000, examples=["Please provide a detailed explanation of how quantum mechanics is revolutionizing technology, including examples of its applications in computing and healthcare."])
