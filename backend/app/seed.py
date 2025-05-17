import os
import uuid
from enum import Enum

from fastapi import HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.utils.auth import PasswordService
from shared.utils.text import TextUtils
from shared.utils.crypt import CryptoUtils

from shared.models.user import User_on_db, UserTier_on_db
from shared.models.resources import Model_on_db, APIKey_on_db

PASS_ROOT_USER = os.getenv("PASS_ROOT_USER", "A very safe root password")
KEY_FERNET_ENCRYPTION = os.getenv("KEY_FERNET_ENCRYPTION", "A very safe key").encode()
KEY_API_GEMINI = os.getenv("KEY_API_GEMINI", "")

class LLMProviders(str, Enum):
    OPENAI = "OpenAI"
    GOOGLE = "Google"
    META = "Meta"
    COHERE = "Cohere"
    MISTRAL = "Mistral"
    ELEUTHERAI = "EleutherAI"
    AI21 = "AI21 Labs"
    HUGGINGFACE = "Hugging Face"
    NVIDIA = "NVIDIA"
    AMAZON = "Amazon"
    ANTHROPIC = "Anthropic"

class SeedDb:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def seed_usertypes(self) -> None:
        """Populate default tiers"""
        default_tiers = [
            {"name": "free", "media_quota": 100_000_000, "price_per_job": 10, "can_use_premium_models": False},
            {"name": "premium", "media_quota": 1_000_000_000, "price_per_job": 5, "can_use_premium_models": True},
            {"name": "admin", "media_quota": 10_000_000_000, "price_per_job": 0, "can_use_premium_models": True},
        ]
        try:
            for tier in default_tiers:
                result = await self.db.execute(select(UserTier_on_db).where(UserTier_on_db.name == tier["name"]))
                if not result.scalar_one_or_none():
                    self.db.add(UserTier_on_db(id=uuid.uuid4(), **tier))

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error seedeando db para usertypes: {str(e)}"
            )



    async def seed_root_user(self) -> None:
        """Populate default users"""
        result = await self.db.execute(
            select(UserTier_on_db).where(UserTier_on_db.name == "admin")
        )
        admin_tier = result.scalar_one_or_none()
        if not admin_tier:
            raise HTTPException(status_code=404, detail="El tipo no existe.")
        default_users = [
            {
                "usertier": admin_tier.id,
                "username": "root",
                "email": "root@TableMind.com",
                "password_hash": PasswordService(TextUtils().sanitize_text(PASS_ROOT_USER)).hash_password(),
                "profile_picture": "",
                "biography":"",
                "media_usage": 0
            },
        ]
        try:
            for user in default_users:
                result = await self.db.execute(select(User_on_db).where(User_on_db.username == user["username"]))
                if not result.scalar_one_or_none():
                    self.db.add(User_on_db(id=uuid.uuid4(), **user))

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error seedeando db para users: {str(e)}"
            )



    async def seed_models(self) -> None:
        """Populate models"""
        default_models = [
            {
                "name": "Google Gemini 2 flash",
                "provider": LLMProviders.GOOGLE,
                "encoder": "gemini-2.5-flash-preview-04-17",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "OpenAI GPT-4",
                "provider": LLMProviders.OPENAI,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Meta LLaMA 2 13B",
                "provider": LLMProviders.META,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Cohere Command R+",
                "provider": LLMProviders.COHERE,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Anthropic Claude 3",
                "provider": LLMProviders.ANTHROPIC,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "AI21 Jurassic-1 Jumbo",
                "provider": LLMProviders.AI21,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Mistral 7B",
                "provider": LLMProviders.MISTRAL,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "EleutherAI GPT-NeoX 20B",
                "provider": LLMProviders.ELEUTHERAI,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Hugging Face Bloom-176B",
                "provider": LLMProviders.HUGGINGFACE,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "NVIDIA Megatron-Turing NLG 530B",
                "provider": LLMProviders.NVIDIA,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            },
            {
                "name": "Amazon Bedrock Titan",
                "provider": LLMProviders.AMAZON,
                "encoder": "gpt-3.5-turbo",
                "temperature": 0.1,
                "top_p": 0.1,
                'endpoint_url': 'https://generativelanguage.googleapis.com/',
                "cost_per_1m_input": 15,  # 0.15 dollars => 15 cents
                "cost_per_1m_output": 60,  # 0.60 dollars => 60 cents
                "max_input_tokens": 1_048_576,
                "max_output_tokens": 65_535,
                "is_active": True
            }
        ]


        try:
            for model in default_models:
                result = await self.db.execute(select(Model_on_db).where(Model_on_db.name == model["name"]))
                if not result.scalar_one_or_none():
                    self.db.add(Model_on_db(id=uuid.uuid4(), **model))

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error seedeando db para models: {str(e)}"
            )



    async def seed_api_keys(self) -> None:
        """Populate default tiers"""
        result = await self.db.execute(
            select(Model_on_db).where(Model_on_db.name == "Google Gemini 2 flash")
        )
        model = result.scalar_one_or_none()
        if not model:
            raise HTTPException(status_code=404, detail="El modelo no existe.")
        default_keys = [
            {
                "model_id": model.id,
                "api_key": CryptoUtils(key=KEY_FERNET_ENCRYPTION).encrypt(KEY_API_GEMINI),
            },
        ]
        try:
            for key in default_keys:
                result = await self.db.execute(select(APIKey_on_db).where(APIKey_on_db.model_id == key["model_id"]))
                if not result.scalar_one_or_none():
                    self.db.add(APIKey_on_db(id=uuid.uuid4(), **key))

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error seedeando db para usertypes: {str(e)}"
            )
