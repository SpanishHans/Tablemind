from pydantic import BaseModel, Field
import uuid

from shared.models.job import JobStatus

class JobBase(BaseModel):
    id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    class Config:
        from_attributes = True

class JobIO(JobBase):
    user_id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    model_id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    prompt_id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    media_id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    job_status: JobStatus = Field(..., examples=[JobStatus.QUEUED])
    cost_estimate_usd: int = Field(..., examples=[100413413])
    input_token_count: int = Field(..., examples=[24642646])
    output_token_count: int = Field(..., examples=[68464])
    hash: str = Field(..., examples=["f7a92de6b4c80e70da38e31fe8c4d16ab0d7d92e6e730e57c7413e7d3f8db429"])