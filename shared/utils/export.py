import os
import uuid
import json
import pandas as pd
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from fastapi.responses import FileResponse
from datetime import datetime

logger = logging.getLogger(__name__)

class ExportUtils:
    """
    Utility class for exporting job results into various file formats.
    Combines chunks from LLM processing into unified files.
    """
    
    def __init__(self, upload_dir: str):
        """
        Initialize the export utility
        
        Parameters:
        -----------
        upload_dir : str
            Base directory for file storage
        """
        self.upload_dir = upload_dir
        self.exports_dir = os.path.join(upload_dir, "exports")
        os.makedirs(self.exports_dir, exist_ok=True)
        
    def _generate_export_path(self, job_id: uuid.UUID, file_format: str) -> str:
        """Generate a path for the export file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tablemind_export_{job_id}_{timestamp}.{file_format}"
        return os.path.join(self.exports_dir, filename)
    
    def _chunks_to_dataframe(self, chunks: List[Dict], include_input: bool = True) -> pd.DataFrame:
        """
        Convert job chunks to a pandas DataFrame
        
        Parameters:
        -----------
        chunks : List[Dict]
            List of chunk data from the database
        include_input : bool
            Whether to include input data columns in the output
            
        Returns:
        --------
        pd.DataFrame
            DataFrame containing all processed data
        """
        if not chunks:
            raise HTTPException(status_code=404, detail="No chunks found to export")
        
        # Log the structure for debugging
        logger.info(f"Processing {len(chunks)} chunks")
        if chunks and 'output_data' in chunks[0]:
            logger.info(f"First chunk output_data type: {type(chunks[0]['output_data'])}")
            if chunks[0]['output_data']:
                logger.info(f"First output_data item structure: {chunks[0]['output_data'][0].keys() if isinstance(chunks[0]['output_data'][0], dict) else 'not a dict'}")
            
        rows = []
        for chunk_idx, chunk in enumerate(chunks):
            # Skip chunks without output_data
            if 'output_data' not in chunk or not chunk['output_data']:
                logger.info(f"Skipping chunk {chunk_idx} - no output_data found")
                continue
            
            # Check if output_data is a list or some other structure
            if not isinstance(chunk['output_data'], list):
                logger.warning(f"Chunk {chunk_idx} output_data is not a list, it's a {type(chunk['output_data'])}")
                continue
                
            logger.info(f"Processing chunk {chunk_idx} with {len(chunk['output_data'])} output rows")
            
            for row_idx, row_data in enumerate(chunk['output_data']):
                combined_row = {}
                
                # Add source data if available
                if include_input and 'input_data' in chunk and chunk['input_data']:
                    # Try to find matching source data by row index
                    source_rows = [item for item in chunk['input_data'] if item.get('row') == row_data.get('row')]
                    
                    if source_rows and 'data' in source_rows[0]:
                        source_data = source_rows[0]['data']
                        if isinstance(source_data, dict):
                            for key, value in source_data.items():
                                combined_row[f"input_{key}"] = value
                        else:
                            combined_row["input_data"] = str(source_data)
                
                # Also check for input directly in the row_data
                if include_input and 'input' in row_data:
                    if isinstance(row_data['input'], dict):
                        # Prefix input columns to avoid collision with output
                        for key, value in row_data['input'].items():
                            combined_row[f"input_{key}"] = value
                    else:
                        combined_row["input"] = str(row_data['input'])
                
                # Add the processed output
                if 'output' in row_data:
                    if isinstance(row_data['output'], dict):
                        for key, value in row_data['output'].items():
                            combined_row[key] = value
                    else:
                        combined_row["output"] = str(row_data['output'])
                # Sometimes the row itself might be the output
                elif isinstance(row_data, dict) and 'input' not in row_data and 'row' not in row_data:
                    for key, value in row_data.items():
                        if key != 'row':  # Skip row index
                            combined_row[key] = value
                
                # Add row index reference
                if 'row' in row_data:
                    combined_row["row_index"] = row_data['row']
                else:
                    combined_row["row_index"] = row_idx
                    
                rows.append(combined_row)
        
        if not rows:
            # Create a fake row with error information for debugging
            error_row = {
                "error": "No processed data found in chunks",
                "chunks_count": len(chunks),
                "chunks_with_output_data": sum(1 for c in chunks if 'output_data' in c and c['output_data']),
                "first_chunk_keys": list(chunks[0].keys()) if chunks else []
            }
            if chunks and 'output_data' in chunks[0] and chunks[0]['output_data']:
                if isinstance(chunks[0]['output_data'], list):
                    error_row["first_output_data_keys"] = list(chunks[0]['output_data'][0].keys()) if isinstance(chunks[0]['output_data'][0], dict) else "not a dict"
                else:
                    error_row["output_data_type"] = str(type(chunks[0]['output_data']))
            
            logger.error(f"Export error details: {error_row}")
            raise HTTPException(status_code=404, detail="No processed data found in chunks")
            
        logger.info(f"Successfully created DataFrame with {len(rows)} rows")
        return pd.DataFrame(rows)
    
    def export_to_csv(self, job_id: uuid.UUID, chunks: List[Dict], include_input: bool = True) -> str:
        """
        Export job results to a CSV file
        
        Parameters:
        -----------
        job_id : uuid.UUID
            The UUID of the job
        chunks : List[Dict]
            List of chunk data from the database
        include_input : bool
            Whether to include input data columns in the output
            
        Returns:
        --------
        str
            Path to the created CSV file
        """
        try:
            logger.info(f"Starting CSV export for job {job_id} with {len(chunks)} chunks")
            # Debug log for first chunk structure
            if chunks:
                logger.info(f"First chunk keys: {list(chunks[0].keys())}")
                
            df = self._chunks_to_dataframe(chunks, include_input)
            export_path = self._generate_export_path(job_id, "csv")
            df.to_csv(export_path, index=False)
            logger.info(f"Successfully exported CSV to {export_path}")
            return export_path
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error exporting to CSV: {str(e)}")
    
    def export_to_excel(self, job_id: uuid.UUID, chunks: List[Dict], include_input: bool = True) -> str:
        """
        Export job results to an Excel file
        
        Parameters:
        -----------
        job_id : uuid.UUID
            The UUID of the job
        chunks : List[Dict]
            List of chunk data from the database
        include_input : bool
            Whether to include input data columns in the output
            
        Returns:
        --------
        str
            Path to the created Excel file
        """
        try:
            logger.info(f"Starting Excel export for job {job_id} with {len(chunks)} chunks")
            # Debug log for first chunk structure
            if chunks:
                logger.info(f"First chunk keys: {list(chunks[0].keys())}")
                if 'output_data' in chunks[0]:
                    logger.info(f"Output data type: {type(chunks[0]['output_data'])}")
                    if chunks[0]['output_data'] and len(chunks[0]['output_data']) > 0:
                        logger.info(f"Sample output data: {chunks[0]['output_data'][0]}")
                
            df = self._chunks_to_dataframe(chunks, include_input)
            export_path = self._generate_export_path(job_id, "xlsx")
            df.to_excel(export_path, index=False)
            logger.info(f"Successfully exported Excel to {export_path}")
            return export_path
        except Exception as e:
            logger.error(f"Error exporting to Excel: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error exporting to Excel: {str(e)}")
    
    def export_to_json(self, job_id: uuid.UUID, chunks: List[Dict], include_input: bool = True) -> str:
        """
        Export job results to a JSON file
        
        Parameters:
        -----------
        job_id : uuid.UUID
            The UUID of the job
        chunks : List[Dict]
            List of chunk data from the database
        include_input : bool
            Whether to include input data columns in the output
            
        Returns:
        --------
        str
            Path to the created JSON file
        """
        try:
            logger.info(f"Starting JSON export for job {job_id} with {len(chunks)} chunks")
            # Debug log for first chunk structure
            if chunks:
                logger.info(f"First chunk keys: {list(chunks[0].keys())}")
                
            df = self._chunks_to_dataframe(chunks, include_input)
            export_path = self._generate_export_path(job_id, "json")
            df.to_json(export_path, orient="records", indent=2)
            logger.info(f"Successfully exported JSON to {export_path}")
            return export_path
        except Exception as e:
            logger.error(f"Error exporting to JSON: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error exporting to JSON: {str(e)}")
    
    def get_export_response(self, export_path: str, media_type: Optional[str] = None) -> FileResponse:
        """
        Create a FileResponse for the exported file
        
        Parameters:
        -----------
        export_path : str
            Path to the exported file
        media_type : Optional[str]
            Media type for the response
            
        Returns:
        --------
        FileResponse
            Response containing the exported file
        """
        if not os.path.exists(export_path):
            raise HTTPException(status_code=404, detail="Export file not found")
            
        filename = os.path.basename(export_path)
        
        # Auto-detect media type if not provided
        if not media_type:
            if export_path.endswith(".csv"):
                media_type = "text/csv"
            elif export_path.endswith(".xlsx"):
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            elif export_path.endswith(".json"):
                media_type = "application/json"
            else:
                media_type = "application/octet-stream"
        
        return FileResponse(
            path=export_path,
            media_type=media_type,
            filename=filename
        )