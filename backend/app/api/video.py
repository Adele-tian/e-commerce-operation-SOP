"""短视频生成 API"""
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ai_service

router = APIRouter(prefix="/video", tags=["video"])

# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────

class ScriptRequest(BaseModel):
    video_type: str = "showcase"   # showcase / tutorial / lifestyle / kol / compare
    product_name: str = "涂抹面膜-补水保湿款"
    duration: int = 30             # 目标时长（秒）
    tone: str = "专业活力"


class Scene(BaseModel):
    id: int
    scene: str
    description: str
    narration: str
    duration: int


class UpdateScenesRequest(BaseModel):
    scenes: list[Scene]


class ReviewRequest(BaseModel):
    action: str   # approve / reject
    notes: Optional[str] = None


# ──────────────────────────────────────────────
# Video Type Metadata
# ──────────────────────────────────────────────

VIDEO_TYPES = [
    {"id": "showcase",  "label": "产品展示",  "icon": "🎁"},
    {"id": "tutorial",  "label": "使用教程",  "icon": "📖"},
    {"id": "lifestyle", "label": "生活场景",  "icon": "🏡"},
    {"id": "kol",       "label": "KOL推荐",   "icon": "🌟"},
    {"id": "compare",   "label": "对比评测",  "icon": "⚖️"},
]

# ──────────────────────────────────────────────
# Mock State
# ──────────────────────────────────────────────

_DEFAULT_SCENES: list[dict] = [
    {"id": 1, "scene": "开场",     "description": "产品特写，镜头从模糊到清晰，文字浮现产品名",       "narration": "你的肌肤，值得更好的呵护",                        "duration": 3},
    {"id": 2, "scene": "痛点展示", "description": "分屏展示干燥起皮的皮肤问题",                     "narration": "换季干燥、熬夜暗沉，这些肌肤问题困扰着你吗？",       "duration": 5},
    {"id": 3, "scene": "产品介绍", "description": "产品旋转展示，质地挤出特写",                     "narration": "全新水润涂抹面膜，72小时持久保湿",                 "duration": 5},
    {"id": 4, "scene": "使用演示", "description": "模特涂抹面膜过程，展示质地和使用方法",             "narration": "细腻质地，轻松涂抹，敏感肌也能放心用",             "duration": 8},
    {"id": 5, "scene": "效果展示", "description": "使用前后皮肤状态对比",                           "narration": "肉眼可见的水润变化，肌肤重新焕发光彩",             "duration": 5},
    {"id": 6, "scene": "结尾",     "description": "产品+品牌logo，优惠信息",                        "narration": "现在下单享限时优惠，给肌肤最好的礼物",             "duration": 4},
]

GENERATION_STEPS = [
    {"step": "脚本生成", "status": "pending"},
    {"step": "分镜渲染", "status": "pending"},
    {"step": "视频合成", "status": "pending"},
    {"step": "配音合成", "status": "pending"},
    {"step": "最终输出", "status": "pending"},
]

_state: dict = {
    "scenes": list(_DEFAULT_SCENES),
    "video_type": "showcase",
    "review_status": "draft",
    "notes": None,
    "generation_progress": None,
    "generation_steps": [dict(s) for s in GENERATION_STEPS],
}


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/types")
async def get_video_types():
    """获取支持的视频类型"""
    return {"status": "success", "types": VIDEO_TYPES}


@router.get("/script")
async def get_script():
    """获取当前分镜脚本"""
    return {
        "status": "success",
        "scenes": _state["scenes"],
        "video_type": _state["video_type"],
        "review_status": _state["review_status"],
    }


@router.post("/script/generate")
async def generate_script(req: ScriptRequest):
    """AI 生成分镜脚本"""
    type_label = next((t["label"] for t in VIDEO_TYPES if t["id"] == req.video_type), req.video_type)

    prompt = f"""你是短视频脚本策划专家。请为「{req.product_name}」生成一条{type_label}类型的{req.duration}秒短视频脚本。
语气风格: {req.tone}

输出 JSON 数组格式:
[{{"id": 1, "scene": "场景名", "description": "画面描述", "narration": "旁白文案", "duration": 5}}]
要求: 总时长恰好 {req.duration} 秒，分 4-7 个分镜。"""

    result = await ai_service.chat(
        prompt,
        system_prompt="你是资深短视频脚本策划师，擅长高完播率的短视频脚本。",
    )

    import json
    try:
        start = result.find("[")
        end = result.rfind("]") + 1
        scenes = json.loads(result[start:end])
        _state["scenes"] = scenes[:8]
    except Exception:
        # AI 未配置时保持默认场景
        pass

    _state["video_type"] = req.video_type
    _state["review_status"] = "draft"
    return {
        "status": "success",
        "message": "分镜脚本已生成",
        "scenes": _state["scenes"],
    }


@router.post("/scenes/update")
async def update_scenes(req: UpdateScenesRequest):
    """手动更新分镜"""
    _state["scenes"] = [s.model_dump() for s in req.scenes]
    return {"status": "success", "scenes": _state["scenes"]}


@router.post("/generate")
async def start_generation():
    """启动视频生成（模拟异步进度）"""
    steps = [dict(s) for s in GENERATION_STEPS]
    # 模拟前两步已完成
    steps[0]["status"] = "complete"
    steps[1]["status"] = "complete"
    steps[2]["status"] = "in_progress"
    _state["generation_steps"] = steps
    _state["generation_progress"] = 45
    return {
        "status": "success",
        "message": "视频生成已启动",
        "steps": steps,
        "progress": 45,
    }


@router.get("/generation/status")
async def generation_status():
    """查询生成进度"""
    return {
        "status": "success",
        "steps": _state["generation_steps"],
        "progress": _state["generation_progress"],
    }


@router.post("/review")
async def review_video(req: ReviewRequest):
    """审核视频脚本"""
    if req.action == "approve":
        _state["review_status"] = "approved"
    elif req.action == "reject":
        _state["review_status"] = "draft"
    else:
        raise HTTPException(status_code=400, detail="无效操作")
    if req.notes:
        _state["notes"] = req.notes
    return {"status": "success", "review_status": _state["review_status"], "notes": _state["notes"]}


@router.post("/reset")
async def reset_script():
    """重置分镜为默认模板"""
    import copy
    _state["scenes"] = copy.deepcopy(_DEFAULT_SCENES)
    _state["review_status"] = "draft"
    _state["generation_progress"] = None
    _state["generation_steps"] = [dict(s) for s in GENERATION_STEPS]
    return {"status": "success", "scenes": _state["scenes"]}
