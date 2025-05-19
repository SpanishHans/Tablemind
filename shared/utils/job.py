import uuid
from typing import Optional, List, Tuple
import pandas as pd
import json
from enum import Enum

from google import genai

from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from shared.models.resources import MediaType
from shared.models.job import GranularityLevel, JobStatus, Chunk_on_db
from shared.models.resources import Model_on_db
from shared.utils.text import TextUtils



class OutputVerbosity(Enum):
    MINIMAL = 0.2
    CONCISE = 0.45
    BALANCED = 0.75
    DESCRIPTIVE = 1.1
    VERBOSE = 1.5
    
    def __str__(self):
            return self.name  # Now FastAPI uses the key for parsing



class JobUtils:
    def load_dataframe(self, filepath: str, media_type: MediaType) -> pd.DataFrame:
        try:
            if media_type == MediaType.TABLE_CSV:
                return pd.read_csv(filepath)

            elif media_type == MediaType.TABLE_TSV:
                return pd.read_csv(filepath, sep="\t")

            elif media_type == MediaType.TABLE_EXCEL:
                return pd.read_excel(filepath, engine="openpyxl")

            elif media_type == MediaType.TABLE_OPEN:
                return pd.read_excel(filepath, engine="odf")

            else:
                raise HTTPException(status_code=400, detail=f"Unsupported media type: {media_type}")

        except (ValueError, FileNotFoundError, pd.errors.ParserError, SQLAlchemyError) as e:
            raise HTTPException(status_code=500, detail=f"Error loading file: {str(e)}")
    
    

    def estimate_google(
        self,
        data: str,
        api_key: str,
        model_encoder: str,
    ):
        try:
            contents_to_send = [
                {
                    "role": "user",
                    "parts": [{"text": data}]
                }
            ]

            client = genai.Client(api_key=api_key)
            response = client.models.count_tokens(
                model=model_encoder, 
                contents=contents_to_send
            )
            return response.total_tokens

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"No se pudo contar el número de tokens: {str(e)}")


    
    def provider_picker(self, model: Model_on_db, content: str, api_key:str) -> int:
        total_tokens = 0
        if model.provider == "Google":
            try:
                total_tokens += self.estimate_google(data=content, api_key=api_key, model_encoder=model.encoder)
                return total_tokens
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"No se pudo contar el número de tokens con Google: {str(e)}")
        elif model.provider == "OpenAI":
            try:
                # For now, use the Google method for all providers since we don't have OpenAI-specific method yet
                total_tokens += self.estimate_google(data=content, api_key=api_key, model_encoder=model.encoder)
                return total_tokens
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"No se pudo contar el número de tokens con OpenAI: {str(e)}")
        else:
            # Default estimation: assume 4 characters per token as a fallback
            return len(content) // 4
        



    def estimate_input_tokens(
        self,
        df: pd.DataFrame,
        model: Model_on_db,
        api_key,
        prompt_text: str,
        granularity: GranularityLevel = GranularityLevel.PER_ROW,
        focus_column: Optional[str] = None,
        sample_size: int = 5
    ) -> int:
        if df.empty:
            return 0
    
        sample = df.sample(n=min(sample_size, len(df)))
    
        total_sample_tokens = 0
        for _, row in sample.iterrows():
            if granularity == GranularityLevel.PER_CELL:
                if not focus_column or focus_column not in df.columns:
                    raise ValueError("focus_column must be provided and valid for PER_CELL granularity")
                content = str(row[focus_column])
            else:
                content = str(row.to_dict())
    
            content = f"{prompt_text}\n{content}"
            total_sample_tokens += self.provider_picker(model, content, api_key)
    
        avg_tokens_per_row = total_sample_tokens / len(sample)
        return int(avg_tokens_per_row * len(df))



    def estimate_output_tokens(
        self,
        input_tokens: int,
        verbosity: float,
        model_max_output_tokens: int
    ) -> Tuple[int, str]:
        total_tokens = int(input_tokens * round(verbosity, 2))
    
        if total_tokens > model_max_output_tokens:
            raise HTTPException(
                status_code=400,
                detail=f"⚠️ Cantidad de tokens ({total_tokens}) supera el máximo permitido ({model_max_output_tokens}). Considera reducir la verbosidad."
            )
    
        if total_tokens > model_max_output_tokens * 0.8:
            risk_level = "medium"
        else:
            risk_level = "low"
    
        return total_tokens, risk_level




class ChunkUtils:
    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    def split(self, df:pd.DataFrame, chunk_size:int) -> List[pd.DataFrame]:
        return [
            df.iloc[i:i + chunk_size]
            for i in range(0, df.shape[0], chunk_size)
        ]

    def format(self, df_chunk: pd.DataFrame, granularity: GranularityLevel, focus_column:str) -> List[dict]:
        formatted = []
        for idx, row in df_chunk.iterrows():
            if granularity == GranularityLevel.PER_ROW:
                formatted.append({
                    "row": idx,
                    "data": row.to_dict(),
                })
            elif granularity == GranularityLevel.PER_CELL:
                formatted.append({
                    "row": idx,
                    "data": row[f"{focus_column}"],
                })
        return formatted


    async def store(
            self,
            job_id: uuid.UUID,
            user_id: uuid.UUID,
            granularity: GranularityLevel,
            df:pd.DataFrame,
            chunk_size:int,
            focus_column:str
        ) -> None:

        self.job_id = job_id

        chunks = self.split(df, chunk_size)

        for i, df_chunk in enumerate(chunks):
            formatted_data = self.format(df_chunk, granularity, focus_column)
            chunk_data_str = json.dumps(formatted_data, sort_keys=True)
            chunk_hash = TextUtils().generate_text_hash(f"{job_id}_{i}_{chunk_data_str}")
            
            chunk = Chunk_on_db(
                job_id=self.job_id,
                user_id=user_id,
                chunk_index=i,
                total_rows=len(df_chunk),
                row_range=f"{df_chunk.index[0]}-{df_chunk.index[-1]}",
                source_data=formatted_data,
                granularity=granularity,
                status=JobStatus.QUEUED,
                hash=chunk_hash,
            )
            self.db.add(chunk)
        await self.db.commit()
