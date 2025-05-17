from typing import Optional
from cryptography.fernet import Fernet


class GenerationException(Exception):
    """Raised when a generation error occurs."""
    pass


class EncryptionException(Exception):
    """Raised when encryption fails."""
    pass


class DecryptionException(Exception):
    """Raised when decryption fails."""
    pass


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
            raise EncryptionException("Cannot encrypt an empty or blank string.")
        try:
            encrypted = self.cipher.encrypt(text.encode('utf-8'))
            return encrypted.decode()
        except Exception as e:
            raise EncryptionException(f"Encryption failed: {str(e)}")

    def decrypt(self, token: str) -> str:
        """Decrypt the given encrypted text."""
        try:
            decrypted = self.cipher.decrypt(token.encode('utf-8'))
            return decrypted.decode()
        except Exception as e:
            raise DecryptionException(f"Decryption failed: {str(e)}")
