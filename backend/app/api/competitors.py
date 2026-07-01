"""竞品评价分析 API"""
from datetime import datetime
from typing import Optional
import random

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.ai_service import ai_service
from app.services.export_service import export_service

router = APIRouter(prefix="/competitors", tags=["competitors"])

# ============================================================
# Mock 竞品数据（生产环境应从数据库读取）
# ============================================================
_MOCK_COMPETITORS = [
    {"id": 1, "name": "珀莱雅双抗面膜", "price": 129, "review_count": 28400, "rating": 4.8, "store": "珀莱雅官方旗舰店"},
    {"id": 2, "name": "自然堂烟酰胺面膜", "price": 89, "review_count": 15600, "rating": 4.7, "store": "自然堂官方旗舰店"},
    {"id": 3, "name": "薇诺娜舒敏面膜", "price": 168, "review_count": 9200, "rating": 4.9, "store": "薇诺娜官方旗舰店"},
    {"id": 4, "name": "润百颜玻尿酸面膜", "price": 119, "review_count": 12800, "rating": 4.6, "store": "润百颜官方旗舰店"},
    {"id": 5, "name": "HBN视黄醇面膜", "price": 139, "review_count": 7800, "rating": 4.7, "store": "HBN官方旗舰店"},
    {"id": 6, "name": "谷雨光感面膜", "price": 99, "review_count": 18200, "rating": 4.5, "store": "谷雨官方旗舰店"},
]

# 模拟评价明细
_MOCK_REVIEWS = {
    1: [
        {"id": 1, "content": "补水效果超好，质地很细腻很好推开，敷20分钟洗掉皮肤滑滑的。就是美白效果短期看不出来，要坚持用才行。", "sku": "100g 水润保湿款", "needs": "补水保湿、美白提亮", "persona": "女性 25-35岁", "scene": "日常护肤", "sentiment": "正面"},
        {"id": 2, "content": "用了一周来评价，保湿效果确实持久，第二天起来脸还是润的。但是味道有点太香了，感觉加了香精。敏感肌用了没有不适。", "sku": "100g 水润保湿款", "needs": "持久保湿、温和不刺激", "persona": "女性 20-30岁", "scene": "夜间护理", "sentiment": "正面"},
        {"id": 3, "content": "质地有点太稠了，不太好推开，需要配合硅胶刷。清洗也有点麻烦，要反复冲水才能洗干净。补水效果还行吧。", "sku": "150g 大容量装", "needs": "使用便捷、易清洗", "persona": "男性 25-35岁", "scene": "日常护肤", "sentiment": "负面"},
        {"id": 4, "content": "性价比很高的一款涂抹面膜，比XX牌好用太多了。质地像奶油，上脸很服帖，敷完不用洗直接睡觉也可以。会回购！", "sku": "100g 水润保湿款", "needs": "性价比、使用效果", "persona": "女性 30-40岁", "scene": "睡眠面膜", "sentiment": "正面"},
        {"id": 5, "content": "敏感肌慎入！用了之后脸上有点刺痛，第二天还泛红了。可能是我皮肤太敏感了吧，给闺蜜用了她说挺好的。", "sku": "50g 旅行便携装", "needs": "温和不刺激", "persona": "女性 20-25岁", "scene": "日常护肤", "sentiment": "负面"},
        {"id": 6, "content": "第三次回购了！这款面膜真的是我的救星，秋冬换季再也不怕干燥起皮了。质地细腻好涂，保湿时间也很长，推荐！", "sku": "100g 水润保湿款", "needs": "持久保湿、复购推荐", "persona": "女性 25-35岁", "scene": "换季护肤", "sentiment": "正面"},
    ],
}


def _get_reviews(comp_id: int) -> list[dict]:
    """获取竞品评价数据"""
    if comp_id in _MOCK_REVIEWS:
        return _MOCK_REVIEWS[comp_id]
    # 其他竞品生成模拟评价
    reviews = []
    templates = [
        ("补水效果很好，质地细腻", "正面", "补水保湿"),
        ("有点刺激感，敏感肌不太友好", "负面", "温和不刺激"),
        ("性价比高，值得回购", "正面", "性价比"),
        ("味道太香了，感觉有香精", "负面", "气味体验"),
        ("美白效果短期不明显", "负面", "美白提亮"),
        ("保湿持久，第二天还润", "正面", "持久保湿"),
    ]
    for i in range(6):
        t = templates[i % len(templates)]
        reviews.append({
            "id": i + 1,
            "content": t[0],
            "sku": f"100g 标准款",
            "needs": t[2],
            "persona": f"女性 {20 + (i % 3) * 5}-{30 + (i % 3) * 5}岁",
            "scene": "日常护肤",
            "sentiment": t[1],
        })
    return reviews


def _generate_analysis(comp: dict, reviews: list[dict]) -> dict:
    """生成竞品评价分析结果"""
    # 情感分布
    positive_count = sum(1 for r in reviews if r.get("sentiment") == "正面")
    negative_count = sum(1 for r in reviews if r.get("sentiment") == "负面")
    total = len(reviews) if reviews else 1
    pos_pct = round(positive_count / total * 100, 1)
    neg_pct = round(negative_count / total * 100, 1)
    neu_pct = round(100 - pos_pct - neg_pct, 1)

    # 评价趋势
    trend = []
    base_count = comp["review_count"] // 6
    for i in range(6):
        trend.append({
            "month": f"2025/{i + 1}",
            "count": base_count + i * random.randint(50, 150),
        })

    # 用户需求 TOP10
    needs_top10 = [
        {"need": "补水效果", "percent": 8.83, "count": 257, "color": "#3b82f6"},
        {"need": "质地肤感", "percent": 5.09, "count": 148, "color": "#6366f1"},
        {"need": "美白提亮", "percent": 4.21, "count": 122, "color": "#8b5cf6"},
        {"need": "温和不刺激", "percent": 3.56, "count": 103, "color": "#a855f7"},
        {"need": "使用效果", "percent": 2.44, "count": 71, "color": "#ec4899"},
        {"need": "性价比", "percent": 2.13, "count": 62, "color": "#f43f5e"},
        {"need": "售后服务", "percent": 2.13, "count": 62, "color": "#f97316"},
        {"need": "气味体验", "percent": 1.62, "count": 47, "color": "#eab308"},
        {"need": "包装设计", "percent": 1.44, "count": 42, "color": "#22c55e"},
        {"need": "复购意愿", "percent": 1.27, "count": 37, "color": "#14b8a6"},
    ]

    # 关注维度解读
    dimensions = [
        {"dimension": "补水效果", "count": 257, "percent": "8.83%", "interpretation": "用户最关心面膜的补水保湿能力，\"补水效果好\"\"持久水润\"是高频正面评价"},
        {"dimension": "质地肤感", "count": 148, "percent": "5.09%", "interpretation": "用户对涂抹质地要求高，偏好\"细腻好推开\"的奶油质地，差评集中在\"太稠不好涂\""},
        {"dimension": "美白提亮", "count": 122, "percent": "4.21%", "interpretation": "美白是核心诉求之一，但多数用户认为\"短期效果不明显\"，需要长期使用才能看到变化"},
        {"dimension": "温和不刺激", "count": 103, "percent": "3.56%", "interpretation": "敏感肌用户高度关注刺激性，好评提到\"完全不刺激\"，差评提到\"用了有刺痛感\""},
        {"dimension": "使用效果", "count": 71, "percent": "2.44%", "interpretation": "综合使用满意度，包括皮肤滑嫩度、光泽度、毛孔改善等多维度效果反馈"},
        {"dimension": "性价比", "count": 62, "percent": "2.13%", "interpretation": "用户普遍关注价格与效果的匹配度，\"性价比高\"\"值回票价\"是正面关键词"},
    ]

    # 痛点 + 好评点
    pain_points = [
        {"id": 1, "text": "使用后皮肤有刺痛感，敏感肌用户反馈泛红", "frequency": 890, "intensity": 0.85},
        {"id": 2, "text": "美白效果不明显，用了很久没变化", "frequency": 760, "intensity": 0.72},
        {"id": 3, "text": "涂抹不方便，质地太稠不好推开", "frequency": 650, "intensity": 0.65},
        {"id": 4, "text": "清洗困难，残留多需要反复冲洗", "frequency": 580, "intensity": 0.78},
        {"id": 5, "text": "味道太香，感觉添加了香精", "frequency": 520, "intensity": 0.60},
    ]

    positive_points = [
        {"id": 1, "text": "补水效果立竿见影，敷完皮肤水当当", "frequency": 2340},
        {"id": 2, "text": "质地细腻好推开，奶油般丝滑触感", "frequency": 1890},
        {"id": 3, "text": "味道清新自然，使用体验舒适", "frequency": 1560},
        {"id": 4, "text": "用后皮肤滑嫩，触感明显改善", "frequency": 1230},
        {"id": 5, "text": "性价比高，效果对得起价格", "frequency": 980},
    ]

    # 高频关键词
    keywords = [
        {"word": "补水效果好", "count": 2340, "sentiment": "positive"},
        {"word": "质地细腻", "count": 1890, "sentiment": "positive"},
        {"word": "味道好闻", "count": 1560, "sentiment": "positive"},
        {"word": "容易清洗", "count": 1230, "sentiment": "positive"},
        {"word": "吸收快", "count": 1100, "sentiment": "positive"},
        {"word": "持久保湿", "count": 950, "sentiment": "positive"},
        {"word": "有点刺激", "count": 890, "sentiment": "negative"},
        {"word": "效果不明显", "count": 760, "sentiment": "negative"},
        {"word": "包装简陋", "count": 540, "sentiment": "negative"},
        {"word": "价格偏高", "count": 480, "sentiment": "negative"},
    ]

    # 需求分析总结
    needs_summary = [
        {"rank": 1, "title": "补水效果", "percent": "8.83%", "desc": "用户最关心面膜的补水保湿能力，高频评价表明产品在此维度表现优秀，建议强调72小时长效保湿卖点。", "quote": "\"补水效果真的好，第二天起来脸还是润润的，比贴片面膜方便多了！\""},
        {"rank": 2, "title": "质地与肤感", "percent": "5.09%", "desc": "用户对涂抹质地要求很高，偏好细腻、好推开的奶油质地。差评集中在\"太稠\"\"有颗粒感\"。", "quote": "\"质地超级细腻，像奶油一样好推开，敷在脸上凉凉的很舒服。\""},
        {"rank": 3, "title": "美白提亮效果", "percent": "4.21%", "desc": "美白是核心购买动机之一，但多数用户反映短期效果不明显。建议增加使用周期说明。", "quote": "\"用了两周感觉肤色确实亮了一点，但没有宣传的那么夸张。\""},
        {"rank": 4, "title": "温和不刺激", "percent": "3.56%", "desc": "敏感肌用户高度关注刺激性。建议突出敏感肌测试报告和无添加认证。", "quote": "\"我是敏感肌，用了完全没有刺激感，终于找到一款放心用的涂抹面膜了！\""},
        {"rank": 5, "title": "性价比与经济性", "percent": "2.13%", "desc": "用户普遍关注价格与效果的匹配度，建议增加大容量装和复购优惠策略。", "quote": "\"这个价位能买到这个效果真的很值，比专柜便宜多了。\""},
        {"rank": 6, "title": "服务与售后支持", "percent": "2.13%", "desc": "涉及客服响应速度、退换货流程、物流速度等。好评提到\"客服态度好\"\"发货快\"。", "quote": "\"客服很耐心，问了很多问题都一一解答了，发货也超快。\""},
        {"rank": 7, "title": "复购与推荐意愿", "percent": "1.27%", "desc": "用户表示\"会再买\"\"推荐给朋友\"的比例较高。可考虑建立会员复购体系。", "quote": "\"已经回购第三瓶了，还推荐给了闺蜜，她也很喜欢！\""},
    ]

    # 优化建议
    suggestions = [
        "强化\"无刺激\"配方卖点，在详情页突出敏感肌测试报告和皮肤刺激性检测认证",
        "增加涂抹工具（硅胶面膜刷）作为赠品，解决\"涂抹不方便、不好推开\"的用户痛点",
        "优化产品质地配方，强调\"易清洗、无残留\"的使用体验",
        "添加before/after对比图（使用7天/14天/28天），直观展示美白提亮效果",
        "推出大容量装(200g) + 复购折扣策略，满足高复购意愿用户需求",
        "优化产品香型，推出\"无香型\"SKU，满足对气味敏感的用户群体",
    ]

    return {
        "sentiment": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct},
        "review_trend": trend,
        "needs_top10": needs_top10,
        "dimensions": dimensions,
        "pain_points": pain_points,
        "positive_points": positive_points,
        "keywords": keywords,
        "needs_summary": needs_summary,
        "optimization_suggestions": suggestions,
        "review_details": reviews,
        "analysis_date": datetime.now().isoformat(),
    }


# 缓存分析结果
_analysis_cache: dict[int, dict] = {}


@router.get("", response_model=dict)
async def list_competitors():
    """获取竞品列表"""
    return {"status": "success", "competitors": _MOCK_COMPETITORS}


@router.post("/{comp_id}/scrape-reviews", response_model=dict)
async def scrape_reviews(comp_id: int):
    """爬取竞品评价数据"""
    comp = next((c for c in _MOCK_COMPETITORS if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="竞品不存在")

    reviews = _get_reviews(comp_id)
    return {
        "status": "success",
        "message": f"成功采集 {comp['name']} 的 {len(reviews)} 条评价",
        "review_count": len(reviews),
    }


@router.post("/{comp_id}/analyze", response_model=dict)
async def analyze_reviews(comp_id: int):
    """启动评价分析（NLP情感分析+痛点提取）"""
    comp = next((c for c in _MOCK_COMPETITORS if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="竞品不存在")

    reviews = _get_reviews(comp_id)

    # 尝试AI分析，失败则用模拟数据
    ai_result = await ai_service.analyze_reviews(reviews, comp["name"])

    # 如果AI返回的是mock响应，使用内置分析数据
    if "raw" in ai_result or "AI模拟" in str(ai_result.get("raw", "")):
        analysis = _generate_analysis(comp, reviews)
    else:
        # 合并AI分析结果和模拟数据
        analysis = _generate_analysis(comp, reviews)
        # 用AI结果覆盖部分字段
        if "sentiment" in ai_result:
            analysis["sentiment"] = ai_result["sentiment"]
        if "optimization_suggestions" in ai_result:
            analysis["optimization_suggestions"] = ai_result["optimization_suggestions"]

    _analysis_cache[comp_id] = analysis
    return {"status": "success", "message": f"「{comp['name']}」评价分析完成"}


@router.get("/{comp_id}/analysis", response_model=dict)
async def get_analysis(comp_id: int):
    """获取竞品评价分析结果"""
    comp = next((c for c in _MOCK_COMPETITORS if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="竞品不存在")

    if comp_id not in _analysis_cache:
        # 自动生成分析
        reviews = _get_reviews(comp_id)
        _analysis_cache[comp_id] = _generate_analysis(comp, reviews)

    analysis = _analysis_cache[comp_id]
    return {
        "status": "success",
        "competitor": comp,
        "analysis": analysis,
    }


@router.get("/{comp_id}/export")
async def export_analysis(comp_id: int):
    """导出竞品评价分析报告为Excel"""
    comp = next((c for c in _MOCK_COMPETITORS if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="竞品不存在")

    if comp_id not in _analysis_cache:
        reviews = _get_reviews(comp_id)
        _analysis_cache[comp_id] = _generate_analysis(comp, reviews)

    analysis = _analysis_cache[comp_id]
    buffer = export_service.export_competitor_analysis(comp, analysis)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=competitor_{comp['name']}_analysis.xlsx"},
    )
