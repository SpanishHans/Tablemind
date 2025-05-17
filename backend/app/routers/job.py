import os
import uuid
import logging
from typing import Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

from sqlalchemy.ext.asyncio import AsyncSession

from celery import Celery

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user, CurrentUser
from shared.models.job import GranularityLevel, JobStatus

from shared.schemas.job import ResponseJob, FormParams, QueryParams, ResponseJobStatus, ResponseJobDownload
from shared.handlers.job import JobHandler

logger = logging.getLogger(__name__)

HOST_REDS = os.getenv("HOST_REDS", "redis")

REDIS_URL_BROKER = f"redis://{HOST_REDS}:6379/0"
REDIS_URL_BACKEND = f"redis://{HOST_REDS}:6379/1"

# Set up Jinja2 templates
template_dir = "app/templates"
os.makedirs(template_dir, exist_ok=True)
templates = Jinja2Templates(directory=template_dir)

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
    task = dispatcher.send_task('workers.process_job', args=[str(job.job_id)])

    # Create a complete response with task info
    return ResponseJob(
        job_id=job.job_id,
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
    job_id: uuid.UUID = Query(..., description="Job ID"),
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


@router.get("/download", response_model=ResponseJobDownload)
async def download_job_results(
    job_id: uuid.UUID = Query(..., description="Job ID"),
    format: str = Query("csv", description="File format (csv, excel, json)"),
    include_input: bool = Query(True, description="Include input data in output"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    job_handler = JobHandler(db=db, current_user=current_user)
    _, download_info = await job_handler.DownloadJobResults(
        job_id=job_id, 
        file_format=format,
        include_input=include_input
    )
    return download_info


@router.get("/download-file/{job_id}", response_class=FileResponse)
async def download_job_file(
    job_id: uuid.UUID,
    format: str = Query("csv", description="File format (csv, excel, json)"),
    include_input: bool = Query(True, description="Include input data in output"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    job_handler = JobHandler(db=db, current_user=current_user)
    file_response, _ = await job_handler.DownloadJobResults(
        job_id=job_id, 
        file_format=format,
        include_input=include_input
    )
    return file_response
    
    
@router.get("/preview/{job_id}", response_class=HTMLResponse)
async def preview_job_results(
    request: Request,
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    max_rows: int = Query(100, description="Maximum number of rows to preview")
):
    """
    Preview job results in HTML format
    
    This endpoint renders an HTML preview of the job results.
    """
    job_handler = JobHandler(db=db, current_user=current_user)
    job = await job_handler.JobRead(job_id)
    
    if not hasattr(job, 'job_status') or job.job_status != JobStatus.FINISHED:
        raise HTTPException(
            status_code=400,
            detail="Job is not in FINISHED state"
        )
    
    chunks = await job_handler.GetJobChunks(job_id)
    
    # Create a preview-friendly data structure
    preview_data = []
    columns = set(["row_index"])
    
    for chunk in chunks:
        if not chunk.output_data or chunk.status != JobStatus.FINISHED:
            continue
            
        for row_idx, row_data in enumerate(chunk.output_data[:max_rows]):
            row_dict = {"row_index": row_data.get("row", row_idx)}
            
            # Try to find the corresponding input data if available
            if hasattr(chunk, "source_data") and chunk.source_data:
                source_rows = [item for item in chunk.source_data if item.get('row') == row_data.get('row')]
                if source_rows and 'data' in source_rows[0]:
                    source_data = source_rows[0]['data']
                    if isinstance(source_data, dict):
                        for key, value in source_data.items():
                            col_name = f"input_{key}"
                            row_dict[col_name] = value
                            columns.add(col_name)
                    else:
                        row_dict["input_data"] = str(source_data)
                        columns.add("input_data")
            
            # Add input data if it's in the row_data
            if "input" in row_data:
                if isinstance(row_data["input"], dict):
                    for key, value in row_data["input"].items():
                        col_name = f"input_{key}"
                        row_dict[col_name] = value
                        columns.add(col_name)
                else:
                    row_dict["input"] = str(row_data["input"])
                    columns.add("input")
            
            # Add output data
            if "output" in row_data:
                if isinstance(row_data["output"], dict):
                    for key, value in row_data["output"].items():
                        row_dict[key] = value
                        columns.add(key)
                else:
                    row_dict["output"] = str(row_data["output"])
                    columns.add("output")
            # Sometimes the row itself might be the output
            elif isinstance(row_data, dict) and "input" not in row_data and "row" not in row_data:
                for key, value in row_data.items():
                    if key != "row":  # Skip row index
                        row_dict[key] = value
                        columns.add(key)
                    
            preview_data.append(row_dict)
            
            # Limit total rows
            if len(preview_data) >= max_rows:
                break
    
    # Create HTML template if it doesn't exist
    template_path = os.path.join(template_dir, "preview.html")
    if not os.path.exists(template_path):
        with open(template_path, "w") as f:
            f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>Tablemind Results Preview</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .download-links { margin: 20px 0; }
        .download-links a { margin-right: 15px; padding: 8px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        .job-info { margin-bottom: 20px; }
        .job-info div { margin-bottom: 5px; }
    </style>
</head>
<body>
    <h1>Tablemind Results Preview</h1>
    
    <div class="job-info">
        <div><strong>Job ID:</strong> {{ job_id }}</div>
        <div><strong>Status:</strong> {{ job_status }}</div>
        <div><strong>Created:</strong> {{ created_at }}</div>
        <div><strong>Total Rows:</strong> {{ total_rows }}</div>
    </div>
    
    <div class="download-links">
        <a href="/job/download-file/{{ job_id }}?format=csv">Download CSV</a>
        <a href="/job/download-file/{{ job_id }}?format=excel">Download Excel</a>
        <a href="/job/download-file/{{ job_id }}?format=json">Download JSON</a>
    </div>
    
    <h2>Data Preview (First {{ preview_rows }} rows)</h2>
    
    {% if data %}
    <table>
        <thead>
            <tr>
                {% for col in columns %}
                <th>{{ col }}</th>
                {% endfor %}
            </tr>
        </thead>
        <tbody>
            {% for row in data %}
            <tr>
                {% for col in columns %}
                <td>{{ row.get(col, "") }}</td>
                {% endfor %}
            </tr>
            {% endfor %}
        </tbody>
    </table>
    {% else %}
    <p>No data available for preview.</p>
    {% endif %}
</body>
</html>
            """)
    
    # Render template with data
    return templates.TemplateResponse(
        "preview.html", 
        {
            "request": request,
            "job_id": str(job_id),
            "job_status": str(job.job_status) if hasattr(job, "job_status") else "unknown",
            "created_at": job.created_at.strftime("%Y-%m-%d %H:%M:%S") if hasattr(job, "created_at") and job.created_at else "Unknown",
            "total_rows": sum(chunk.total_rows for chunk in chunks if hasattr(chunk, "total_rows")),
            "preview_rows": min(len(preview_data), max_rows),
            "data": preview_data,
            "columns": sorted(list(columns))
        }
    )
