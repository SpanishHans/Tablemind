from pydantic import BaseModel, Field
from typing import Optional
from fastapi import Form, Query
import uuid
from datetime import datetime

class ResponseJob(BaseModel):
    filename: str = Field(..., examples=['filename.xlsx'])
    modelname: str = Field(..., examples=['model_name'])
    verbosity: float = Field(..., ge=0.1, le=2, description='Verbosidad de output: Conciso o Detallado')
    granularity: str = Field(..., description='Tipo de contexto: fila completa o columna específica')
    estimated_input_tokens: int = Field(..., description='Cantidad estimada de tokens de entrada')
    estimated_output_tokens: int = Field(..., description='Cantidad estimada de tokens de salida')
    cost_per_1m_input: int = Field(..., description='Costo por millón de tokens de entrada')
    cost_per_1m_output: int = Field(..., description='Costo por millón de tokens de salida')
    handling_fee: int = Field(..., description='Tarifa de manejo')
    estimated_cost: int = Field(..., description='Costo estimado')
    task_id: Optional[str] = Field(None, description='ID de la tarea en Celery')
    task_status: Optional[str] = Field(None, description='Estado de la tarea')
    job_id: Optional[uuid.UUID] = Field(None, description='UUID del trabajo')
    job_status: Optional[str] = Field(None, description='Estado actual del trabajo')
    created_at: Optional[datetime] = Field(None, description='Fecha de creación')
    completed_at: Optional[datetime] = Field(None, description='Fecha de finalización')

    def dict(self, *args, **kwargs):
        """Override dict method to include all fields"""
        try:
            return super().dict(*args, **kwargs)
        except Exception:
            # Create a simplified dictionary with all fields
            result = {}
            for field_name in self.__fields__:
                try:
                    value = getattr(self, field_name)
                    # Handle UUID serialization
                    if isinstance(value, uuid.UUID):
                        value = str(value)
                    # Handle datetime serialization
                    elif isinstance(value, datetime):
                        value = value.isoformat()
                    result[field_name] = value
                except Exception:
                    result[field_name] = None
            return result


class ResponseJobStatus(BaseModel):
    job_id: str = Field(..., description='UUID del trabajo')
    status: str = Field(..., description='Estado actual del trabajo (QUEUED, RUNNING, FINISHED, etc.)')
    task_status: str = Field(..., description='Estado de la tarea en Celery')
    chunks_total: int = Field(..., description='Número total de chunks en el trabajo')
    chunks_completed: int = Field(..., description='Número de chunks completados')
    chunks_in_progress: int = Field(..., description='Número de chunks en proceso')
    chunks_failed: int = Field(..., description='Número de chunks fallidos')
    created_at: datetime = Field(..., description='Fecha de creación del trabajo')
    completed_at: Optional[datetime] = Field(None, description='Fecha de finalización del trabajo')


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
