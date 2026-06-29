from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.health import router as health_router

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="淘宝涂抹面膜全流程SOP自动化系统 API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
