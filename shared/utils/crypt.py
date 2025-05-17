from typing import Optional
from fastapi import HTTPException
from cryptography.fernet import Fernet

class CryptoUtils:
    def __init__(self, key: Optional[bytes] = None):
        if key is None:
            # Generate a key once and store it securely
            key = Fernet.generate_key()
            print("🔐 Save this key somewhere safe:", key.decode())
        self.cipher = Fernet(key)

    def encrypt(self, text: str) -> str:
        """Encrypt the given text."""
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="No se puede encriptar un texto vacío.")
        encrypted = self.cipher.encrypt(text.encode('utf-8'))
        return encrypted.decode()

    def decrypt(self, token: str) -> str:
        """Decrypt the given encrypted text."""
        try:
            decrypted = self.cipher.decrypt(token.encode('utf-8'))
            return decrypted.decode()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"No se pudo desencriptar el texto: {str(e)}")
