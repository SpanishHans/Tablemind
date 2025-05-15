from pydantic import BaseModel, Field
import uuid

class ModelBase(BaseModel):
    id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    class Config:
        from_attributes = True

class ModelIO(ModelBase):
    name: str = Field(..., examples=["image/png", "image/jpeg", "video/mp4"])  # e.g., gpt-4, deepseek-chat, llama3
    provider: str = Field(..., examples=["OpenAI", "Google", "Meta"])  # openai, deepseek, local
    cost_per_1m_input: int = Field(..., examples=[10])
    cost_per_1m_output: int = Field(..., examples=[5])
    max_input_tokens: int = Field(..., examples=[10000000])
    max_output_tokens: int = Field(..., examples=[500000000])
    is_active: bool = Field(..., examples=[True,False])