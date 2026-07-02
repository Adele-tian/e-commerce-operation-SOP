"""短视频生成 API"""
import os
import random
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.ai_service import ai_service

try:
    from app.services.video_service import video_service
except Exception:
    video_service = None

router = APIRouter(prefix="/video", tags=["video"])

# 视频存储目录
_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "videos")

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
    "video_url": None,
    "scene_images": [],  # AI 生成的分镜图片 URL
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
        "video_url": _state["video_url"],
        "scene_images": _state["scene_images"],
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
    """启动视频生成（AI生成分镜图 + 图片轮播合成）"""
    steps = [dict(s) for s in GENERATION_STEPS]
    scenes = _state["scenes"]

    # Step 1: 脚本生成 - 完成
    steps[0]["status"] = "complete"
    _state["generation_steps"] = steps
    _state["generation_progress"] = 10

    # Step 2: 分镜渲染 - 生成 AI 图片
    steps[1]["status"] = "in_progress"
    _state["generation_steps"] = steps
    _state["generation_progress"] = 20

    scene_images = []
    if video_service:
        try:
            scene_images = await video_service.generate_scene_images(scenes)
            _state["scene_images"] = scene_images
        except Exception:
            pass

    # 如果没有 AI 图片，用占位图
    if not scene_images:
        scene_images = [f"https://picsum.photos/seed/scene{i}/720/1280" for i in range(len(scenes))]
        _state["scene_images"] = scene_images

    steps[1]["status"] = "complete"
    steps[2]["status"] = "in_progress"
    _state["generation_steps"] = steps
    _state["generation_progress"] = 50

    # Step 3: 视频合成
    video_result = None
    if video_service and scene_images:
        try:
            video_result = await video_service.create_slideshow_video(
                image_urls=scene_images,
                scenes=scenes,
            )
        except Exception:
            video_result = None

    if video_result:
        _state["video_url"] = video_result["video_url"]
        steps[2]["status"] = "complete"
        steps[3]["status"] = "complete"
        steps[4]["status"] = "complete"
        _state["generation_steps"] = steps
        _state["generation_progress"] = 100
        return {
            "status": "success",
            "message": f"视频已生成（{video_result['duration']}s，{video_result['resolution']}）",
            "video_url": video_result["video_url"],
            "scene_images": scene_images,
            "steps": steps,
            "progress": 100,
        }

    # Fallback: 模拟进度
    steps[2]["status"] = "complete"
    steps[3]["status"] = "complete"
    steps[4]["status"] = "in_progress"
    _state["generation_steps"] = steps
    _state["generation_progress"] = 80
    return {
        "status": "success",
        "message": "视频生成已启动（图片轮播模式，需启动后端服务）",
        "scene_images": scene_images,
        "steps": steps,
        "progress": 80,
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
    _state["video_url"] = None
    _state["scene_images"] = []
    return {"status": "success", "scenes": _state["scenes"]}


@router.get("/file/{filename}")
async def serve_video_file(filename: str):
    """提供视频文件访问"""
    filepath = os.path.join(_STORAGE_DIR, filename)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(filepath, media_type="video/mp4")


@router.get("/download")
async def download_video():
    """下载已生成的视频"""
    video_url = _state.get("video_url")
    if not video_url:
        raise HTTPException(status_code=404, detail="暂无已生成的视频")

    # 从 URL 提取文件名
    filename = video_url.rsplit("/", 1)[-1] if "/" in video_url else ""
    filepath = os.path.join(_STORAGE_DIR, filename)
    if os.path.isfile(filepath):
        return FileResponse(filepath, media_type="video/mp4", filename=filename)

    return {"status": "success", "download_url": video_url}


@router.get("/frames")
async def get_frames():
    """获取分镜关键帧图片"""
    scenes = _state["scenes"]
    scene_images = _state.get("scene_images", [])

    frames = []
    for i, scene in enumerate(scenes):
        img_url = scene_images[i] if i < len(scene_images) else f"https://picsum.photos/seed/frame{i}/720/1280"
        frames.append({
            "id": scene.get("id", i + 1),
            "scene": scene.get("scene", f"场景 {i+1}"),
            "image_url": img_url,
            "narration": scene.get("narration", ""),
            "duration": scene.get("duration", 5),
        })

    return {"status": "success", "frames": frames}
