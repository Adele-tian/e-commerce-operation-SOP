from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.health import router as health_router
from app.api.market import router as market_router
from app.api.keywords import router as keywords_router
from app.api.competitors import router as competitors_router
from app.api.dashboard import router as dashboard_router
from app.api.images import router as images_router
from app.api.buyer_show import router as buyer_show_router
from app.api.detail_page import router as detail_page_router
from app.api.video import router as video_router
from app.api.social import router as social_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router

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

app.include_router(auth_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(market_router, prefix="/api")
app.include_router(keywords_router, prefix="/api")
app.include_router(competitors_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(images_router, prefix="/api")
app.include_router(buyer_show_router, prefix="/api")
app.include_router(detail_page_router, prefix="/api")
app.include_router(video_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
