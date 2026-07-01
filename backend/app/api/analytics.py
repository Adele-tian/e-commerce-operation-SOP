"""数据监控与分析 API"""
import math
import random
from datetime import date, timedelta

from fastapi import APIRouter, Query
from app.services.ai_service import ai_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

# ──────────────────────────────────────────────
# Mock State
# ──────────────────────────────────────────────

def _make_trend(days: int = 30) -> list[dict]:
    """生成模拟趋势数据"""
    base = date(2026, 6, 1)
    data = []
    for i in range(days):
        d = base + timedelta(days=i)
        data.append({
            "date": f"{d.month}/{d.day}",
            "impressions": math.floor(3000 + random.random() * 2000 + i * 80),
            "clicks": math.floor(180 + random.random() * 120 + i * 5),
            "ctr": round(4 + random.random() * 3 + i * 0.05, 1),
            "conversionRate": round(2.5 + random.random() * 1.5 + i * 0.03, 1),
            "positiveRate": round(94 + random.random() * 4, 1),
            "orders": math.floor(30 + random.random() * 20 + i * 1.2),
        })
    return data


def _make_kpi() -> list[dict]:
    return [
        {"label": "总曝光量", "value": "128,456", "change": 12.5,  "icon": "👁️", "color": "primary"},
        {"label": "点击率",   "value": "5.8%",    "change": 3.2,   "icon": "👆", "color": "green"},
        {"label": "转化率",   "value": "3.2%",    "change": -1.5,  "icon": "🛒", "color": "orange"},
        {"label": "好评率",   "value": "96.5%",   "change": 0.8,   "icon": "⭐", "color": "purple"},
    ]


_AB_TEST = [
    {"id": 1, "name": "主图 V1 (蓝色系)",     "type": "主图",   "ctr": 4.2, "cvr": 2.8, "status": "对照组"},
    {"id": 2, "name": "主图 V2 (渐变蓝白)",    "type": "主图",   "ctr": 5.8, "cvr": 3.5, "status": "实验组 - 胜出"},
    {"id": 3, "name": "详情页 A (5屏)",        "type": "详情页", "ctr": 0,   "cvr": 2.9, "status": "对照组"},
    {"id": 4, "name": "详情页 B (7屏+视频)",    "type": "详情页", "ctr": 0,   "cvr": 3.8, "status": "实验组 - 胜出"},
]

_ALERTS = [
    {"id": 1, "type": "warning", "time": "2026-06-28 14:30",
     "title": "好评率下降", "desc": "近7天好评率从97.2%降至95.8%，建议关注最新差评内容",
     "action": "查看评价"},
    {"id": 2, "type": "danger",  "time": "2026-06-27 09:15",
     "title": "转化率异常", "desc": "今日转化率较7日均值下降32%，可能原因：竞品促销活动影响",
     "action": "分析原因"},
    {"id": 3, "type": "info",    "time": "2026-06-26 16:00",
     "title": "流量高峰", "desc": "搜索\"涂抹面膜\"流量突增45%，建议检查广告出价",
     "action": "查看详情"},
]

# Cached trend data (so repeated calls return the same data within a session)
_TREND_CACHE: dict[str, list[dict]] = {}


def _get_trend(period: str) -> list[dict]:
    if period not in _TREND_CACHE:
        days_map = {"day": 30, "week": 12, "month": 6}
        _TREND_CACHE[period] = _make_trend(days_map.get(period, 30))
    return _TREND_CACHE[period]


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/overview")
async def overview():
    """获取 KPI 概览数据"""
    return {"status": "success", "kpi": _make_kpi()}


@router.get("/trend")
async def trend(period: str = Query("day", pattern="^(day|week|month)$")):
    """获取趋势数据"""
    return {"status": "success", "period": period, "data": _get_trend(period)}


@router.get("/ab-test")
async def ab_test():
    """获取 A/B 测试结果"""
    return {"status": "success", "results": _AB_TEST}


@router.get("/alerts")
async def alerts():
    """获取告警列表"""
    return {"status": "success", "alerts": _ALERTS}


@router.post("/report")
async def generate_report(report_type: str = Query("weekly", pattern="^(weekly|monthly|custom)$")):
    """AI 生成分析报告"""
    type_label = {"weekly": "周报", "monthly": "月报", "custom": "专项分析"}[report_type]

    prompt = f"""你是电商数据分析专家。请根据以下运营数据生成一份{type_label}。

核心指标:
- 总曝光量: 128,456 (↑12.5%)
- 点击率: 5.8% (↑3.2%)
- 转化率: 3.2% (↓1.5%)
- 好评率: 96.5% (↑0.8%)

A/B测试: 主图V2胜出(CTR 5.8% vs 4.2%)，详情页B胜出(CVR 3.8% vs 2.9%)
异常告警: 好评率近7天下降1.4%，转化率今日异常下降32%

请输出 Markdown 格式的{type_label}，包含:
1. 数据概览
2. 关键变化分析
3. 优化建议
4. 下期行动计划"""

    result = await ai_service.chat(
        prompt,
        system_prompt="你是专业的电商数据分析师，擅长用数据驱动运营决策。",
    )

    return {
        "status": "success",
        "report_type": report_type,
        "report": result,
        "message": f"{type_label}已生成",
    }


# ──────────────────────────────────────────────
# Product / Content detail endpoints
# ──────────────────────────────────────────────

@router.get("/product/{product_id}")
async def product_analytics(product_id: int):
    """获取单品数据"""
    # Mock 单品数据
    return {
        "status": "success",
        "product_id": product_id,
        "data": {
            "impressions_7d": random.randint(8000, 15000),
            "clicks_7d": random.randint(400, 800),
            "ctr_7d": round(random.uniform(4.0, 6.5), 1),
            "orders_7d": random.randint(30, 80),
            "conversion_rate_7d": round(random.uniform(2.5, 4.0), 1),
            "review_count": random.randint(500, 3000),
            "positive_rate": round(random.uniform(94, 98), 1),
            "trend": _get_trend("day")[:7],
        },
    }


@router.get("/content/{content_id}")
async def content_analytics(content_id: int):
    """获取内容效果数据"""
    return {
        "status": "success",
        "content_id": content_id,
        "data": {
            "content_type": "main_image",
            "impressions": random.randint(3000, 8000),
            "clicks": random.randint(150, 400),
            "ctr": round(random.uniform(3.5, 6.0), 1),
            "conversion_rate": round(random.uniform(2.0, 4.0), 1),
            "status": "published",
            "published_at": "2026-06-20",
        },
    }


@router.post("/snapshot")
async def take_snapshot(product_id: int = Query(1)):
    """手动采集数据快照"""
    today = date.today()
    snapshot = {
        "product_id": product_id,
        "snapshot_date": today.isoformat(),
        "impressions": math.floor(3000 + random.random() * 2000),
        "clicks": math.floor(180 + random.random() * 120),
        "ctr": round(random.uniform(4.0, 6.5), 1),
        "orders": math.floor(30 + random.random() * 20),
        "conversion_rate": round(random.uniform(2.5, 4.0), 1),
        "review_count": random.randint(500, 3000),
        "positive_rate": round(random.uniform(94, 98), 1),
    }
    return {
        "status": "success",
        "message": f"数据快照已采集 ({today.isoformat()})",
        "snapshot": snapshot,
    }
