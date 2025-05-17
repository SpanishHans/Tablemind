from pydantic import BaseModel, Field
from typing import Optional
from fastapi import Form, Query
import uuid

class ResponseJob(BaseModel):
    filename: str = Field(..., examples=['filename.xlsx'])
    modelname: str = Field(..., examples=['model_name'])
    verbosity: float = Field(..., ge=0.2, le=2, description='Verbosidad de output: Conciso o Detallado')
    granularity: str = Field(..., description='Tipo de contexto: fila completa o columna específica')
    estimated_input_tokens: int = Field(..., description='Cantidad estimada de tokens de entrada')
    estimated_output_tokens: int = Field(..., description='Cantidad estimada de tokens de salida')
    cost_per_1m_input: int = Field(..., description='Costo por millón de tokens de entrada')
    cost_per_1m_output: int = Field(..., description='Costo por millón de tokens de salida')
    handling_fee: int = Field(..., description='Tarifa de manejo')
    estimated_cost: float = Field(..., description='Costo estimado')



class FormParams(BaseModel):
    prompt_id: uuid.UUID = Field(..., description='UUID del prompt')
    media_id: uuid.UUID = Field(..., description='UUID del archivo')
    model_id: uuid.UUID = Field(..., description='UUID del modelo')
    focus_column: Optional[str] = Field(None, description='Columna para modo celda.')

    @classmethod
    def as_form(cls, 
                prompt_id: uuid.UUID = Form(...),
                media_id: uuid.UUID = Form(...),
                model_id: uuid.UUID = Form(...),
                focus_column: Optional[str] = Form(None)):
        return cls(
            prompt_id=prompt_id,
            media_id=media_id,
            model_id=model_id,
            focus_column=focus_column
        )

class QueryParams(BaseModel):
    granularity: str = Field(..., description='Tipo de contexto: fila completa o columna específica')
    verbosity: float = Field(..., ge=0.1, le=2, description='Verbosidad de output: Conciso o Detallado')
    chunk_size: int = Field(..., description='Cantidad de filas en trabajo')

    @classmethod
    def as_query(cls,
                 granularity: str = Query(...),
                 verbosity: float = Query(..., ge=0.1, le=2),
                 chunk_size: int = Query(...)):
        return cls(
            granularity=granularity,
            verbosity=verbosity,
            chunk_size=chunk_size
        )
