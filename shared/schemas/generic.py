from pydantic import BaseModel, Field

##############################################################################################
# --- Generic Message ---
##############################################################################################
class ResponseMessage(BaseModel):
    message: str = Field(..., min_length=2, max_length=255, examples=["Un mensaje de ejemplo"])