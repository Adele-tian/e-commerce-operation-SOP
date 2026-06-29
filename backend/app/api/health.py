from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "淘宝SOP运营工具"}


@router.get("/health/db")
def db_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}
