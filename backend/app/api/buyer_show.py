"""买家秀生成 API"""
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.ai_service import ai_service
from app.services.export_service import export_service

router = APIRouter(prefix="/buyer-show", tags=["buyer-show"])


class GenerateRequest(BaseModel):
    product_name: str = "涂抹面膜"
    template: str = "使用体验型"
    tone: str = "真实自然"
    count: int = 3


class ReviewRequest(BaseModel):
    show_id: int
    action: str  # approve / reject
    notes: Optional[str] = None


# 买家秀模板
_TEMPLATES = [
    {"id": "t1", "name": "使用体验型", "desc": "真实分享使用感受，强调肤感和效果", "icon": "✨"},
    {"id": "t2", "name": "效果展示型", "desc": "对比使用前后变化，用数据和图片说话", "icon": "📊"},
    {"id": "t3", "name": "对比评测型", "desc": "与其他产品横向对比，突出优势", "icon": "⚖️"},
]

# Mock 买家秀数据
_MOCK_SHOWS = [
    {
        "id": 1, "template": "使用体验型",
        "content": "用了一周来评价，质地很细腻很好推开，敷在脸上凉凉的很舒服。我是敏感肌，用了完全没有刺激感，第二天起来皮肤滑滑的，补水效果真的很持久！",
        "tone_score": 4.6, "image_tip": "手持产品自拍 + 涂抹过程特写 + 使用前后皮肤对比", "status": "approved",
    },
    {
        "id": 2, "template": "效果展示型",
        "content": "坚持用了两周，额头和脸颊的干燥起皮完全消失了！附上对比图，右边是使用后的皮肤状态，毛孔也细腻了很多。",
        "tone_score": 4.3, "image_tip": "面部特写对比图 + 日历打卡记录 + 产品空瓶展示", "status": "pending_review",
    },
    {
        "id": 3, "template": "对比评测型",
        "content": "之前用过XX牌和YY牌，这款是我用过最满意的。质地比XX细腻很多，保湿时间也比YY长。关键是不刺激，敏感肌终于找到真爱了！",
        "tone_score": 4.1, "image_tip": "三款产品并排对比 + 质地涂抹对比 + 价格对比表格截图", "status": "draft",
    },
]


@router.get("/templates", response_model=dict)
async def get_templates():
    """获取买家秀文案模板"""
    return {"status": "success", "templates": _TEMPLATES}


@router.post("/generate", response_model=dict)
async def generate_buyer_shows(req: GenerateRequest):
    """生成买家秀文案"""
    prompt = f"""你是电商买家秀文案专家。请为「{req.product_name}」生成{req.count}条{req.template}风格的买家秀文案。
要求: 语气{req.tone}，像真实用户分享，避免模板感。

请返回JSON数组格式:
[{{"content": "文案内容", "tone_score": 4.5, "image_tip": "配图建议"}}]"""

    result = await ai_service.chat(prompt, system_prompt="你是电商买家秀文案撰写专家，擅长模拟真实用户口吻。")

    new_shows = []
    base_id = max(s["id"] for s in _MOCK_SHOWS) + 1 if _MOCK_SHOWS else 1
    try:
        import json
        start = result.find("[")
        end = result.rfind("]") + 1
        parsed = json.loads(result[start:end])
        for i, item in enumerate(parsed[:req.count]):
            new_shows.append({
                "id": base_id + i,
                "template": req.template,
                "content": item.get("content", ""),
                "tone_score": item.get("tone_score", 4.0),
                "image_tip": item.get("image_tip", ""),
                "status": "draft",
            })
    except Exception:
        for i in range(req.count):
            new_shows.append({
                "id": base_id + i,
                "template": req.template,
                "content": f"[{req.template}] 模拟买家秀文案 #{base_id + i}，请在配置AI API Key后获得真实生成内容。",
                "tone_score": 4.0,
                "image_tip": "产品实拍 + 使用场景 + 效果对比",
                "status": "draft",
            })

    _MOCK_SHOWS.extend(new_shows)
    return {
        "status": "success",
        "message": f"已生成 {len(new_shows)} 条买家秀文案",
        "shows": new_shows,
    }


@router.get("/list", response_model=dict)
async def list_buyer_shows(status: Optional[str] = None):
    """获取买家秀列表"""
    shows = _MOCK_SHOWS
    if status and status != "all":
        shows = [s for s in shows if s["status"] == status]
    return {"status": "success", "shows": shows}


@router.post("/review", response_model=dict)
async def review_buyer_show(req: ReviewRequest):
    """审核买家秀"""
    show = next((s for s in _MOCK_SHOWS if s["id"] == req.show_id), None)
    if not show:
        raise HTTPException(status_code=404, detail="买家秀不存在")

    if req.action == "approve":
        show["status"] = "approved"
    elif req.action == "reject":
        show["status"] = "draft"
    else:
        raise HTTPException(status_code=400, detail="无效操作")

    if req.notes:
        show["notes"] = req.notes

    return {"status": "success", "show": show}


@router.get("/export")
async def export_buyer_shows():
    """导出买家秀文案为Excel"""
    buffer = export_service.export_buyer_shows(_MOCK_SHOWS)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=buyer_shows.xlsx"},
    )
