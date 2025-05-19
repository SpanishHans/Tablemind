import json
import os
import datetime
from typing import Dict, Any
from google import genai
from google.genai import types

class GenerationException(Exception):
    """Custom exception for generation errors."""
    pass


def generate_response(
        prompt_text: str,
        data: str,
        model_name: str,
        api_key: str,
        verbosity: float = 0.2,
        maxOutputTokens: int = 60000
    ):

    try:
        print(f"DEBUG: Using model name: {model_name}")
        
        # Validate model name or use default
        fallback_models = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"]
        if not model_name or model_name.strip() == "":
            print("WARNING: Empty model name provided, using fallback")
            model_name = fallback_models[0]
        
        input_text = f"""
        PROMPT: {prompt_text}
        
        DATA: {data}
        
        Please analyze the data according to the prompt. Provide a concise, insightful analysis.
        """
        contents = [
            {
                "role": "user",
                "parts": [{"text": input_text}]
            }
        ]

        print(f"DEBUG: Initializing Gemini client with API key length: {len(api_key) if api_key else 0}")
        client = genai.Client(api_key=api_key)
        
        for attempt_model in [model_name] + fallback_models:
            try:
                print(f"DEBUG: Attempting with model: {attempt_model}, temperature: {verbosity}, maxOutputTokens: {maxOutputTokens}")
                response = client.models.generate_content(
                    model=attempt_model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=verbosity,
                        top_p=verbosity,
                        maxOutputTokens=maxOutputTokens,
                    )
                )
                print(f"DEBUG: Successfully got response from Gemini API using model {attempt_model}")
                return response.text
            except Exception as model_error:
                print(f"ERROR with model {attempt_model}: {str(model_error)}")
                if attempt_model == fallback_models[-1]:
                    # If we've tried all models and still failed, raise the exception
                    raise
                else:
                    print(f"Trying fallback model...")
                    continue

    except Exception as e:
        print(f"ERROR: Failed to generate content after all attempts: {str(e)}")
        raise GenerationException(f"Failed to generate content: {str(e)}")


def process_chunk(
        chunk_data: Dict[str, Any],
        prompt_text: str,
        api_key: str,
        model_name: str = None,  # Will use fallback model list if None
        verbosity: float = 0.5,
        maxOutputTokens: int = 60000
    ) -> Dict[str, Any]:
    """Process a data chunk and generate responses that can be mapped back to original dataframe
    
    This function takes a chunk of data, processes it through the LLM and ensures
    the output preserves the original row indices for proper mapping back to the dataframe.
    The results will be added to the dataframe as a new column 'Analysis_Result'.
    """
    try:
        model_name = model_name or "gemini-1.5-flash"
        print(f"DEBUG: Starting process_chunk with model_name={model_name}")
        # Validate inputs
        if not chunk_data or "source_data" not in chunk_data or not chunk_data["source_data"]:
            print("ERROR: Invalid or empty chunk data")
            return {"output_data": [], "error": "Invalid or empty chunk data"}
            
        # Use environment variable if API key not provided
        api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            print("WARNING: No API key provided, using dummy results")
            # Return dummy result for testing if no API key
            return {
                "output_data": [{
                    "row": item.get("row", idx),
                    "input": item["data"] if isinstance(item["data"], dict) else {"value": item["data"]},
                    "output": "Test processed output (no API key provided)"
                } for idx, item in enumerate(chunk_data["source_data"])]
            }
        print(f"DEBUG: Using API key (length: {len(api_key)})")
        
        # Always process row by row for more reliable results
        output_data = []
        print(f"Processing {len(chunk_data['source_data'])} rows individually")
        
        for idx, item in enumerate(chunk_data["source_data"]):
            row_idx = item.get("row", idx)
            
            try:
                # Process each row individually
                row_data = json.dumps(item["data"])
                print(f"DEBUG: Processing row {idx} (original index: {row_idx}) with model: {model_name}")
                row_response = generate_response(
                    prompt_text, row_data, model_name, api_key, 
                    verbosity, min(maxOutputTokens, 10000)  # Smaller token limit for single rows
                )
                print(f"DEBUG: Successfully processed row {idx}")
                output_data.append({
                    "row": row_idx,
                    "input": item["data"],
                    "output": row_response
                })
            except Exception as e:
                # If individual processing fails, add error message
                error_msg = f"Error processing this row: {str(e)}"
                print(f"ERROR processing row {idx}: {str(e)}")
                output_data.append({
                    "row": row_idx,
                    "input": item["data"],
                    "output": error_msg
                })
        
        # Update the chunk with the results
        processed_chunk = chunk_data.copy()
        processed_chunk["output_data"] = output_data
        
        return processed_chunk
        
    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL ERROR in process_chunk: {error_msg}")
        processed_chunk = chunk_data.copy()
        processed_chunk["error"] = error_msg
        return processed_chunk
        
        
def test_gemini_model(api_key: str, model_name: str = "gemini-1.5-flash") -> Dict[str, Any]:
    """Simple test function to validate if we can call the Gemini API with a given model and API key
    
    Returns a dictionary with success/error information and debug details
    """
    result = {
        "success": False,
        "model_tested": model_name,
        "timestamp": datetime.datetime.now().isoformat(),
        "error": None,
        "response": None
    }
    
    try:
        # Import here to avoid circular imports
        import datetime
        
        print(f"Testing Gemini model: {model_name}")
        test_prompt = "Hello, my name is Claude. What's your name?"
        
        client = genai.Client(api_key=api_key)
        
        # Try models in sequence if the requested one fails
        fallback_models = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"]
        models_to_try = [model_name] + [m for m in fallback_models if m != model_name]
        
        for attempt_model in models_to_try:
            try:
                print(f"Attempting to use model: {attempt_model}")
                response = client.models.generate_content(
                    model=attempt_model,
                    contents=[{"role": "user", "parts": [{"text": test_prompt}]}],
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        top_p=0.8,
                        maxOutputTokens=100,
                    )
                )
                result["success"] = True
                result["model_tested"] = attempt_model
                result["response"] = response.text
                print(f"Test successful with model: {attempt_model}")
                print(f"Response: {response.text}")
                break
            except Exception as model_error:
                error_msg = f"Error with model {attempt_model}: {str(model_error)}"
                print(error_msg)
                if attempt_model == models_to_try[-1]:
                    # This was our last attempt
                    result["error"] = error_msg
                    print("All model attempts failed")
                else:
                    print("Trying next model...")
        
        return result
    except Exception as e:
        error_msg = f"Test failed: {str(e)}"
        print(error_msg)
        result["error"] = error_msg
        return result
