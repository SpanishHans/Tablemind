from celery import Celery
from celery.utils.log import get_task_logger
import os
import uuid
import asyncio
import time

from sqlalchemy import select

from llm import process_chunk
from shared.models.job import Chunk_on_db, Job_on_db, JobStatus
from shared.models.resources import Prompt_on_db, Model_on_db, APIKey_on_db
from shared.utils.crypt import CryptoUtils

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

workers.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)



@workers.task(name="workers.add")
def add(x, y):
    logger.info("Computing")
    return x + y



@workers.task(name="workers.process_job")
def process_job(job_id: str):
    """
    Process a job by reading its chunks and processing each one
    
    Parameters:
    -----------
    job_id : str
        The UUID of the job to process
    """
    logger.info(f"Processing job {job_id}")
    
    # Simulate processing - remove this in production
    logger.info("Simulating processing...")
    time.sleep(2)
    
    results = {
        "job_id": job_id,
        "status": "processing",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": []
    }
    
    try:
        # Run the async function in a synchronous context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        final_results = loop.run_until_complete(process_job_async(job_id))
        loop.close()
        return final_results
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        results["status"] = "failed"
        results["errors"].append(str(e))
        return results



async def process_job_async(job_id: str):
    """Asynchronous implementation of job processing"""
    results = {
        "job_id": job_id,
        "status": "started",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": []
    }

    # Check for imported modules to avoid "possibly unbound" errors
    if 'Job_on_db' not in globals() or 'Chunk_on_db' not in globals() or 'JobStatus' not in globals():
        results["status"] = "failed"
        results["errors"].append("Required database models not available")
        logger.error("Required database models not available")
        return results

    # Create a new session instead of using directly with async with
    session = AsyncSessionLocal()
    try:
        # Get the job
        job_uuid = uuid.UUID(job_id)
        result = await session.execute(select(Job_on_db).where(Job_on_db.id == job_uuid))
        job = result.scalar_one_or_none()

        if not job:
            logger.error(f"Job {job_id} not found")
            results["status"] = "failed"
            results["errors"].append("Job not found")
            return results

        # Update job status to running
        job.job_status = JobStatus.RUNNING
        await session.commit()

        # Get the prompt
        prompt_result = await session.execute(select(Prompt_on_db).where(Prompt_on_db.id == job.prompt_id))
        prompt = prompt_result.scalar_one_or_none()

        if not prompt:
            logger.error(f"Prompt for job {job_id} not found")
            job.job_status = JobStatus.FAILED
            await session.commit()
            results["status"] = "failed"
            results["errors"].append("Prompt not found")
            return results

        # Get the model
        model_result = await session.execute(select(Model_on_db).where(Model_on_db.id == job.model_id))
        model = model_result.scalar_one_or_none()

        if not model:
            logger.error(f"Model for job {job_id} not found")
            job.job_status = JobStatus.FAILED
            await session.commit()
            results["status"] = "failed"
            results["errors"].append("Model not found")
            return results

        # Get API key
        api_key_result = await session.execute(select(APIKey_on_db).where(APIKey_on_db.model_id == model.id))
        api_key_obj = api_key_result.scalar_one_or_none()

        if not api_key_obj:
            logger.error(f"No API keys found for model {model.name}")
            job.job_status = JobStatus.FAILED
            await session.commit()
            results["status"] = "failed"
            results["errors"].append("No API keys found")
            return results

        # Decrypt API key
        api_key = CryptoUtils(key=KEY_FERNET_ENCRYPTION).decrypt(api_key_obj.api_key)

        # Get all chunks for this job
        chunks_result = await session.execute(
            select(Chunk_on_db)
            .where(Chunk_on_db.job_id == job_uuid)
            .order_by(Chunk_on_db.chunk_index)
        )
        chunks = chunks_result.scalars().all()

        results["chunks_total"] = len(chunks)

        # Process each chunk
        for chunk in chunks:
            try:
                # Update chunk status to running
                chunk.status = JobStatus.RUNNING
                await session.commit()

                # Process the chunk
                chunk_data = {
                    "source_data": chunk.source_data
                }

                processed_chunk = process_chunk(
                    chunk_data=chunk_data,
                    prompt_text=prompt.prompt_text,
                    model_name=model.encoder,
                    api_key=api_key,
                    verbosity=verbosity,
                    maxOutputTokens=maxOutputTokens,
                )

                # Update the chunk in the database
                chunk.output_data = processed_chunk.get("output_data", [])
                chunk.status = JobStatus.FINISHED

                results["chunks_processed"] += 1

            except Exception as e:
                logger.error(f"Error processing chunk {chunk.id}: {str(e)}")
                chunk.status = JobStatus.FAILED
                results["errors"].append(f"Chunk {chunk.chunk_index}: {str(e)}")

            await session.commit()

        # Update job status
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
            # Try to update job status if possible
            job_uuid = uuid.UUID(job_id)
            result = await session.execute(select(Job_on_db).where(Job_on_db.id == job_uuid))
            job = result.scalar_one_or_none()
            if job:
                job.job_status = JobStatus.FAILED
                await session.commit()
        except Exception:
            pass  # Already in an exception handler

        return results
    finally:
        # Make sure to close the session
        await session.close()