import json
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
        verbosity: float,
        maxOutputTokens: int
    ):

    try:
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

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=verbosity,
                top_p=verbosity,
                maxOutputTokens=maxOutputTokens,
            )
        )
        
        return response.text

    except Exception as e:
        raise GenerationException(f"Failed to generate content: {str(e)}")


def process_chunk(
        chunk_data: Dict[str, Any],
        prompt_text: str,
        model_name: str,
        api_key: str,
        verbosity: float,
        maxOutputTokens: int
    ) -> Dict[str, Any]:
    try:
        data = json.dumps(chunk_data["source_data"])
        
        response = generate_response(prompt_text, data, model_name, api_key, verbosity, maxOutputTokens)
        
        output_data = []
        for idx, item in enumerate(chunk_data["source_data"]):
            output_data.append({
                "row": item["row"],
                "input": item["data"],
                "output": response
            })
            
        # Update the chunk with the results
        processed_chunk = chunk_data.copy()
        processed_chunk["output_data"] = output_data
        
        return processed_chunk
        
    except Exception as e:
        processed_chunk = chunk_data.copy()
        processed_chunk["error"] = str(e)
        return processed_chunk
