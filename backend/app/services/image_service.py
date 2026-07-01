"""图片处理服务 - 基于 Pillow"""
import io
import os
from datetime import datetime
from typing import Optional

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class ImageService:
    """图片生成和后处理服务"""

    # 淘宝主图尺寸
    MAIN_IMAGE_SIZE = (800, 800)
    DETAIL_PAGE_WIDTH = 750

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
