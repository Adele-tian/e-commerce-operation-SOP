"""图片处理服务 - AI生图 + Pillow 后处理"""
import io
import os
import random
import string
from datetime import datetime
from typing import Optional

import httpx

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# 本地存储目录
_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "images")


class ImageService:
    """图片生成和后处理服务"""

    # 淘宝主图尺寸
    MAIN_IMAGE_SIZE = (800, 800)
    DETAIL_PAGE_WIDTH = 750

    # 电商主图 prompt 模板
    _PROMPT_TEMPLATES = {
        "product_center": "电商产品主图，{product}居中放置，45度傄拍视角，{bg_desc}，专业产品摄影，高清质感，白底商品图风格，{color_desc}",
        "lifestyle": "电商产品主图，{product}在真实使用场景中，{bg_desc}，温馨自然光线，生活场景摄影，{color_desc}",
        "ingredient": "电商产品主图，{product}与核心成分可视化展示，{bg_desc}，科技感，成分分子图示，{color_desc}",
        "before_after": "电商产品主图，使用前后对比效果展示，{product}，{bg_desc}，分屏布局，{color_desc}",
    }

    # 默认配色
    COLOR_SCHEMES = {
        "蓝白": {"bg": (235, 245, 255), "fg": (59, 130, 246), "accent": (255, 255, 255)},
        "绿白": {"bg": (236, 253, 245), "fg": (16, 185, 129), "accent": (255, 255, 255)},
        "粉白": {"bg": (253, 242, 248), "fg": (236, 72, 153), "accent": (255, 255, 255)},
        "黑白金": {"bg": (30, 30, 30), "fg": (255, 255, 255), "accent": (212, 175, 55)},
    }

    def __init__(self):
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow 未安装，请执行: pip install Pillow")

    # ──────────────────────────────────────────────
    # AI 生图
    # ──────────────────────────────────────────────

    async def generate_main_images(
        self,
        brief: dict,
        product_name: str = "涂抹面膜",
        count: int = 3,
    ) -> list[dict]:
        """根据设计 Brief 调用通义万相生成主图。

        返回:
            [{"image_url": "...", "thumbnail_url": "...", "prompt": "..."}, ...]
        """
        from app.services.ai_service import ai_service

        composition = brief.get("composition", "产品居中45°傄拍")
        color_scheme = brief.get("color_scheme", "浅蓝+白色")
        copy_text = brief.get("copy_text", "")
        selling_points = brief.get("selling_points", [])

        # 构建生图 prompt（英文效果更好）
        bg_desc = f"背景{composition.split('，')[0] if '，' in composition else composition}"
        color_desc = f"配色方案：{color_scheme}"

        templates = list(self._PROMPT_TEMPLATES.values())
        results = []

        for i in range(min(count, 4)):
            tmpl = templates[i % len(templates)]
            prompt = tmpl.format(
                product=product_name,
                bg_desc=bg_desc,
                color_desc=color_desc,
            )
            # 追加卖点描述
            if selling_points:
                prompt += f"，产品卖点标签：{'、'.join(selling_points[:3])}"

            try:
                urls = await ai_service.generate_image(prompt, size="1024*1024", n=1)
                url = urls[0] if urls else ""
            except Exception:
                url = f"https://picsum.photos/seed/{random.randint(100,999)}/1024/1024"

            # 下载到本地
            local_path = await self.download_and_store(url) if url.startswith("http") else None

            results.append({
                "image_url": url,
                "local_path": local_path,
                "thumbnail_url": url,   # 简化：复用同一 URL
                "prompt": prompt,
            })

        return results

    async def download_and_store(self, image_url: str) -> Optional[str]:
        """下载图片到本地 storage/images/ 目录"""
        os.makedirs(_STORAGE_DIR, exist_ok=True)
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        filename = f"{datetime.now().strftime('%Y%m%d')}_{suffix}.jpg"
        filepath = os.path.join(_STORAGE_DIR, filename)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(image_url)
                resp.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(resp.content)
            return filepath
        except Exception:
            return None

    def get_storage_url(self, local_path: str) -> str:
        """将本地文件路径转为可访问的 URL"""
        return f"/api/images/file/{os.path.basename(local_path)}"

    # ──────────────────────────────────────────────
    # Pillow 后处理
    # ──────────────────────────────────────────────

    def create_placeholder(
        self,
        width: int = 800,
        height: int = 800,
        text: str = "产品图",
        color_scheme: str = "蓝白",
    ) -> io.BytesIO:
        """创建占位图（开发阶段使用）"""
        colors = self.COLOR_SCHEMES.get(color_scheme, self.COLOR_SCHEMES["蓝白"])
        img = Image.new("RGB", (width, height), colors["bg"])
        draw = ImageDraw.Draw(img)

        # 绘制中心文字
        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 36)
            small_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 18)
        except (IOError, OSError):
            font = ImageFont.load_default()
            small_font = font

        # 主标题
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((width - tw) / 2, (height - th) / 2 - 20), text, fill=colors["fg"], font=font)

        # 尺寸标注
        size_text = f"{width} x {height}"
        bbox2 = draw.textbbox((0, 0), size_text, font=small_font)
        tw2 = bbox2[2] - bbox2[0]
        draw.text(((width - tw2) / 2, (height + th) / 2 + 10), size_text, fill=(*colors["fg"], 128), font=small_font)

        # 边框
        draw.rectangle([0, 0, width - 1, height - 1], outline=colors["fg"], width=2)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return buf

    def add_text_overlay(
        self,
        image_path: Optional[str] = None,
        text_lines: list[str] | None = None,
        position: str = "bottom",
        font_size: int = 32,
    ) -> io.BytesIO:
        """在图片上叠加文案"""
        if image_path and os.path.exists(image_path):
            img = Image.open(image_path).convert("RGB")
        else:
            img = Image.new("RGB", self.MAIN_IMAGE_SIZE, (255, 255, 255))

        draw = ImageDraw.Draw(img, "RGBA")
        w, h = img.size

        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()

        lines = text_lines or []
        if not lines:
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=90)
            buf.seek(0)
            return buf

        # 计算文字区域
        line_height = font_size + 8
        total_height = line_height * len(lines)

        if position == "bottom":
            # 半透明背景
            overlay_y = h - total_height - 40
            draw.rectangle([0, overlay_y, w, h], fill=(0, 0, 0, 140))
            y_start = overlay_y + 20
        elif position == "top":
            draw.rectangle([0, 0, w, total_height + 40], fill=(0, 0, 0, 140))
            y_start = 20
        else:
            y_start = (h - total_height) // 2

        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            tw = bbox[2] - bbox[0]
            draw.text(((w - tw) / 2, y_start + i * line_height), line, fill=(255, 255, 255), font=font)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return buf

    def create_detail_page_block(
        self,
        title: str,
        content: str,
        block_type: str = "展示区",
        width: int = 750,
        height: int = 600,
    ) -> io.BytesIO:
        """生成详情页单个区块图片"""
        color_map = {
            "冲击区": ((220, 38, 38), (255, 255, 255)),
            "展示区": ((37, 99, 235), (255, 255, 255)),
            "功效区": ((5, 150, 105), (255, 255, 255)),
            "口碑区": ((217, 119, 6), (255, 255, 255)),
            "引导区": ((124, 58, 237), (255, 255, 255)),
        }
        bg_color, text_color = color_map.get(block_type, ((100, 100, 100), (255, 255, 255)))

        img = Image.new("RGB", (width, height), bg_color)
        draw = ImageDraw.Draw(img)

        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 42)
            content_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 24)
        except (IOError, OSError):
            title_font = ImageFont.load_default()
            content_font = title_font

        # 标题
        bbox = draw.textbbox((0, 0), title, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) / 2, 80), title, fill=text_color, font=title_font)

        # 内容（自动换行）
        lines = self._wrap_text(content, content_font, width - 80, draw)
        y = 180
        for line in lines[:6]:
            draw.text((40, y), line, fill=(*text_color, 220), font=content_font)
            y += 36

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        buf.seek(0)
        return buf

    def _wrap_text(self, text: str, font, max_width: int, draw) -> list[str]:
        """简单的文字换行"""
        lines = []
        current = ""
        for char in text:
            test = current + char
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_width:
                if current:
                    lines.append(current)
                current = char
            else:
                current = test
        if current:
            lines.append(current)
        return lines

    def stitch_detail_blocks(self, block_images: list[io.BytesIO]) -> io.BytesIO:
        """将多个区块图片拼接为完整详情页长图"""
        if not block_images:
            return io.BytesIO()

        images = []
        total_height = 0
        max_width = self.DETAIL_PAGE_WIDTH

        for buf in block_images:
            buf.seek(0)
            img = Image.open(buf).convert("RGB")
            # 缩放到统一宽度
            if img.width != max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            images.append(img)
            total_height += img.height

        # 拼接
        final = Image.new("RGB", (max_width, total_height), (255, 255, 255))
        y_offset = 0
        for img in images:
            final.paste(img, (0, y_offset))
            y_offset += img.height

        buf = io.BytesIO()
        final.save(buf, format="JPEG", quality=92)
        buf.seek(0)
        return buf


# 条件实例化
try:
    image_service = ImageService()
except RuntimeError:
    image_service = None  # type: ignore
