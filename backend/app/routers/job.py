import os
import uuid
import logging
from typing import Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Form, Query

from sqlalchemy.ext.asyncio import AsyncSession

from celery import Celery

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser
from shared.models.job import GranularityLevel, JobStatus

from shared.schemas.job import ResponseJob, FormParams, QueryParams, ResponseJobStatus
from shared.handlers.job import JobHandler

logger = logging.getLogger(__name__)

HOST_REDS = os.getenv("HOST_REDS", "redis")

REDIS_URL_BROKER = f"redis://{HOST_REDS}:6379/0"
REDIS_URL_BACKEND = f"redis://{HOST_REDS}:6379/1"

router = APIRouter(tags=["Jobs"], prefix = '/job')
dispatcher = Celery(
    "worker",
    broker=REDIS_URL_BROKER,
    backend=REDIS_URL_BACKEND,
)



@router.post("/estimate", response_model=ResponseJob)
async def estimate_job(
    form_params: FormParams = Depends(FormParams.as_form),
    query_params: QueryParams = Depends(QueryParams.as_query),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    return await JobHandler(db=db, current_user=current_user).EstimateJob(
        prompt_id=form_params.prompt_id, 
        media_id=form_params.media_id, 
        model_id=form_params.model_id,
        focus_column=form_params.focus_column,
        granularity=GranularityLevel[query_params.granularity],
        verbosity=query_params.verbosity,
        chunk_size=query_params.chunk_size,
    )



@router.post("/start", response_model=ResponseJob)
async def start_job(
    form_params: FormParams = Depends(FormParams.as_form),
    query_params: QueryParams = Depends(QueryParams.as_query),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    # First estimate the job to get all the required values
    job_handler = JobHandler(db=db, current_user=current_user)

    # Estimate the job first to calculate tokens and costs
    job = await job_handler.EstimateJob(
        prompt_id=form_params.prompt_id, 
        media_id=form_params.media_id, 
        model_id=form_params.model_id,
        focus_column=form_params.focus_column,
        granularity=GranularityLevel[query_params.granularity],
        verbosity=query_params.verbosity,
        chunk_size=query_params.chunk_size,
    )

    # Create the actual job and store it - JobCreate now uses data from EstimateJob
    job = await job_handler.JobCreate()

    # Queue the job for processing
    task = dispatcher.send_task('workers.process_job', args=[str(job.id)])

    # Create a complete response with task info
    return ResponseJob(
        id=job.id,
        filename=job.filename,
        modelname=job.modelname,
        verbosity=job.verbosity,
        granularity=job.granularity,
        estimated_input_tokens=job.estimated_input_tokens,
        estimated_output_tokens=job.estimated_output_tokens,
        cost_per_1m_input=job.cost_per_1m_input,
        cost_per_1m_output=job.cost_per_1m_output,
        handling_fee=job.handling_fee,
        estimated_cost=job.estimated_cost,
        job_status=job.job_status,
        created_at=job.created_at,
        completed_at=job.completed_at,
        task_id=str(task.id),
        task_status="queued"
    )


@router.get("/status", response_model=ResponseJobStatus)
async def check_job_status(
    job_id: uuid.UUID = Query(..., description="Job ID"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    job_handler = JobHandler(db=db, current_user=current_user)
    job = await job_handler.JobRead(job_id)
    task_status = "unknown"
    try:
        if hasattr(job, 'task_id') and job.task_id:
            task = dispatcher.AsyncResult(job.task_id)
            task_status = task.status
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")

    chunks_stats = await job_handler.GetChunksStats(job_id)

    try:
        created_at = job.created_at if hasattr(job, "created_at") and job.created_at is not None else datetime.now()
        completed_at = None
        if (hasattr(job, "completed_at") and hasattr(job, "job_status") 
            and job.job_status == JobStatus.FINISHED and job.completed_at is not None):
            completed_at = job.completed_at

        return ResponseJobStatus(
            job_id=str(job_id),
            status=str(job.job_status) if hasattr(job, "job_status") else "unknown",
            task_status=task_status,
            chunks_total=chunks_stats.get("total", 0),
            chunks_completed=chunks_stats.get("completed", 0),
            chunks_in_progress=chunks_stats.get("in_progress", 0),
            chunks_failed=chunks_stats.get("failed", 0),
            created_at=created_at,
            completed_at=completed_at
        )
    except Exception as e:
        logger.error(f"Error creating job status response: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving job status")


@router.get("/results", response_model=Dict[str, Any])
async def get_job_results(
    job_id: uuid.UUID = Form(..., description="Job ID"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    job_handler = JobHandler(db=db, current_user=current_user)
    job = await job_handler.JobRead(job_id)
    chunks = await job_handler.GetJobChunks(job_id)
    response = {
        "job_id": str(job_id),
        "status": str(job.job_status) if hasattr(job, "job_status") else "unknown",
        "chunks": [],
        "completed": hasattr(job, "job_status") and job.job_status == JobStatus.FINISHED
    }
    
    for chunk in chunks:
        chunk_data = {
            "chunk_index": chunk.chunk_index,
            "row_range": chunk.row_range,
            "status": chunk.status,
            "input_data": chunk.source_data,
            "output_data": chunk.output_data if chunk.status == JobStatus.FINISHED else None
        }
        response["chunks"].append(chunk_data)
    
    return response
