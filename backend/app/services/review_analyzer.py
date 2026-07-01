"""评价数据分析服务 - 真实NLP分析引擎"""
import re
import math
from collections import Counter, defaultdict
from typing import Optional


# 中文情感词典
POSITIVE_WORDS = [
    "好", "棒", "赞", "不错", "完美", "优秀", "满意", "方便", "简单", "容易",
    "牢固", "漂亮", "美观", "光滑", "细腻", "舒服", "厚实", "透明", "高清",
    "齐全", "齐全", "贴心", "耐心", "贴心", "及时", "快速", "迅速",
    "推荐", "回购", "值得", "划算", "超值", "性价比高", "物美价廉",
    "保护", "贴合", "服帖", "自然", "高级", "光泽", "亮度", "防水",
    "不起泡", "没气泡", "无气泡", "没泡", "不翘边", "不皱",
]

NEGATIVE_WORDS = [
    "差", "烂", "坏", "糟", "垃圾", "坑", "骗", "假", "劣质", "假货",
    "气泡", "起泡", "泡泡", "褶皱", "皱", "翘边", "翘起", "脱落", "掉",
    "难贴", "不好贴", "贴不住", "贴不好", "贴坏", "贴不平",
    "刺鼻", "异味", "味道", "难闻",
    "推卸", "推脱", "不负责", "不处理", "不管", "态度差", "态度恶劣",
    "退货", "退款", "售后", "投诉", "维权",
    "上当", "受骗", "忽悠", "坑人", "不要买", "别买", "快跑",
    "失望", "后悔", "浪费", "白费", "白贴",
    "伤", "刮伤", "划痕", "损伤", "伤痕",
    "没工具", "没有工具", "缺工具", "少工具",
    "描述不符", "不相符", "不一致",
]

# 否定词（翻转情感）
NEGATION_WORDS = ["不", "没", "没有", "未", "别", "非", "无", "难以", "很难"]

# 停用词
STOP_WORDS = {"的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都", "一",
              "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着",
              "没有", "看", "好", "自己", "这", "他", "她", "它", "们", "那", "些",
              "什么", "怎么", "这个", "那个", "可以", "因为", "所以", "但是", "而且",
              "还是", "或者", "如果", "虽然", "而且", "然后", "以后", "之前", "已经",
              "该用户", "觉得", "商品", "非常", "给出", "5星", "好评", "评价"}

# 需求维度关键词映射
NEED_DIMENSIONS = {
    "贴膜效果": ["效果", "贴完", "贴好", "贴上去", "贴出来", "贴合", "服帖", "好看", "美观", "漂亮", "自然", "光泽"],
    "操作便捷": ["操作", "简单", "方便", "容易", "好贴", "贴起来", "教程", "视频", "说明", "指导", "步骤"],
    "产品质量": ["质量", "厚度", "厚实", "材质", "品质", "耐用", "结实", "牢固", "结实"],
    "气泡问题": ["气泡", "起泡", "泡泡", "泡", "褶皱", "皱", "平整", "不平"],
    "客服服务": ["客服", "服务", "态度", "售后", "指导", "耐心", "回复", "联系", "咨询"],
    "物流包装": ["物流", "快递", "发货", "包装", "配送", "到货", "运输", "外包装"],
    "工具配件": ["工具", "配件", "刮板", "喷壶", "送", "齐全", "没给", "缺少"],
    "保护性能": ["保护", "防刮", "防划", "防水", "耐高温", "不渗色", "防烫", "隔热"],
    "性价比": ["价格", "性价比", "值", "划算", "便宜", "贵", "实惠", "物美价廉"],
    "撕除体验": ["撕", "揭", "去掉", "取下", "残留", "胶", "痕迹", "伤桌面", "伤漆"],
}


class ReviewAnalyzer:
    """评价数据分析器"""

    def analyze(self, reviews: list[dict]) -> dict:
        """
        分析评价数据列表
        reviews: [{"content": "评价文字", "sku": "SKU名称", "date": "日期", ...}, ...]
        """
        if not reviews:
            return self._empty_result()

        # 1. 情感分析
        sentiments = [self._classify_sentiment(r.get("content", "")) for r in reviews]
        pos_count = sentiments.count("positive")
        neg_count = sentiments.count("negative")
        neu_count = sentiments.count("neutral")
        total = len(sentiments)

        # 2. 关键词提取
        all_words = []
        pos_words_list = []
        neg_words_list = []
        for i, r in enumerate(reviews):
            words = self._extract_keywords(r.get("content", ""))
            all_words.extend(words)
            if sentiments[i] == "positive":
                pos_words_list.extend(words)
            elif sentiments[i] == "negative":
                neg_words_list.extend(words)

        # 3. 需求维度分析
        needs_analysis = self._analyze_needs(reviews, sentiments)

        # 4. 痛点提取
        pain_points = self._extract_pain_points(reviews, sentiments)

        # 5. 好评点提取
        positive_points = self._extract_positive_points(reviews, sentiments)

        # 6. SKU分析
        sku_analysis = self._analyze_skus(reviews, sentiments)

        # 7. 高频词统计
        word_freq = Counter(all_words)
        pos_freq = Counter(pos_words_list)
        neg_freq = Counter(neg_words_list)

        # 8. 评价趋势（按月）
        trend = self._build_trend(reviews)

        # 组装结果
        return {
            "total_reviews": total,
            "effective_reviews": sum(1 for r in reviews if self._has_content(r.get("content", ""))),
            "with_images": sum(1 for r in reviews if r.get("images") or r.get("晒图")),
            "with_followup": sum(1 for r in reviews if r.get("followup") or r.get("追评")),
            "sentiment": {
                "positive": round(pos_count / total * 100, 1),
                "neutral": round(neu_count / total * 100, 1),
                "negative": round(neg_count / total * 100, 1),
            },
            "sentiment_counts": {"positive": pos_count, "neutral": neu_count, "negative": neg_count},
            "review_trend": trend,
            "needs_top10": needs_analysis["top10"],
            "dimensions": needs_analysis["dimensions"],
            "pain_points": pain_points,
            "positive_points": positive_points,
            "keywords": self._build_keywords_list(word_freq, pos_freq, neg_freq),
            "needs_summary": needs_analysis["summary"],
            "optimization_suggestions": self._generate_suggestions(pain_points, needs_analysis),
            "sku_analysis": sku_analysis,
            "review_details": self._build_details(reviews, sentiments),
            "word_cloud": [{"word": w, "count": c} for w, c in word_freq.most_common(30)],
        }

    def _classify_sentiment(self, text: str) -> str:
        """对单条评价做情感分类"""
        if not text or not self._has_content(text):
            return "neutral"

        pos_score = 0
        neg_score = 0

        # 正面词匹配
        for word in POSITIVE_WORDS:
            if word in text:
                # 检查是否有否定词翻转
                pos = text.find(word)
                prefix = text[max(0, pos - 4):pos]
                has_negation = any(n in prefix for n in NEGATION_WORDS)
                if has_negation:
                    neg_score += 1
                else:
                    pos_score += 1

        # 负面词匹配
        for word in NEGATIVE_WORDS:
            if word in text:
                pos = text.find(word)
                prefix = text[max(0, pos - 4):pos]
                has_negation = any(n in prefix for n in NEGATION_WORDS)
                if has_negation:
                    pos_score += 0.5
                else:
                    neg_score += 1

        # 感叹号和强烈语气加分
        if "！" in text or "!" in text:
            if pos_score > neg_score:
                pos_score += 0.5
            elif neg_score > pos_score:
                neg_score += 0.5

        if pos_score > neg_score + 0.5:
            return "positive"
        elif neg_score > pos_score + 0.5:
            return "negative"
        return "neutral"

    def _extract_keywords(self, text: str) -> list[str]:
        """从评价文本中提取关键词"""
        if not text:
            return []
        keywords = []
        # 提取 2-4 字的中文词组
        # 匹配常见的评价短语模式
        patterns = [
            r'([\u4e00-\u9fff]{2,4})(?:效果|质量|服务|体验)',
            r'(?:很|非常|特别|超级|真的|挺|蛮)([\u4e00-\u9fff]{1,4})',
            r'([\u4e00-\u9fff]{2,4})(?:得很|极了|死了|爆了)',
        ]
        for p in patterns:
            matches = re.findall(p, text)
            keywords.extend(matches)

        # 直接匹配词典词
        for word in POSITIVE_WORDS + NEGATIVE_WORDS:
            if len(word) >= 2 and word in text:
                keywords.append(word)

        return [w for w in keywords if w not in STOP_WORDS and len(w) >= 2]

    def _analyze_needs(self, reviews: list[dict], sentiments: list[str]) -> dict:
        """分析用户需求维度"""
        dim_counts = defaultdict(int)
        dim_reviews = defaultdict(list)

        for i, r in enumerate(reviews):
            text = r.get("content", "")
            if not self._has_content(text):
                continue
            for dim, keywords in NEED_DIMENSIONS.items():
                if any(kw in text for kw in keywords):
                    dim_counts[dim] += 1
                    dim_reviews[dim].append({"text": text, "sentiment": sentiments[i]})

        effective = sum(1 for r in reviews if self._has_content(r.get("content", "")))
        if effective == 0:
            effective = 1

        # 按提及频率排序
        sorted_dims = sorted(dim_counts.items(), key=lambda x: x[1], reverse=True)
        colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
                  "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6"]

        top10 = []
        dimensions = []
        for idx, (dim, count) in enumerate(sorted_dims[:10]):
            percent = round(count / effective * 100, 2)
            color = colors[idx % len(colors)]
            top10.append({"need": dim, "percent": percent, "count": count, "color": color})

            # 维度解读
            dim_sentiments = [r["sentiment"] for r in dim_reviews[dim]]
            pos_ratio = dim_sentiments.count("positive") / max(len(dim_sentiments), 1) * 100
            interpretation = self._generate_dim_interpretation(dim, count, pos_ratio, dim_reviews[dim])
            dimensions.append({
                "dimension": dim,
                "count": count,
                "percent": f"{percent}%",
                "interpretation": interpretation,
            })

        # 需求总结
        summary = self._generate_needs_summary(sorted_dims[:7], dim_reviews, effective)

        return {"top10": top10, "dimensions": dimensions, "summary": summary}

    def _generate_dim_interpretation(self, dim: str, count: int, pos_ratio: float, reviews: list) -> str:
        """生成维度解读文本"""
        if pos_ratio >= 70:
            tone = "整体好评"
        elif pos_ratio >= 40:
            tone = "评价两极分化"
        else:
            tone = "差评集中"

        # 提取该维度的典型评价
        pos_examples = [r["text"] for r in reviews if r["sentiment"] == "positive"][:2]
        neg_examples = [r["text"] for r in reviews if r["sentiment"] == "negative"][:2]

        parts = [f"共{count}条评价提及{dim}，{tone}（好评率{pos_ratio:.0f}%）。"]
        if pos_examples:
            parts.append(f'好评典型："{pos_examples[0][:50]}"')
        if neg_examples:
            parts.append(f'差评典型："{neg_examples[0][:50]}"')
        return " ".join(parts)

    def _generate_needs_summary(self, sorted_dims: list, dim_reviews: dict, total: int) -> list:
        """生成用户需求分析总结"""
        summaries = []
        for rank, (dim, count) in enumerate(sorted_dims, 1):
            percent = f"{round(count / total * 100, 2)}%"
            reviews_list = dim_reviews.get(dim, [])
            pos_reviews = [r["text"] for r in reviews_list if r["sentiment"] == "positive"]
            neg_reviews = [r["text"] for r in reviews_list if r["sentiment"] == "negative"]

            if pos_reviews:
                desc = f"用户对{dim}关注度最高（{count}条提及）。"
                if neg_reviews:
                    desc += f"好评居多但也有差评反馈，需要关注改进方向。"
                quote = f'"{pos_reviews[0][:60]}"'
            elif neg_reviews:
                desc = f"用户对{dim}反馈较差，是主要改进方向。"
                quote = f'"{neg_reviews[0][:60]}"'
            else:
                desc = f"{dim}是用户关注的维度之一。"
                quote = ""

            summaries.append({
                "rank": rank,
                "title": dim,
                "percent": percent,
                "desc": desc,
                "quote": quote,
            })
        return summaries

    def _extract_pain_points(self, reviews: list[dict], sentiments: list[str]) -> list[dict]:
        """提取用户痛点"""
        pain_texts = []
        for i, r in enumerate(reviews):
            if sentiments[i] == "negative" and self._has_content(r.get("content", "")):
                pain_texts.append(r["content"])

        # 按主题聚类痛点
        pain_themes = {
            "气泡/起泡问题": ["气泡", "起泡", "泡泡", "泡"],
            "客服服务差": ["客服", "服务", "态度", "推卸", "售后", "不管"],
            "操作困难/教程不清": ["难贴", "不好贴", "不会", "教程", "看不懂", "白贴"],
            "缺少工具配件": ["没工具", "没给工具", "没有工具", "缺工具"],
            "实物与描述不符": ["描述不符", "不相符", "不一致", "上当"],
            "撕除伤桌面": ["伤", "刮伤", "伤痕", "损伤", "揭下来"],
            "包装运输损坏": ["包装", "损坏", "破损", "外包装"],
        }

        pain_points = []
        pid = 1
        for theme, keywords in pain_themes.items():
            matched = [t for t in pain_texts if any(kw in t for kw in keywords)]
            if matched:
                # 取最长的评价作为典型
                typical = max(matched, key=len)
                pain_points.append({
                    "id": pid,
                    "text": theme,
                    "frequency": len(matched),
                    "intensity": min(0.95, 0.5 + len(matched) * 0.15),
                    "typical_review": typical[:100],
                })
                pid += 1

        pain_points.sort(key=lambda x: x["frequency"] * x["intensity"], reverse=True)
        # 重新编号
        for i, p in enumerate(pain_points):
            p["id"] = i + 1
        return pain_points

    def _extract_positive_points(self, reviews: list[dict], sentiments: list[str]) -> list[dict]:
        """提取好评亮点"""
        pos_texts = []
        for i, r in enumerate(reviews):
            if sentiments[i] == "positive" and self._has_content(r.get("content", "")):
                pos_texts.append(r["content"])

        pos_themes = {
            "操作简单方便": ["简单", "方便", "容易", "好贴", "一贴就"],
            "贴膜效果好": ["效果好", "好看", "漂亮", "完美", "美观", "自然"],
            "质量厚实": ["质量", "厚实", "厚度", "牢固", "结实"],
            "客服服务好": ["客服", "服务", "态度好", "耐心", "贴心"],
            "工具齐全": ["工具", "齐全", "送", "配件"],
            "教程清晰": ["教程", "视频", "说明", "指导", "步骤"],
            "保护效果好": ["保护", "防刮", "防水", "耐高温", "隔热"],
        }

        positive_points = []
        pid = 1
        for theme, keywords in pos_themes.items():
            matched = [t for t in pos_texts if any(kw in t for kw in keywords)]
            if matched:
                positive_points.append({
                    "id": pid,
                    "text": theme,
                    "frequency": len(matched),
                })
                pid += 1

        positive_points.sort(key=lambda x: x["frequency"], reverse=True)
        for i, p in enumerate(positive_points):
            p["id"] = i + 1
        return positive_points

    def _analyze_skus(self, reviews: list[dict], sentiments: list[str]) -> list[dict]:
        """按SKU分析评价"""
        sku_data = defaultdict(lambda: {"total": 0, "positive": 0, "negative": 0, "neutral": 0})

        for i, r in enumerate(reviews):
            sku = r.get("sku", "未知")
            # 提取产品类型（去掉尺寸信息）
            product_type = self._extract_product_type(sku)
            sku_data[product_type]["total"] += 1
            sku_data[product_type][sentiments[i]] += 1

        result = []
        for product, data in sorted(sku_data.items(), key=lambda x: x[1]["total"], reverse=True):
            total = data["total"]
            result.append({
                "product": product,
                "total": total,
                "positive_rate": round(data["positive"] / total * 100, 1) if total > 0 else 0,
                "negative_rate": round(data["negative"] / total * 100, 1) if total > 0 else 0,
            })
        return result

    def _extract_product_type(self, sku: str) -> str:
        """从SKU中提取产品类型"""
        if "水凝膜" in sku:
            return "自动修复水凝膜"
        elif "哑光实木" in sku:
            return "哑光实木桌专用"
        elif "亮光实木" in sku:
            return "亮光实木桌专用"
        elif "哑光岩板" in sku:
            return "哑光岩板桌专用"
        elif "亮光岩板" in sku:
            return "亮光岩板桌专用"
        elif "联系客服" in sku or "指导" in sku:
            return "含一对一指导款"
        return "其他"

    def _build_keywords_list(self, all_freq: Counter, pos_freq: Counter, neg_freq: Counter) -> list[dict]:
        """构建高频关键词列表"""
        keywords = []
        # 正面关键词
        for word, count in pos_freq.most_common(15):
            if len(word) >= 2:
                keywords.append({"word": word, "count": count, "sentiment": "positive"})
        # 负面关键词
        for word, count in neg_freq.most_common(10):
            if len(word) >= 2 and not any(k["word"] == word for k in keywords):
                keywords.append({"word": word, "count": count, "sentiment": "negative"})
        return keywords[:20]

    def _build_trend(self, reviews: list[dict]) -> list[dict]:
        """构建评价趋势"""
        month_counts = defaultdict(int)
        for r in reviews:
            date = r.get("date", "")
            if date:
                month = date[:7]  # YYYY-MM
                month_counts[month] += 1

        trend = []
        for month in sorted(month_counts.keys()):
            parts = month.split("-")
            label = f"{parts[0]}/{int(parts[1])}"
            trend.append({"month": label, "count": month_counts[month]})
        return trend

    def _build_details(self, reviews: list[dict], sentiments: list[str]) -> list[dict]:
        """构建评价明细（筛选有内容的）"""
        details = []
        for i, r in enumerate(reviews):
            content = r.get("content", "")
            if not self._has_content(content):
                continue
            sentiment_cn = {"positive": "正面", "negative": "负面", "neutral": "中性"}[sentiments[i]]
            product_type = self._extract_product_type(r.get("sku", ""))
            details.append({
                "id": i + 1,
                "content": content,
                "sku": r.get("sku", "")[:30],
                "product_type": product_type,
                "needs": self._extract_needs_tags(content),
                "date": r.get("date", ""),
                "has_image": bool(r.get("images") or r.get("晒图")),
                "sentiment": sentiment_cn,
            })
        return details[:30]  # 最多返回30条

    def _extract_needs_tags(self, text: str) -> str:
        """从评价中提取需求标签"""
        tags = []
        for dim, keywords in NEED_DIMENSIONS.items():
            if any(kw in text for kw in keywords):
                tags.append(dim)
        return "、".join(tags[:3]) if tags else "综合评价"

    def _generate_suggestions(self, pain_points: list, needs_analysis: dict) -> list[str]:
        """基于分析结果生成优化建议"""
        suggestions = []
        for p in pain_points:
            if "气泡" in p["text"] or "起泡" in p["text"]:
                suggestions.append("优化贴膜教程，增加\"喷水量控制\"详细说明，建议附带喷壶刻度标记，降低用户因水量不当导致起泡的概率")
            elif "客服" in p["text"]:
                suggestions.append("延长客服在线服务时间，增加晚间值班人员；建立标准化的售后处理流程，避免推诿现象")
            elif "教程" in p["text"] or "操作" in p["text"]:
                suggestions.append("重新制作贴膜教程视频，增加\"保护膜撕除\"步骤的醒目提示，建议用红色箭头标注")
            elif "工具" in p["text"]:
                suggestions.append("加强发货前的工具配件检查流程，建议在包装内增加配件清单卡，确保每单工具齐全")
            elif "描述不符" in p["text"]:
                suggestions.append("检查并更新商品详情页描述，确保实物效果与宣传图片一致，避免过度美化")
            elif "伤" in p["text"] or "撕" in p["text"]:
                suggestions.append("在产品页面增加\"安全撕除指南\"，说明正确的加热撕膜方法，降低损伤桌面风险")
            elif "包装" in p["text"]:
                suggestions.append("升级包装方案，使用硬质纸管替代普通包装，防止运输过程中薄膜受压变形")

        if not suggestions:
            suggestions = [
                "持续收集用户反馈，建立评价监控和快速响应机制",
                "优化产品详情页描述，突出核心卖点和差异化优势",
            ]
        return suggestions

    def _has_content(self, text: str) -> bool:
        """检查评价是否有实质内容"""
        if not text or not text.strip():
            return False
        # 过滤掉系统默认好评
        defaults = [
            "该用户觉得商品非常好，给出5星好评",
            "该用户未填写评价内容",
            "该用户觉得商品非常好",
        ]
        for d in defaults:
            if d in text:
                return False
        return len(text.strip()) >= 4

    def _empty_result(self) -> dict:
        return {
            "total_reviews": 0, "effective_reviews": 0,
            "with_images": 0, "with_followup": 0,
            "sentiment": {"positive": 0, "neutral": 0, "negative": 0},
            "sentiment_counts": {"positive": 0, "neutral": 0, "negative": 0},
            "review_trend": [], "needs_top10": [], "dimensions": [],
            "pain_points": [], "positive_points": [], "keywords": [],
            "needs_summary": [], "optimization_suggestions": [],
            "sku_analysis": [], "review_details": [], "word_cloud": [],
        }


# 单例
review_analyzer = ReviewAnalyzer()
