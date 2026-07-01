"""蓝海探测 API"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.scraper import scraper_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/market", tags=["market"])


class ScanRequest(BaseModel):
    keyword: str


class MarketResult(BaseModel):
    keyword: str
    total_products: int
    avg_price: float
    avg_sales: float
    market_capacity: str
    top_seller_share: float
    new_product_survival: float
    blue_ocean_score: int
    price_distribution: list
    products: list
    report: Optional[str] = None


# 内存缓存扫描结果 (生产环境应存数据库)
_scan_cache: dict = {}


@router.post("/blue-ocean/scan", response_model=dict)
async def scan_blue_ocean(req: ScanRequest):
    """启动蓝海扫描任务"""
    keyword = req.keyword.strip()
    if not keyword:
        return {"error": "关键词不能为空"}

    # 采集市场数据
    market_data = await scraper_service.search_products(keyword)

    # 生成AI评估报告
    report = await ai_service.generate_market_report(market_data)
    market_data["report"] = report

    # 缓存结果
    _scan_cache[keyword] = {
        "data": market_data,
        "scanned_at": datetime.now().isoformat(),
    }

    return {"status": "success", "keyword": keyword, "message": "扫描完成"}


@router.get("/blue-ocean/results", response_model=dict)
async def get_scan_results(keyword: str = Query(..., description="查询的关键词")):
    """获取蓝海扫描结果"""
    if keyword in _scan_cache:
        cached = _scan_cache[keyword]
        return {
            "status": "success",
            "result": cached["data"],
            "scanned_at": cached["scanned_at"],
        }

    # 缓存不存在时实时扫描
    market_data = await scraper_service.search_products(keyword)
    report = await ai_service.generate_market_report(market_data)
    market_data["report"] = report

    _scan_cache[keyword] = {
        "data": market_data,
        "scanned_at": datetime.now().isoformat(),
    }

    return {
        "status": "success",
        "result": market_data,
        "scanned_at": datetime.now().isoformat(),
    }
