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
    
    # Test the Gemini API at startup with default API key
    try:
        from llm import test_gemini_model
        import os
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            test_result = test_gemini_model(api_key)
            if test_result["success"]:
                logger.info(f"✅ Gemini API test successful with model: {test_result['model_tested']}")
            else:
                logger.warning(f"⚠️ Gemini API test failed: {test_result['error']}")
        else:
            logger.warning("⚠️ No Gemini API key found in environment variables")
    except Exception as e:
        logger.error(f"❌ Error testing Gemini API: {str(e)}")



@workers.task(name="workers.process_job")
def process_job(job_id: str):
    """Process a job by handling all its chunks and mapping results back to dataframe
    
    This function coordinates the processing of all chunks in a job and ensures
    the results are properly mapped back to the original dataframe structure.
    Results are added as a new column 'Analysis_Result' in the final output.
    """
    logger.info(f"Processing job {job_id}")
    results = {
        "job_id": job_id,
        "status": "processing",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": [],
        "combined_results": [],  # Will contain all processed results mapped back to original df
        "debug_info": {"model_info": None, "start_time": datetime.datetime.now().isoformat()}
    }
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(init_db())
        final_results = loop.run_until_complete(process_job_async(job_id))
        loop.close()
        if isinstance(final_results, dict):
            final_results['completed_at'] = datetime.datetime.now().isoformat()
            # Ensure we have combined_results even if it's empty
            if 'combined_results' not in final_results:
                final_results['combined_results'] = []
            
            # Add model information for debugging
            final_results['model_info'] = {
                'timestamp': datetime.datetime.now().isoformat(),
                'note': 'If you see errors about missing model parameter, check that your model name is valid'
            }
        
        logger.info(f"Completed job {job_id} with status: {final_results.get('status', 'unknown')}")
        return final_results
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        results["status"] = "failed"
        results["errors"].append(str(e))
        # Try to update job status in DB to failed
        try:
            failure_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(failure_loop)
            failure_loop.run_until_complete(init_db())
            failure_loop.run_until_complete(mark_job_failed(job_id, str(e)))
            failure_loop.close()
        except Exception as db_error:
            logger.error(f"Failed to mark job as failed in DB: {str(db_error)}")
        return results



async def mark_job_failed(job_id: str, error_message: str):
    """Mark a job as failed in the database"""
    async with SessionLocal() as session:
        try:
            job_uuid = uuid.UUID(job_id)
            result = await session.execute(select(Job_on_db).where(Job_on_db.id == job_uuid))
            job = result.scalar_one_or_none()
            if job:
                job.job_status = JobStatus.FAILED
                await session.commit()
                logger.info(f"Marked job {job_id} as failed: {error_message}")
        except Exception as e:
            logger.error(f"Error marking job {job_id} as failed: {str(e)}")
            await session.rollback()

async def process_job_async(job_id: str):
    """Asynchronous implementation of job processing
    
    Processes all chunks of a job and maps the results back to the original dataframe.
    The results will be added as a new column 'Analysis_Result' in the final Excel output.
    """
    logger.info(f"Starting async processing for job {job_id}")
    results = {
        "job_id": job_id,
        "status": "started",
        "chunks_processed": 0,
        "chunks_total": 0,
        "errors": [],
        "combined_results": []  # Store all processed results here for final dataframe
    }
    async with SessionLocal() as session:
        try:
            # Validate job ID
            try:
                job_uuid = uuid.UUID(job_id)
            except ValueError:
                logger.error(f"Invalid job ID format: {job_id}")
                results["status"] = "failed"
                results["errors"].append(f"Invalid job ID format: {job_id}")
                return results
                
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
                
            # Verify model fields are properly set
            if not hasattr(model, 'encoder') or not model.encoder:
                logger.error(f"Model {model.id} has no encoder defined")
                job.job_status = JobStatus.FAILED
                await session.commit()
                results["status"] = "failed"
                results["errors"].append(f"Model error: encoder not defined for model {model.name if hasattr(model, 'name') else 'unknown'}")
                return results
                
            logger.info(f"Using model: {model.name}, encoder: {model.encoder}")

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
                        "source_data": chunk.source_data if hasattr(chunk, "source_data") and chunk.source_data else []
                    }
                    logger.info(f"Chunk {chunk.chunk_index} data has {len(chunk_data['source_data'])} rows")
                    verbosity = 0.7  # Default value if not stored
                    maxOutputTokens = 60000  # Default value if not stored

                    try:
                        try:
                            # Validate chunk data
                            if not chunk_data or "source_data" not in chunk_data:
                                chunk_data = {"source_data": []}
                                
                            # Add fallback data if source_data is empty
                            if not chunk_data["source_data"]:
                                chunk_data["source_data"] = [{
                                    "row": chunk.chunk_index,
                                    "data": {"info": "Empty chunk data"}
                                }]
                                
                            # Ensure we have a valid model name - use fallbacks if necessary
                            fallback_models = ["gemini-1.5-flash", "gemini-pro", "gemini-pro-vision"]
                            model_name = None
                            
                            # Try to get model name from database
                            if hasattr(model, 'encoder') and model.encoder and model.encoder.strip():
                                model_name = model.encoder
                            else:
                                logger.warning(f"Model {model.id} has no encoder defined, using fallback model")
                                model_name = fallback_models[0]
                                
                            logger.info(f"Processing chunk {chunk.chunk_index} with model: {model_name}")
                        
                            # First perform model validation test with a simple prompt
                            from llm import test_gemini_model
                            test_result = test_gemini_model(api_key, model_name)
                            
                            if test_result["success"]:
                                logger.info(f"✅ Model test successful with: {test_result['model_tested']}")
                                # Use the model that actually worked in the test
                                verified_model = test_result['model_tested']
                            else:
                                logger.warning(f"⚠️ Model test failed, using fallback: {fallback_models[0]}")
                                verified_model = fallback_models[0]
                            
                            processed_chunk = process_chunk(
                                chunk_data=chunk_data,
                                prompt_text=prompt.prompt_text,
                                model_name=verified_model,
                                api_key=api_key,
                                verbosity=verbosity,
                                maxOutputTokens=maxOutputTokens,
                            )
                        except Exception as model_error:
                            logger.error(f"Error with model configuration: {str(model_error)}")
                            raise Exception(f"Model configuration error: {str(model_error)}")
                    
                        # Check for errors in the processed chunk
                        if "error" in processed_chunk:
                            raise Exception(processed_chunk["error"])
                        
                        chunk.output_data = processed_chunk.get("output_data", [])
                        chunk.status = JobStatus.FINISHED
                    
                        # Add processed data to combined results, preserving original row mapping
                        if chunk.output_data:
                            # Make sure each result has proper row mapping
                            for output_item in chunk.output_data:
                                if isinstance(output_item, dict) and 'row' in output_item:
                                    results["combined_results"].append(output_item)
                        results["chunks_processed"] += 1
                    except Exception as chunk_error:
                        # Handle chunk processing errors
                        error_msg = f"Error processing chunk {chunk.chunk_index}: {str(chunk_error)}"
                        logger.error(error_msg)
                        chunk.status = JobStatus.FAILED
                        results["errors"].append(error_msg)
                        # Try to continue with other chunks instead of failing the whole job
    
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
                
                # Check if we have any results to process
                if results["combined_results"]:
                    try:
                        # Sort by row number for proper order
                        results["combined_results"].sort(key=lambda x: x.get("row", 0))
                        
                        # Format the combined results for Excel output with 'Analysis_Result' column
                        formatted_results = []
                        for result in results["combined_results"]:
                            if isinstance(result, dict) and 'output' in result:
                                formatted_results.append({
                                    "row": result.get("row", 0),
                                    "output": result.get("output", "")
                                })
                        
                        # Store the combined dataframe result with the job
                        job.combined_results = formatted_results
                        logger.info(f"Successfully mapped {len(formatted_results)} results back to dataframe with 'Analysis_Result' column")
                    except Exception as format_error:
                        logger.error(f"Error formatting results: {str(format_error)}")
                        results["errors"].append(f"Error formatting results: {str(format_error)}")
                else:
                    logger.warning(f"No results were collected for job {job_id}")
                    job.combined_results = []
    
            # Make sure to commit changes
            try:
                await session.commit()
                logger.info(f"Job {job_id} processed: {results['chunks_processed']}/{results['chunks_total']} chunks with {len(results.get('combined_results', []))} total rows for Excel output")
            except Exception as commit_error:
                logger.error(f"Error committing results: {str(commit_error)}")
                await session.rollback()
                results["errors"].append(f"Database error: {str(commit_error)}")
                results["status"] = "failed"
            
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
                    # If we collected any results before the error, still save them
                    if results.get("combined_results") and not hasattr(job, "combined_results"):
                        try:
                            formatted_results = []
                            for result in results["combined_results"]:
                                if isinstance(result, dict) and 'output' in result:
                                    formatted_results.append({
                                        "row": result.get("row", 0),
                                        "output": result.get("output", "")
                                    })
                            job.combined_results = formatted_results
                        except Exception as recovery_error:
                            logger.error(f"Failed to save partial results: {str(recovery_error)}")
                    await session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update job status: {str(db_error)}")
                try:
                    await session.rollback()
                except:
                    pass

            return results