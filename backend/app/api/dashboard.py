"""总控面板 API - Dashboard 数据接口"""
from datetime import datetime, timedelta
import random

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=dict)
async def get_overview():
    """获取总览统计数据"""
    return {
        "status": "success",
        "stats": {
            "totalProducts": 12,
            "totalKeywords": 348,
            "pendingReview": 7,
            "monthlyGenerated": 56,
        },
    }


@router.get("/trend", response_model=dict)
async def get_trend(days: int = 30):
    """获取趋势数据（曝光/点击/转化）"""
    trend = []
    for i in range(days):
        d = datetime.now() - timedelta(days=days - 1 - i)
        trend.append({
            "date": f"{d.month}/{d.day}",
            "impressions": 8000 + random.randint(0, 4000) + i * 100,
            "clicks": 400 + random.randint(0, 200) + i * 8,
            "conversions": 30 + random.randint(0, 20) + int(i * 1.5),
        })
    return {"status": "success", "trend": trend}


@router.get("/activities", response_model=dict)
async def get_activities():
    """获取最近活动记录"""
    activities = [
        {"id": 1, "type": "keyword", "text": "新增关键词 \"补水涂抹面膜敏感肌\"", "time": "10分钟前"},
        {"id": 2, "type": "image", "text": "主图V3版本已审核通过", "time": "1小时前"},
        {"id": 3, "type": "competitor", "text": "竞品\"珀莱雅\"评价分析完成", "time": "2小时前"},
        {"id": 4, "type": "content", "text": "详情页脚本已生成待审核", "time": "3小时前"},
        {"id": 5, "type": "social", "text": "小红书笔记已标记发布", "time": "昨天"},
        {"id": 6, "type": "video", "text": "短视频脚本审核通过", "time": "昨天"},
    ]
    return {"status": "success", "activities": activities}
