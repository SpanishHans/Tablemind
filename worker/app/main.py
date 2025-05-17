from celery import Celery
from celery.utils.log import get_task_logger
import os
import uuid
import asyncio
import datetime

from sqlalchemy import select

from llm import process_chunk
from shared.models.job import Chunk_on_db, Job_on_db, JobStatus
from shared.models.resources import Prompt_on_db, Model_on_db, APIKey_on_db
from shared.utils.crypt import CryptoUtils
from shared.db.db_engine import init_db, SessionLocal

HOST_REDS = os.getenv("HOST_REDS", "redis")
KEY_FERNET_ENCRYPTION = os.getenv("KEY_FERNET_ENCRYPTION", "A very safe key").encode()

REDIS_URL_BROKER = f"redis://{HOST_REDS}:6379/0"
REDIS_URL_BACKEND = f"redis://{HOST_REDS}:6379/1"

logger = get_task_logger(__name__)
workers = Celery(
    "worker",
    broker=REDIS_URL_BROKER,
    backend=REDIS_URL_BACKEND
)

# Configure Celery
workers.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour time limit
    worker_concurrency=2,  # Adjust based on your resources
)

# Initialize DB at startup
@workers.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    logger.info("Worker initialized and ready")



@workers.task(name="workers.process_job")
def process_job(job_id: str):
    logger.info(f"Processing job {job_id}")
    results = {
        "job_id": job_id,
        "status": "processing",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": []
    }
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(init_db())
        final_results = loop.run_until_complete(process_job_async(job_id))
        loop.close()
        if isinstance(final_results, dict):
            final_results['completed_at'] = datetime.datetime.now().isoformat()
        
        return final_results
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        results["status"] = "failed"
        results["errors"].append(str(e))
        return results



async def process_job_async(job_id: str):
    """Asynchronous implementation of job processing"""
    logger.info(f"Starting async processing for job {job_id}")
    results = {
        "job_id": job_id,
        "status": "started",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": []
    }
    async with SessionLocal() as session:
        try:
            job_uuid = uuid.UUID(job_id)
            result = await session.execute(select(Job_on_db).where(Job_on_db.id == job_uuid))
            job = result.scalar_one_or_none()
    
            if not job:
                logger.error(f"Job {job_id} not found")
                results["status"] = "failed"
                results["errors"].append("Job not found")
                return results

            job.job_status = JobStatus.RUNNING
            await session.commit()

            prompt_result = await session.execute(select(Prompt_on_db).where(Prompt_on_db.id == job.prompt_id))
            prompt = prompt_result.scalar_one_or_none()
    
            if not prompt:
                logger.error(f"Prompt for job {job_id} not found")
                job.job_status = JobStatus.FAILED
                await session.commit()
                results["status"] = "failed"
                results["errors"].append("Prompt not found")
                return results

            model_result = await session.execute(select(Model_on_db).where(Model_on_db.id == job.model_id))
            model = model_result.scalar_one_or_none()
    
            if not model:
                logger.error(f"Model for job {job_id} not found")
                job.job_status = JobStatus.FAILED
                await session.commit()
                results["status"] = "failed"
                results["errors"].append("Model not found")
                return results

            api_key_result = await session.execute(select(APIKey_on_db).where(APIKey_on_db.model_id == model.id))
            api_key_obj = api_key_result.scalar_one_or_none()
    
            if not api_key_obj:
                logger.error(f"No API keys found for model {model.name}")
                job.job_status = JobStatus.FAILED
                await session.commit()
                results["status"] = "failed"
                results["errors"].append("No API keys found")
                return results

            api_key = CryptoUtils(key=KEY_FERNET_ENCRYPTION).decrypt(api_key_obj.api_key)

            chunks_result = await session.execute(
                select(Chunk_on_db)
                .where(Chunk_on_db.job_id == job_uuid)
                .order_by(Chunk_on_db.chunk_index)
            )
            chunks = chunks_result.scalars().all()
    
            results["chunks_total"] = len(chunks)

            for chunk in chunks:
                try:
                    chunk.status = JobStatus.RUNNING
                    await session.commit()
                    chunk_data = {
                        "source_data": chunk.source_data
                    }
                    verbosity = 0.7  # Default value if not stored
                    maxOutputTokens = 60000  # Default value if not stored

                    processed_chunk = process_chunk(
                        chunk_data=chunk_data,
                        prompt_text=prompt.prompt_text,
                        model_name=model.encoder,
                        api_key=api_key,
                        verbosity=verbosity,
                        maxOutputTokens=maxOutputTokens,
                    )

                    chunk.output_data = processed_chunk.get("output_data", [])
                    chunk.status = JobStatus.FINISHED
    
                    results["chunks_processed"] += 1
    
                except Exception as e:
                    logger.error(f"Error processing chunk {chunk.id}: {str(e)}")
                    chunk.status = JobStatus.FAILED
                    results["errors"].append(f"Chunk {chunk.chunk_index}: {str(e)}")
    
                await session.commit()
    
            if results["errors"]:
                job.job_status = JobStatus.FAILED
                results["status"] = "failed"
            else:
                job.job_status = JobStatus.FINISHED
                results["status"] = "completed"
    
            await session.commit()
            logger.info(f"Job {job_id} processed: {results['chunks_processed']}/{results['chunks_total']} chunks")
    
            return results

        except Exception as e:
            logger.error(f"Error in async job processing {job_id}: {str(e)}")
            results["status"] = "failed"
            results["errors"].append(str(e))

            try:
                job_uuid = uuid.UUID(job_id)
                result = await session.execute(select(Job_on_db).where(Job_on_db.id == job_uuid))
                job = result.scalar_one_or_none()
                if job:
                    job.job_status = JobStatus.FAILED
                    await session.commit()
            except Exception:
                pass

            return results