"""社媒内容营销 API"""
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ai_service

router = APIRouter(prefix="/social", tags=["social"])

# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────

class GenerateRequest(BaseModel):
    platform: str = "xiaohongshu"   # xiaohongshu / douyin / wechat
    product_name: str = "涂抹面膜-补水保湿款"
    goal: str = "engagement"        # awareness / conversion / engagement
    tone: str = "casual"            # casual / professional / emotional


class MarkPublishedRequest(BaseModel):
    content_id: int


PLATFORMS = [
    {"id": "xiaohongshu", "label": "小红书", "icon": "📕"},
    {"id": "douyin",      "label": "抖音",   "icon": "🎵"},
    {"id": "wechat",      "label": "朋友圈", "icon": "💬"},
]

# ──────────────────────────────────────────────
# Mock State
# ──────────────────────────────────────────────

_CONTENT_ID = 0


def _next_id() -> int:
    global _CONTENT_ID
    _CONTENT_ID += 1
    return _CONTENT_ID


_GENERATED: dict[str, list[dict]] = {
    "xiaohongshu": [{
        "id": _next_id(),
        "platform": "xiaohongshu",
        "title": "敏感肌姐妹看过来！这款涂抹面膜我真的爱了",
        "body": "作为一个资深敏感肌，对面膜真的又爱又怕 😭\n直到遇到这款涂抹面膜，真的打开了新世界的大门！\n\n✨ 质地：超级细腻的奶油质地，上脸冰冰凉凉\n💧 保湿：72小时不是吹的，第二天起来还是水当当\n🌿 温和：完全不刺激，敏感肌放心冲！\n\n已经回购第三瓶了，强烈推荐给和我一样的敏感肌姐妹 💕",
        "tags": ["涂抹面膜", "敏感肌护肤", "补水面膜推荐", "护肤好物分享"],
        "image_tip": "产品平铺图 + 质地特写 + 使用过程 + 前后对比",
        "status": "draft",
    }],
    "douyin": [{
        "id": _next_id(),
        "platform": "douyin",
        "title": "敏感肌也能放心用的涂抹面膜！",
        "body": None,
        "script": "开场：展示干燥皮肤问题 → 产品介绍 → 涂抹演示 → 效果对比 → 优惠信息",
        "tags": ["涂抹面膜", "敏感肌", "护肤", "补水保湿"],
        "status": "draft",
    }],
    "wechat": [{
        "id": _next_id(),
        "platform": "wechat",
        "title": None,
        "copy": "最近入手的涂抹面膜真的绝了！敏感肌用了完全不刺激，保湿效果超持久。每天早上起来皮肤都是水当当的，素颜出门都自信了哈哈～有同样困扰的朋友真的可以试试 👍",
        "image_tip": "手持产品自拍 + 使用前后对比",
        "status": "draft",
    }],
}

_CALENDAR_EVENTS = [
    {"date": "2026-07-01", "platform": "xiaohongshu", "title": "产品种草笔记",        "status": "scheduled"},
    {"date": "2026-07-02", "platform": "douyin",      "title": "使用教程短视频",       "status": "scheduled"},
    {"date": "2026-07-03", "platform": "wechat",      "title": "朋友圈文案",          "status": "scheduled"},
    {"date": "2026-07-05", "platform": "xiaohongshu", "title": "用户测评合集",         "status": "draft"},
    {"date": "2026-07-07", "platform": "douyin",      "title": "KOL合作视频",         "status": "draft"},
    {"date": "2026-06-28", "platform": "xiaohongshu", "title": "618返场优惠",         "status": "published"},
    {"date": "2026-06-25", "platform": "douyin",      "title": "新品首发视频",         "status": "published"},
]


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/platforms")
async def get_platforms():
    """获取支持的平台列表"""
    return {"status": "success", "platforms": PLATFORMS}


@router.post("/generate")
async def generate_content(req: GenerateRequest):
    """AI 生成社媒内容"""
    platform_info = next((p for p in PLATFORMS if p["id"] == req.platform), None)
    if not platform_info:
        raise HTTPException(status_code=400, detail=f"不支持的平台: {req.platform}")

    goal_map = {"awareness": "品牌曝光", "conversion": "转化引导", "engagement": "互动种草"}
    tone_map = {"casual": "日常分享", "professional": "专业测评", "emotional": "情感共鸣"}
    goal_label = goal_map.get(req.goal, req.goal)
    tone_label = tone_map.get(req.tone, req.tone)

    prompt = f"""你是社媒内容营销专家。请为「{req.product_name}」生成一条{platform_info['label']}平台的内容。
内容目标: {goal_label}
语气风格: {tone_label}

请返回 JSON 格式:
{{"title": "标题",
  "body": "正文内容",
  "tags": ["标签1", "标签2"],
  "image_tip": "配图建议"}}"""

    result = await ai_service.chat(
        prompt,
        system_prompt=f"你是资深{platform_info['label']}内容创作者，擅长{tone_label}风格的种草内容。",
    )

    import json
    new_content: dict = {"id": _next_id(), "platform": req.platform, "status": "draft"}
    try:
        start = result.find("{")
        end = result.rfind("}") + 1
        parsed = json.loads(result[start:end])
        new_content.update(parsed)
    except Exception:
        new_content.update({
            "title": f"[AI模拟] {platform_info['label']}内容 - {tone_label}",
            "body": result,
            "tags": ["涂抹面膜", "护肤好物"],
            "image_tip": "产品实拍 + 使用场景",
        })

    _GENERATED.setdefault(req.platform, []).insert(0, new_content)
    return {"status": "success", "content": new_content, "message": f"{platform_info['label']}内容已生成"}


@router.get("/content")
async def get_content(platform: str = "xiaohongshu"):
    """获取指定平台的生成内容列表"""
    items = _GENERATED.get(platform, [])
    return {"status": "success", "content": items}


@router.get("/calendar")
async def get_calendar():
    """获取内容发布日历"""
    return {"status": "success", "events": _CALENDAR_EVENTS}


@router.post("/mark-published")
async def mark_published(req: MarkPublishedRequest):
    """标记内容为已发布"""
    for platform_items in _GENERATED.values():
        for item in platform_items:
            if item["id"] == req.content_id:
                item["status"] = "published"
                # 同步更新日历
                _CALENDAR_EVENTS.append({
                    "date": "2026-07-01",  # 简化：标记当天
                    "platform": item["platform"],
                    "title": item.get("title") or item.get("copy", "")[:20],
                    "status": "published",
                })
                return {"status": "success", "content": item}
    raise HTTPException(status_code=404, detail="内容不存在")


@router.get("/archive")
async def get_archive():
    """获取已发布内容归档"""
    published = []
    for items in _GENERATED.values():
        for item in items:
            if item["status"] == "published":
                published.append(item)
    # 同时包含日历里已发布的
    for ev in _CALENDAR_EVENTS:
        if ev["status"] == "published":
            published.append(ev)
    return {"status": "success", "archive": published}
