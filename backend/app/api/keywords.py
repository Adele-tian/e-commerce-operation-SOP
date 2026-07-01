"""关键词分析 API"""
import io
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.ai_service import ai_service
from app.services.export_service import export_service

router = APIRouter(prefix="/keywords", tags=["keywords"])


# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────

class KeywordCreate(BaseModel):
    keyword: str
    search_volume: Optional[int] = None
    competition_level: Optional[float] = None
    category: Optional[str] = None
    potential_score: Optional[float] = None
    source: Optional[str] = None
    product_id: Optional[int] = None
    notes: Optional[str] = None


class CollectRequest(BaseModel):
    seed_keyword: str
    product_id: Optional[int] = None


class ClassifyRequest(BaseModel):
    keyword_ids: list


# ──────────────────────────────────────────────
# Mock 数据
# ──────────────────────────────────────────────

_MOCK_KEYWORDS = [
    {"id": 1, "keyword": "涂抹面膜", "search_volume": 58000, "competition_level": 0.82, "category": "功能需求", "potential_score": 0.65, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 2, "keyword": "涂抹面膜补水保湿", "search_volume": 32000, "competition_level": 0.71, "category": "功能需求", "potential_score": 0.78, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 3, "keyword": "涂抹面膜敏感肌", "search_volume": 24000, "competition_level": 0.55, "category": "人群需求", "potential_score": 0.88, "source": "下拉词", "product_id": 1, "notes": "高潜力"},
    {"id": 4, "keyword": "免洗睡眠面膜", "search_volume": 41000, "competition_level": 0.68, "category": "场景需求", "potential_score": 0.82, "source": "相关搜索", "product_id": 1, "notes": ""},
    {"id": 5, "keyword": "涂抹面膜美白", "search_volume": 19000, "competition_level": 0.62, "category": "功能需求", "potential_score": 0.72, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 6, "keyword": "涂抹面膜控油", "search_volume": 15000, "competition_level": 0.48, "category": "功能需求", "potential_score": 0.85, "source": "相关搜索", "product_id": 1, "notes": ""},
    {"id": 7, "keyword": "涂抹面膜夏天", "search_volume": 22000, "competition_level": 0.58, "category": "场景需求", "potential_score": 0.75, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 8, "keyword": "涂抹面膜学生党", "search_volume": 12000, "competition_level": 0.35, "category": "人群需求", "potential_score": 0.92, "source": "相关搜索", "product_id": 1, "notes": "蓝海"},
    {"id": 9, "keyword": "涂抹面膜平价", "search_volume": 28000, "competition_level": 0.72, "category": "人群需求", "potential_score": 0.68, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 10, "keyword": "涂抹面膜清洁毛孔", "search_volume": 18000, "competition_level": 0.52, "category": "功能需求", "potential_score": 0.80, "source": "相关搜索", "product_id": 1, "notes": ""},
    {"id": 11, "keyword": "涂抹面膜祛痘", "search_volume": 16000, "competition_level": 0.58, "category": "功能需求", "potential_score": 0.76, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 12, "keyword": "涂抹面膜男士", "search_volume": 8000, "competition_level": 0.28, "category": "人群需求", "potential_score": 0.95, "source": "相关搜索", "product_id": 1, "notes": "蓝海"},
    {"id": 13, "keyword": "涂抹面膜出差旅行", "search_volume": 5000, "competition_level": 0.22, "category": "场景需求", "potential_score": 0.88, "source": "相关搜索", "product_id": 1, "notes": ""},
    {"id": 14, "keyword": "涂抹面膜紧致抗皱", "search_volume": 14000, "competition_level": 0.60, "category": "功能需求", "potential_score": 0.70, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 15, "keyword": "涂抹面膜晒后修复", "search_volume": 11000, "competition_level": 0.42, "category": "场景需求", "potential_score": 0.83, "source": "相关搜索", "product_id": 1, "notes": ""},
    {"id": 16, "keyword": "珀莱雅涂抹面膜", "search_volume": 35000, "competition_level": 0.90, "category": "品牌需求", "potential_score": 0.45, "source": "下拉词", "product_id": 1, "notes": "竞品词"},
    {"id": 17, "keyword": "涂抹面膜泥膜", "search_volume": 20000, "competition_level": 0.65, "category": "功能需求", "potential_score": 0.72, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 18, "keyword": "涂抹面膜熬夜急救", "search_volume": 9000, "competition_level": 0.38, "category": "场景需求", "potential_score": 0.90, "source": "相关搜索", "product_id": 1, "notes": "高潜力"},
    {"id": 19, "keyword": "涂抹面膜油皮", "search_volume": 17000, "competition_level": 0.55, "category": "人群需求", "potential_score": 0.80, "source": "下拉词", "product_id": 1, "notes": ""},
    {"id": 20, "keyword": "涂抹面膜干皮补水", "search_volume": 13000, "competition_level": 0.50, "category": "人群需求", "potential_score": 0.85, "source": "相关搜索", "product_id": 1, "notes": ""},
]

_next_id = 21


# ──────────────────────────────────────────────
# 端点
# ──────────────────────────────────────────────

@router.post("/collect", response_model=dict)
async def collect_keywords(req: CollectRequest):
    """采集关键词（输入种子词，自动扩展）"""
    global _next_id
    seed = req.seed_keyword
    # 模拟采集扩展
    expanded = [
        {"keyword": f"{seed}补水", "search_volume": 12000, "competition_level": 0.55, "category": "功能需求", "source": "下拉词"},
        {"keyword": f"{seed}美白", "search_volume": 8000, "competition_level": 0.48, "category": "功能需求", "source": "下拉词"},
        {"keyword": f"{seed}敏感肌", "search_volume": 6000, "competition_level": 0.42, "category": "人群需求", "source": "相关搜索"},
        {"keyword": f"{seed}夏天", "search_volume": 9500, "competition_level": 0.50, "category": "场景需求", "source": "下拉词"},
        {"keyword": f"{seed}平价", "search_volume": 7000, "competition_level": 0.60, "category": "人群需求", "source": "相关搜索"},
    ]
    created = 0
    for item in expanded:
        exists = any(k["keyword"] == item["keyword"] for k in _MOCK_KEYWORDS)
        if not exists:
            new_kw = {
                "id": _next_id,
                **item,
                "potential_score": round(0.5 + 0.5 * (1 - item["competition_level"]), 2),
                "product_id": req.product_id or 1,
                "notes": "",
            }
            _MOCK_KEYWORDS.append(new_kw)
            _next_id += 1
            created += 1

    return {"status": "success", "collected": len(expanded), "new_created": created}


@router.get("/list", response_model=dict)
async def list_keywords(
    search: Optional[str] = Query(None, description="搜索关键词"),
    category: Optional[str] = Query(None, description="分类筛选"),
    sort_by: str = Query("search_volume", description="排序字段"),
    sort_dir: str = Query("desc", description="排序方向 asc/desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """获取关键词列表（支持筛选、排序、分页）"""
    filtered = list(_MOCK_KEYWORDS)

    if search:
        filtered = [k for k in filtered if search in k["keyword"]]
    if category and category != "all":
        filtered = [k for k in filtered if k["category"] == category]

    # 排序
    reverse = sort_dir == "desc"
    filtered.sort(key=lambda k: k.get(sort_by, 0) or 0, reverse=reverse)

    total = len(filtered)
    start = (page - 1) * page_size
    items = filtered[start: start + page_size]

    return {
        "status": "success",
        "keywords": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/", response_model=dict)
async def create_keyword(req: KeywordCreate):
    """手动创建关键词"""
    global _next_id
    exists = any(k["keyword"] == req.keyword for k in _MOCK_KEYWORDS)
    if exists:
        raise HTTPException(status_code=400, detail="关键词已存在")

    new_kw = {
        "id": _next_id,
        "keyword": req.keyword,
        "search_volume": req.search_volume or 0,
        "competition_level": req.competition_level or 0.5,
        "category": req.category or "未分类",
        "potential_score": req.potential_score or 0.5,
        "source": req.source or "手动添加",
        "product_id": req.product_id or 1,
        "notes": req.notes or "",
    }
    _MOCK_KEYWORDS.append(new_kw)
    _next_id += 1
    return {"status": "success", "id": new_kw["id"]}


@router.delete("/{keyword_id}", response_model=dict)
async def delete_keyword(keyword_id: int):
    """删除关键词"""
    global _MOCK_KEYWORDS
    before = len(_MOCK_KEYWORDS)
    _MOCK_KEYWORDS = [k for k in _MOCK_KEYWORDS if k["id"] != keyword_id]
    if len(_MOCK_KEYWORDS) == before:
        raise HTTPException(status_code=404, detail="关键词不存在")
    return {"status": "success"}


@router.post("/analyze", response_model=dict)
async def analyze_keywords(req: ClassifyRequest):
    """AI自动分类关键词"""
    results = []
    for kw_id in req.keyword_ids:
        kw = next((k for k in _MOCK_KEYWORDS if k["id"] == kw_id), None)
        if kw:
            # 模拟 AI 分类
            classification = await ai_service.classify_keyword(kw["keyword"])
            kw["category"] = classification.get("category", kw["category"])
            kw["potential_score"] = classification.get("potential_score", kw["potential_score"])
            kw["notes"] = classification.get("reason", kw["notes"])
            results.append({
                "id": kw["id"],
                "keyword": kw["keyword"],
                "category": kw["category"],
                "potential_score": kw["potential_score"],
            })

    return {"status": "success", "classified": len(results), "results": results}


@router.get("/export")
async def export_keywords(category: Optional[str] = Query(None)):
    """导出关键词为 Excel"""
    keywords = list(_MOCK_KEYWORDS)
    if category and category != "all":
        keywords = [k for k in keywords if k["category"] == category]

    data = [
        {
            "keyword": kw["keyword"],
            "search_volume": kw["search_volume"],
            "competition_level": kw["competition_level"],
            "potential_score": kw["potential_score"],
            "category": kw["category"],
            "source": kw["source"],
            "notes": kw["notes"],
        }
        for kw in keywords
    ]

    buffer = export_service.export_keywords(data)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=keywords.xlsx"},
    )
