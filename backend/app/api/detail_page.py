"""详情页生成 API"""
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ai_service

router = APIRouter(prefix="/detail-page", tags=["detail-page"])

# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────

class GenerateScriptRequest(BaseModel):
    product_name: str = "涂抹面膜-补水保湿款"
    keywords: list[str] = ["补水保湿", "敏感肌适用", "72小时持久"]
    selling_points: list[str] = ["72小时持久保湿", "敏感肌无刺激配方", "免洗睡眠面膜"]
    tone: str = "专业可信"


class Block(BaseModel):
    id: str
    type: str          # 冲击区 / 展示区 / 功效区 / 口碑区 / 引导区
    title: str
    content: str
    order: int


class UpdateBlocksRequest(BaseModel):
    blocks: list[Block]


class ReviewRequest(BaseModel):
    action: str        # approve / reject
    notes: Optional[str] = None


# ──────────────────────────────────────────────
# Mock State
# ──────────────────────────────────────────────

_DEFAULT_BLOCKS: list[dict] = [
    {"id": "b1", "type": "冲击区", "title": "开场冲击", "content": "72小时持久水润，告别干燥肌", "order": 1},
    {"id": "b2", "type": "展示区", "title": "产品展示", "content": "产品实拍 + 质地展示 + 成分亮点", "order": 2},
    {"id": "b3", "type": "功效区", "title": "功效证明", "content": "实验室数据 + 用户对比图 + 权威认证", "order": 3},
    {"id": "b4", "type": "口碑区", "title": "用户口碑", "content": "真实用户评价 + KOL推荐 + 销量数据", "order": 4},
    {"id": "b5", "type": "引导区", "title": "购买引导", "content": "限时优惠 + 赠品信息 + 售后保障", "order": 5},
]

_state: dict = {
    "blocks": list(_DEFAULT_BLOCKS),
    "status": "draft",
    "script": None,
    "notes": None,
}


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/script")
async def get_script():
    """获取当前详情页脚本（区块列表）"""
    return {"status": "success", "blocks": _state["blocks"], "review_status": _state["status"]}


@router.post("/script/generate")
async def generate_script(req: GenerateScriptRequest):
    """AI 生成详情页脚本"""
    prompt = f"""你是电商详情页策划专家。请为「{req.product_name}」生成一套详情页脚本。
核心关键词: {', '.join(req.keywords)}
核心卖点: {', '.join(req.selling_points)}
语气风格: {req.tone}

按以下区块输出JSON数组:
[{{"id": "b1", "type": "冲击区", "title": "开场冲击", "content": "开场文案", "order": 1}},
 {{"id": "b2", "type": "展示区", "title": "产品展示", "content": "...", "order": 2}},
 {{"id": "b3", "type": "功效区", "title": "功效证明", "content": "...", "order": 3}},
 {{"id": "b4", "type": "口碑区", "title": "用户口碑", "content": "...", "order": 4}},
 {{"id": "b5", "type": "引导区", "title": "购买引导", "content": "...", "order": 5}}]"""

    result = await ai_service.chat(
        prompt,
        system_prompt="你是资深电商详情页策划师，擅长高转化率的详情页脚本撰写。",
    )

    import json
    try:
        start = result.find("[")
        end = result.rfind("]") + 1
        blocks = json.loads(result[start:end])
        _state["blocks"] = blocks[:8]
        _state["script"] = result
    except Exception:
        # AI 未配置时保持现有 blocks 不变
        pass

    _state["status"] = "draft"
    return {
        "status": "success",
        "message": "详情页脚本已生成",
        "blocks": _state["blocks"],
    }


@router.post("/blocks/update")
async def update_blocks(req: UpdateBlocksRequest):
    """手动更新区块内容（拖拽排序 / 编辑）"""
    _state["blocks"] = [b.model_dump() for b in req.blocks]
    return {"status": "success", "blocks": _state["blocks"]}


@router.post("/review")
async def review_detail_page(req: ReviewRequest):
    """审核详情页脚本"""
    if req.action == "approve":
        _state["status"] = "approved"
    elif req.action == "reject":
        _state["status"] = "draft"
    else:
        raise HTTPException(status_code=400, detail="无效操作，仅支持 approve/reject")
    if req.notes:
        _state["notes"] = req.notes
    return {"status": "success", "review_status": _state["status"], "notes": _state["notes"]}


@router.post("/reset")
async def reset_blocks():
    """重置区块为默认模板"""
    import copy
    _state["blocks"] = copy.deepcopy(_DEFAULT_BLOCKS)
    _state["status"] = "draft"
    _state["notes"] = None
    return {"status": "success", "blocks": _state["blocks"]}


@router.get("/export")
async def export_detail_page():
    """导出详情页脚本为 JSON（实际生产环境导出图片包）"""
    return {
        "status": "success",
        "filename": "detail_page_script.json",
        "blocks": _state["blocks"],
        "review_status": _state["status"],
        "message": "详情页脚本已导出（生产环境将生成图片包 ZIP）",
    }
