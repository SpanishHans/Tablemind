import os
import uuid
from pydantic import EmailStr, SecretStr
from fastapi import HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth.auth import CurrentUser
from shared.utils.auth import PasswordService, TokenService
from shared.utils.text import TextUtils

from shared.ops.user import UsersDb
from shared.schemas.auth import ResponseRegister, ResponseLogin, ResponseReauth, ResponseLogout, ResponseDelete, ResponseUpdate

PRODUCTION_MODE = os.getenv("PRODUCTION_MODE", "False").lower() in ("1", "true", "yes")

class AuthHandler:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.userondb = UsersDb(self.db)
        self.textutils = TextUtils()



    async def register(self, username_api:str, email_api:EmailStr, password_api:SecretStr) -> ResponseRegister:
        username = self.textutils.sanitize_text(username_api)
        password = PasswordService(self.textutils.sanitize_text(password_api.get_secret_value())).hash_password()
        email = self.textutils.is_valid_and_safe_email(email_api)

        dup = await self.userondb.check_user_duplicity(username, email)
        if dup:
            raise HTTPException(status_code=400, detail="No se pudo completar el registro.")
        await self.userondb.create_user_entry(username, email, password)
        return ResponseRegister(
            username=username,
            email=email
        )



    async def UserDelete(self, username_api:str, email_api:EmailStr, password_api:SecretStr) -> ResponseDelete:
        username = self.textutils.sanitize_text(username_api)
        password = PasswordService(self.textutils.sanitize_text(password_api.get_secret_value())).hash_password()
        email = self.textutils.is_valid_and_safe_email(email_api)

        await self.userondb.delete_user_entry(username=username, email=email, passwd=password)
        return ResponseDelete(
            username=username,
            email=email
        )



    async def UserUpdateUsername(self, current_user: CurrentUser, username_api:str) -> ResponseUpdate:
        username = self.textutils.sanitize_text(username_api)

        await self.userondb.update_user_entry(id=current_user.id, username=username)
        return ResponseUpdate(message='Username actualizado')



    async def UserUpdateEmail(self, current_user: CurrentUser, email_api:EmailStr) -> ResponseUpdate:
        email = self.textutils.is_valid_and_safe_email(email_api)

        await self.userondb.update_user_entry(id=current_user.id, email=email)
        return ResponseUpdate(message='Email actualizado')



    async def UserUpdatePassword(self, current_user: CurrentUser, password_api:SecretStr) -> ResponseUpdate:
        password = PasswordService(self.textutils.sanitize_text(password_api.get_secret_value())).hash_password()

        await self.userondb.update_user_entry(id=current_user.id, password_hash=password)
        return ResponseUpdate(message='Contraseña actualizada')



    async def UserUpdateTier(self, current_user: CurrentUser, username_api:str, tier_api: uuid.UUID) -> ResponseUpdate:
        current_tier = await self.userondb.get_user_tier(current_user.id)
        if current_tier != "admin":
            raise HTTPException(status_code=403, detail="No tienes permiso para actualizar el tier de otros usuarios.")

        user = await self.userondb.get_user_entry_for_login(username_api)
        if user is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        await self.userondb.update_user_entry(id=user.id, usertier=tier_api)
        return ResponseUpdate(message='Tier actualizado')



    async def UserUpdateProfilePic(self, current_user: CurrentUser, pic_api: str) -> ResponseUpdate:
        profile_picture = self.textutils.sanitize_text(pic_api)

        await self.userondb.update_user_entry(id=current_user.id, profile_picture=profile_picture)
        return ResponseUpdate(message='Profile Pic actualizada')



    async def UserUpdateBio(self, current_user: CurrentUser, bio_api: str) -> ResponseUpdate:
        bio = self.textutils.sanitize_text(bio_api)

        await self.userondb.update_user_entry(id=current_user.id, biography=bio)
        return ResponseUpdate(message='Bio actualizada')



    async def login(self, username_api: str, password_api: SecretStr, response: Response) -> ResponseLogin:
        user = await self.userondb.get_user_entry_for_login(username_api)

        fake_hash = "$2b$12$" + "a" * 53
        password_matches = PasswordService(password_api.get_secret_value()).verify_password(
            user.password_hash if user else fake_hash
        )

        if user is None or not password_matches:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token, refresh_token = TokenService(user.id, user.username).generate_tokens()

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=PRODUCTION_MODE,  # ⚠️ Set to True in production
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
        )

        return ResponseLogin(
            access_token=access_token,
            username=username_api
        )



    def reauth(self, current_user: CurrentUser) -> ResponseReauth:
        new_access_token, _ = TokenService(current_user.id, current_user.username).generate_tokens()
        return ResponseReauth(
            access_token=new_access_token,
        )



    def logout(self, response: Response) -> ResponseLogout:
        response.delete_cookie("refresh_token")
        return ResponseLogout(message="Log out correcto")
