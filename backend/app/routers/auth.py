from pydantic import EmailStr, SecretStr
from fastapi import APIRouter, Depends, Response, Form

from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.db_engine import get_db
from shared.auth.auth import get_current_user_from_refresh_token, CurrentUser

from shared.handlers.auth import AuthHandler
from shared.schemas.auth import ResponseRegister, ResponseLogin, ResponseReauth, ResponseLogout

router = APIRouter(tags=["Autenticación"], prefix='/auth')

@router.post("/registro",response_model=ResponseRegister)
async def register(
        username: str = Form(..., description="Nombre de usuario"),
        password: SecretStr = Form(..., description="Contraseña del usuario"),
        email: EmailStr = Form(..., description="Correo electrónico válido"),
        db: AsyncSession = Depends(get_db)
    ):
    return await AuthHandler(db).register(username_api=username, password_api=password, email_api=email)



@router.post("/login",response_model=ResponseLogin)
async def login(
        response: Response,
        username: str = Form(..., description="Nombre de usuario"),
        password: SecretStr = Form(..., description="Contraseña del usuario"),
        db: AsyncSession = Depends(get_db)
    ):
    return await AuthHandler(db).login(username_api=username, password_api=password, response=response)



@router.post("/reauth",response_model=ResponseReauth)
async def refresh_token(
        current_user: CurrentUser = Depends(get_current_user_from_refresh_token),
        db: AsyncSession = Depends(get_db)
    ):
    return AuthHandler(db).reauth(current_user)



@router.post("/logout",response_model=ResponseLogout)
async def logout(
        response: Response,
        current_user: CurrentUser = Depends(get_current_user_from_refresh_token),
        db: AsyncSession = Depends(get_db)
    ):
    return AuthHandler(db).logout(response)
