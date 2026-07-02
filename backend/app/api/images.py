"""主图生成 API"""
import os
import random
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.ai_service import ai_service

try:
    from app.services.image_service import image_service
except Exception:
    image_service = None

router = APIRouter(prefix="/images", tags=["images"])


class BriefRequest(BaseModel):
    product_name: str = "涂抹面膜"
    category: str = "涂抹面膜"
    selling_points: list[str] = ["72小时持久保湿", "敏感肌适用", "免洗配方"]


class GenerateRequest(BaseModel):
    brief: dict
    count: int = 3


class ReviewRequest(BaseModel):
    image_id: int
    action: str  # approve / reject / regenerate
    notes: Optional[str] = None


# 默认 Brief 模板
_DEFAULT_BRIEF = {
    "composition": "产品居中45°俯拍，背景渐变浅蓝到白",
    "color_scheme": "主色调浅蓝+白色，点缀金色高光",
    "copy_text": "涂抹面膜 补水保湿 72小时持久水润",
    "selling_points": ["72小时持久保湿", "敏感肌适用", "免洗配方", "专利成分"],
}

# 存储目录
_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "images")

# Mock 生成结果（包含图片 URL）
_MOCK_IMAGES = [
    {"id": 1, "version": "V1-A", "status": "approved", "score": 4.5, "notes": "构图清晰，文案位置合理",
     "image_url": "https://picsum.photos/seed/img1a/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img1a/300/300", "prompt": "电商主图-产品居中-蓝白渐变"},
    {"id": 2, "version": "V1-B", "status": "draft", "score": 3.8, "notes": "",
     "image_url": "https://picsum.photos/seed/img1b/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img1b/300/300", "prompt": "电商主图-左图右文-白色简约"},
    {"id": 3, "version": "V1-C", "status": "draft", "score": 4.0, "notes": "",
     "image_url": "https://picsum.photos/seed/img1c/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img1c/300/300", "prompt": "电商主图-场景图-自然风"},
    {"id": 4, "version": "V2-A", "status": "pending_review", "score": 4.2, "notes": "优化了配色方案",
     "image_url": "https://picsum.photos/seed/img2a/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img2a/300/300", "prompt": "电商主图-产品居中-绿白清新"},
    {"id": 5, "version": "V2-B", "status": "draft", "score": 3.5, "notes": "",
     "image_url": "https://picsum.photos/seed/img2b/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img2b/300/300", "prompt": "电商主图-成分展示-科技感"},
    {"id": 6, "version": "V2-C", "status": "published", "score": 4.8, "notes": "最终选用版本",
     "image_url": "https://picsum.photos/seed/img2c/1024/1024", "thumbnail_url": "https://picsum.photos/seed/img2c/300/300", "prompt": "电商主图-产品居中-粉白温柔"},
]


@router.get("/brief/default", response_model=dict)
async def get_default_brief():
    """获取默认设计Brief模板"""
    return {"status": "success", "brief": _DEFAULT_BRIEF}


@router.post("/brief/generate", response_model=dict)
async def generate_brief(req: BriefRequest):
    """AI自动生成设计Brief"""
    prompt = f"""你是电商主图设计专家。请为「{req.product_name}」产品生成主图设计Brief。
产品卖点: {', '.join(req.selling_points)}

请返回JSON格式:
{{"composition": "构图方式描述",
  "color_scheme": "配色方案描述",
  "copy_text": "主图文案",
  "selling_points": ["卖点1", "卖点2", "卖点3"]}}"""

    result = await ai_service.chat(prompt, system_prompt="你是电商视觉设计专家。")
    try:
        import json
        start = result.find("{")
        end = result.rfind("}") + 1
        brief = json.loads(result[start:end])
    except Exception:
        brief = _DEFAULT_BRIEF

    return {"status": "success", "brief": brief}


@router.post("/generate", response_model=dict)
async def generate_images(req: GenerateRequest):
    """根据 Brief 生成主图（接入通义万相 AI 生图）"""
    base_id = max(img["id"] for img in _MOCK_IMAGES) + 1 if _MOCK_IMAGES else 1
    count = min(req.count, 6)

    # 尝试调用真实 AI 生图
    ai_results = []
    if image_service:
        try:
            ai_results = await image_service.generate_main_images(
                brief=req.brief,
                product_name="涂抹面膜",
                count=count,
            )
        except Exception:
            ai_results = []

    new_images = []
    for i in range(count):
        ai_data = ai_results[i] if i < len(ai_results) else {}
        seed = random.randint(100, 999)
        new_images.append({
            "id": base_id + i,
            "version": f"V{base_id}-{chr(65 + i)}",
            "status": "draft",
            "score": round(3.5 + random.random() * 1.2, 1),
            "notes": "",
            "image_url": ai_data.get("image_url", f"https://picsum.photos/seed/{seed}/1024/1024"),
            "thumbnail_url": ai_data.get("thumbnail_url", f"https://picsum.photos/seed/{seed}/300/300"),
            "prompt": ai_data.get("prompt", "AI生成主图"),
            "local_path": ai_data.get("local_path"),
        })

    _MOCK_IMAGES.extend(new_images)
    return {
        "status": "success",
        "message": f"已生成 {len(new_images)} 个主图版本",
        "images": new_images,
    }


@router.get("/list", response_model=dict)
async def list_images():
    """获取所有生成的主图"""
    return {"status": "success", "images": _MOCK_IMAGES}


@router.post("/review", response_model=dict)
async def review_image(req: ReviewRequest):
    """审核主图（通过/打回/重新生成）"""
    img = next((i for i in _MOCK_IMAGES if i["id"] == req.image_id), None)
    if not img:
        raise HTTPException(status_code=404, detail="图片不存在")

    if req.action == "approve":
        img["status"] = "approved"
        img["notes"] = req.notes or img["notes"]
    elif req.action == "reject":
        img["status"] = "draft"
        img["notes"] = req.notes or "已打回"
    elif req.action == "regenerate":
        img["status"] = "draft"
        img["score"] = round(img["score"] + 0.3, 1)
        img["notes"] = "已重新生成"
    else:
        raise HTTPException(status_code=400, detail="无效操作")

    return {"status": "success", "image": img}


@router.post("/publish/{image_id}", response_model=dict)
async def publish_image(image_id: int):
    """发布主图"""
    img = next((i for i in _MOCK_IMAGES if i["id"] == image_id), None)
    if not img:
        raise HTTPException(status_code=404, detail="图片不存在")
    if img["status"] != "approved":
        raise HTTPException(status_code=400, detail="只有已通过的图片才能发布")
    img["status"] = "published"
    return {"status": "success", "image": img}


@router.get("/file/{filename}")
async def serve_image_file(filename: str):
    """提供本地存储图片的访问"""
    filepath = os.path.join(_STORAGE_DIR, filename)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(filepath, media_type="image/jpeg")


@router.get("/{image_id}/download")
async def download_image(image_id: int):
    """下载指定主图"""
    img = next((i for i in _MOCK_IMAGES if i["id"] == image_id), None)
    if not img:
        raise HTTPException(status_code=404, detail="图片不存在")

    # 优先返回本地文件
    local = img.get("local_path")
    if local and os.path.isfile(local):
        return FileResponse(local, media_type="image/jpeg", filename=os.path.basename(local))

    # 否则返回 URL（让前端自行下载）
    return {"status": "success", "download_url": img.get("image_url", "")}


# ──────────────────────────────────────────────
# 竞品主图分析
# ──────────────────────────────────────────────

_SEARCH_ANALYSIS_CACHE: dict[int, dict] = {}


@router.post("/search-analysis")
async def start_search_analysis(keyword: str = "涂抹面膜", top_n: int = 20):
    """启动竞品主图分析"""
    # Mock 分析结果
    analysis = {
        "keyword": keyword,
        "top_n": top_n,
        "design_elements": {
            "composition": [
                {"style": "产品居中", "count": 12, "percent": 60},
                {"style": "左侧产品+右侧文案", "count": 5, "percent": 25},
                {"style": "全背景+产品", "count": 3, "percent": 15},
            ],
            "color_schemes": [
                {"scheme": "蓝白渐变", "count": 8, "percent": 40},
                {"scheme": "白色简约", "count": 5, "percent": 25},
                {"scheme": "绿色自然", "count": 4, "percent": 20},
                {"scheme": "粉色温柔", "count": 3, "percent": 15},
            ],
            "copy_styles": [
                {"style": "大字标题+卖点", "count": 14, "percent": 70},
                {"style": "小字描述型", "count": 4, "percent": 20},
                {"style": "无文字纯产品", "count": 2, "percent": 10},
            ],
        },
        "high_ctr_features": [
            "浅色背景（CTR 高于均值 23%）",
            "产品占图比 60%+ （CTR 高于均值 18%）",
            "含价格信息（CTR 高于均值 15%）",
        ],
        "differentiation_suggestions": [
            "当前市场蓝白配色占主，建议尝试暖色系差异化",
            "多数主图缺少使用场景，可加入真人涂抹场景图",
            "文案同质化严重，可突出'72小时'数字记忆点",
            "建议增加产品成分可视化展示（如玻尿酸分子图示）",
        ],
    }
    _SEARCH_ANALYSIS_CACHE[1] = analysis
    return {"status": "success", "id": 1, "analysis": analysis}


@router.get("/search-analysis/{analysis_id}")
async def get_search_analysis(analysis_id: int):
    """获取竞品主图分析结果"""
    analysis = _SEARCH_ANALYSIS_CACHE.get(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="分析结果不存在")
    return {"status": "success", "analysis": analysis}
