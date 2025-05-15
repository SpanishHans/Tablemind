import uuid
from typing import Optional, List, Tuple
import pandas as pd
import tiktoken
from enum import Enum

from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from shared.models.resources import MediaType
from shared.models.job import GranularityLevel, JobStatus, Chunk_on_db



class OutputVerbosity(Enum):
    MINIMAL = 0
    CONCISE = 1
    BALANCED = 2
    DESCRIPTIVE = 3
    VERBOSE = 4

GENERATION_PROFILES = {
    OutputVerbosity.MINIMAL: {"multiplier": 0.2, "label": "Minimal"},
    OutputVerbosity.CONCISE: {"multiplier": 0.45, "label": "Concise"},
    OutputVerbosity.BALANCED: {"multiplier": 0.75, "label": "Balanced"},
    OutputVerbosity.DESCRIPTIVE: {"multiplier": 1.1, "label": "Descriptive"},
    OutputVerbosity.VERBOSE: {"multiplier": 1.5, "label": "Verbose"},
}



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



    def estimate_input_tokens(
        self,
        df: pd.DataFrame,
        model_encoder: str,
        model_max_input_tokens: int,
        granularity: GranularityLevel = GranularityLevel.PER_ROW,
        focus_column: Optional[str] = None
    ) -> int:
        enc = tiktoken.encoding_for_model(model_encoder)
        total_tokens = 0

        if granularity == GranularityLevel.PER_ROW:
            for _, row in df.iterrows():
                content = str(row.to_dict())
                total_tokens += len(enc.encode(content))

        elif granularity == GranularityLevel.PER_CELL:
            if focus_column is None or focus_column not in df.columns:
                raise ValueError("focus_column must be provided and valid for PER_CELL granularity")

            for _, row in df.iterrows():
                content = str(row[focus_column])
                total_tokens += len(enc.encode(content))

        return total_tokens



    def estimate_output_tokens(
        self,
        input_tokens: int,
        verbosity: OutputVerbosity,
        model_max_output_tokens: int
    ) -> Tuple[int, str]:
        profile = GENERATION_PROFILES[verbosity]
        total_tokens = int(input_tokens * profile["multiplier"])

        risk_level = "low"

        if total_tokens > model_max_output_tokens:
            raise HTTPException(status_code=400, detail=f"⚠️ Cantidad de tokens ({total_tokens}) supera el máximo seguro de {model_max_output_tokens} tokens. Considera reducir la verbosidad.")
            total_tokens = model_max_output_tokens
            risk_level = "high"
        elif total_tokens > model_max_output_tokens * 0.8:
            risk_level = "medium"

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
            granularity: GranularityLevel,
            df:pd.DataFrame,
            chunk_size:int,focus_column:str
        ) -> None:

        self.job_id = job_id

        chunks = self.split(df, chunk_size)

        for i, df_chunk in enumerate(chunks):
            chunk = Chunk_on_db(
                job_id=self.job_id,
                chunk_index=i,
                total_rows=len(df_chunk),
                row_range=f"{df_chunk.index[0]}-{df_chunk.index[-1]}",
                source_data=self.format(df_chunk, granularity, focus_column),
                granularity=granularity,
                status=JobStatus.QUEUED,
            )
            self.db.add(chunk)
        await self.db.commit()
