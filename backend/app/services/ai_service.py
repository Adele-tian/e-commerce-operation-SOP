"""AI 服务封装 - 统一调用通义千问、通义万相等 AI API"""
import asyncio
import random

import httpx
from typing import Optional
from app.config import settings


class AIService:
    """通义千问 + 通义万相 API 调用封装"""

    QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    WANX_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
    TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"

    def __init__(self):
        self.api_key = settings.QWEN_API_KEY
        self.model = settings.QWEN_MODEL

    async def chat(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """调用通义千问生成文本"""
        if not self.api_key:
            return self._mock_response(prompt)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "input": {"messages": messages},
            "parameters": {"result_format": "message"},
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(self.QWEN_API_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["output"]["choices"][0]["message"]["content"]

    async def generate_market_report(self, market_data: dict) -> str:
        """生成市场评估报告"""
        prompt = f"""你是一位电商市场分析专家。请基于以下市场数据，撰写一份涂抹面膜品类的市场机会评估报告。

市场数据：
- 市场容量: {market_data.get('market_capacity', '未知')}
- 平均价格: {market_data.get('avg_price', '未知')}
- 在售商品数: {market_data.get('total_products', '未知')}
- 头部卖家销量占比: {market_data.get('top_seller_share', '未知')}%
- 新品存活率: {market_data.get('new_product_survival', '未知')}%
- 蓝海评分: {market_data.get('blue_ocean_score', '未知')}/100

请按以下格式输出报告：
## 市场概况
## 关键发现
## 建议策略"""

        return await self.chat(prompt, system_prompt="你是一位专业的电商市场分析师，擅长数据驱动的市场分析。")

    async def classify_keyword(self, keyword: str) -> dict:
        """AI自动分类关键词"""
        prompt = f"""请对以下电商搜索关键词进行分类，并给出潜力评分(1-100)。

关键词: "{keyword}"

请返回JSON格式:
{{"category": "功能/场景/人群/品牌", "potential_score": 85, "reason": "分类理由"}}"""

        result = await self.chat(prompt, system_prompt="你是电商SEO专家，擅长关键词分析和分类。")
        # 尝试解析JSON，失败则返回默认值
        try:
            import json
            # 提取JSON部分
            start = result.find("{")
            end = result.rfind("}") + 1
            return json.loads(result[start:end])
        except Exception:
            return {"category": "功能", "potential_score": 50, "reason": result}

    def _mock_response(self, prompt: str) -> str:
        """未配置 API Key时的模拟响应"""
        return f"[AI模拟响应] 未配置 QWEN_API_KEY，请设置环境变量后重试。\n\n原始请求: {prompt[:100]}..."

    # ──────────────────────────────────────────
    # 通义万相 - 图片生成
    # ──────────────────────────────────────────

    async def generate_image(
        self,
        prompt: str,
        size: str = "1024*1024",
        n: int = 1,
        style: str = "<auto>",
    ) -> list[str]:
        """调用通义万相生成图片，返回图片 URL 列表。

        未配置 API Key 时返回 picsum 占位图。
        """
        if not self.api_key:
            return self._mock_image_urls(n)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        }
        payload = {
            "model": "wanx-v1",
            "input": {"prompt": prompt},
            "parameters": {"size": size, "n": n, "style": style},
        }

        async with httpx.AsyncClient(timeout=120) as client:
            # 1. 提交异步任务
            resp = await client.post(self.WANX_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            task_id = data.get("output", {}).get("task_id")
            if not task_id:
                raise RuntimeError(f"通义万相未返回 task_id: {data}")

            # 2. 轮询任务状态（2s 间隔，最长 90s）
            for _ in range(45):
                await asyncio.sleep(2)
                poll = await client.get(
                    self.TASK_URL.format(task_id=task_id),
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                poll.raise_for_status()
                result = poll.json()
                status = result.get("output", {}).get("task_status")
                if status == "SUCCEEDED":
                    results = result["output"].get("results", [])
                    return [r["url"] for r in results if "url" in r]
                if status == "FAILED":
                    msg = result.get("output", {}).get("message", "unknown")
                    raise RuntimeError(f"通义万相生成失败: {msg}")
            raise TimeoutError("通义万相任务超时（90s）")

    def _mock_image_urls(self, n: int = 1) -> list[str]:
        """未配置 Key 时返回占位图"""
        base = random.randint(100, 900)
        return [f"https://picsum.photos/seed/{base + i}/1024/1024" for i in range(n)]

    # ──────────────────────────────────────────
    # 文本生成辅助
    # ──────────────────────────────────────────

    async def analyze_reviews(self, reviews: list[dict], product_name: str) -> dict:
        """AI分析竞品评价，提取情感、痛点、好评点"""
        sample_reviews = [r.get("content", "") for r in reviews[:20]]
        reviews_text = "\n".join([f"- {r}" for r in sample_reviews])

        prompt = f"""你是电商评价分析专家。请分析以下「{product_name}」的用户评价数据，提取关键洞察。

评价样本:
{reviews_text}

请返回JSON格式:
{{"sentiment": {{"positive": 75, "neutral": 15, "negative": 10}},
  "pain_points": [{{"text": "痛点描述", "frequency": 120, "intensity": 0.8}}],
  "positive_points": [{{"text": "好评点描述", "frequency": 200}}],
  "needs_summary": [{{"rank": 1, "title": "需求名称", "percent": "8.5%", "desc": "需求描述", "quote": "典型评论"}}],
  "keywords": [{{"word": "关键词", "count": 100, "sentiment": "positive"}}],
  "optimization_suggestions": ["优化建议1", "优化建议2"]}}"""

        result = await self.chat(prompt, system_prompt="你是专业的电商评价分析师，擅长从用户评价中提取关键信息。")
        try:
            import json
            start = result.find("{")
            end = result.rfind("}") + 1
            return json.loads(result[start:end])
        except Exception:
            return {"raw": result}


ai_service = AIService()
