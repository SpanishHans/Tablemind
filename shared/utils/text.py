import html
import re
import hashlib
from fastapi import HTTPException
import unicodedata

class TextUtils:
    def sanitize_text(self, text: str, remove_emojis: bool = False, remove_html: bool = False) -> str:
        """
        Sanitize user-provided prompt for safe DB storage and frontend display.
    
        Preserves:
        - Line breaks
        - Spaces
        - Unicode characters like emojis (optional)
    
        Removes:
        - Control characters
        - HTML tags (optional)
        - Excessive whitespace (excluding newlines)
        """
    
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="El texto no puede estar vacío.")
    
        text = unicodedata.normalize("NFKC", text)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)  # Remove control characters except \t, \n, \r
    
        if remove_html:
            text = re.sub(r"<[^>]+>", "", text)
    
        if remove_emojis:
            emoji_pattern = re.compile(
                "[" u"\U0001F600-\U0001F64F"  # emoticons
                u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                u"\U0001F680-\U0001F6FF"  # transport & map symbols
                u"\U0001F1E0-\U0001F1FF"  # flags
                "]+", flags=re.UNICODE
            )
            text = emoji_pattern.sub(r'', text)
    
        # Collapse multiple spaces but preserve line breaks
        text = re.sub(r"[ ]{2,}", " ", text)
    
        if not text.strip():
            raise HTTPException(status_code=400, detail="El texto resultante no contiene contenido válido.")
    
        return text
        
        
    
    def is_valid_and_safe_email(self, email: str) -> str:
        # Trim whitespace and escape basic HTML entities
        text = email.strip()
        text = html.escape(text)
    
        # Reject malicious patterns
        if any(bad in text.lower() for bad in ['<script', 'javascript:', ';', '|', '`', '$(', 'base64']):
            raise HTTPException(status_code=400, detail="El email contiene contenido malicioso.")
    
        # Email regex (simplified but effective)
        email_regex = re.compile(
            r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        )
    
        if not email_regex.match(text):
            raise HTTPException(status_code=400, detail="El email resultante no es válido.")
    
        return text

        
        
        
    def generate_text_hash(self, text: str) -> str:
        """Generate SHA-256 hash of a given string."""
        try:
            if not text or text.strip() == "":
                raise HTTPException(status_code=400, detail="No se puede generar el hash de un texto vacío.")
            return hashlib.sha256(text.encode('utf-8')).hexdigest()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"No se pudo generar el hash del texto: {str(e)}")
