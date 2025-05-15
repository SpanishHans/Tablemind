from pydantic import BaseModel

class AddPayload(BaseModel):
    x: int
    y: int
