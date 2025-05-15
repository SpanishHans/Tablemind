from pydantic import BaseModel, Field
import uuid

class MediaBase(BaseModel):
    id: uuid.UUID = Field(..., examples=[uuid.uuid4()])
    class Config:
        from_attributes = True

class MediaIO(MediaBase):
    media_type: str = Field(..., examples=["image/png", "image/jpeg", "video/mp4"])
