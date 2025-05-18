from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware

from seed import SeedDb
from shared.db.db_engine import init_db, SessionLocal
from routers.auth import router as router_auth
from routers.job import router as router_job
from routers.media import router as router_media
from routers.model import router as router_model
from routers.prompt import router as router_prompt

VERSION = os.getenv("VERSION", "1.0.0")

app = FastAPI(
    title="Servicio de Autenticación",
    description="API para gestión de usuarios y autenticación",
    version=VERSION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://frontend:3000",
    ],  # Frontend container and local dev
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

@app.on_event("startup")
async def startup():
    await init_db()
    async with SessionLocal() as session:
            seeder = SeedDb(session)
            await seeder.seed_usertypes()
            await seeder.seed_root_user()
            await seeder.seed_models()
            await seeder.seed_api_keys()


@app.get("/")
async def api_welcome():
    return {"message": "Hello, bienvenido a Tablemind API!"}

# Register your API routes
app.include_router(router_auth)
app.include_router(router_job)
app.include_router(router_media)
app.include_router(router_model)
app.include_router(router_prompt)
