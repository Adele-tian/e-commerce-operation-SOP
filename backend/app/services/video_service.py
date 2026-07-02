"""视频合成服务 - 图片轮播 + Ken Burns + 字幕 + 转场"""
import io
import os
import math
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

try:
    import imageio
    IMAGEIO_AVAILABLE = True
except ImportError:
    IMAGEIO_AVAILABLE = False

import numpy as np

# 视频存储目录
_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "videos")

# 视频参数
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920  # 竖屏 9:16
VIDEO_FPS = 24
FADE_DURATION = 0.5  # 转场淡入淡出秒数


class VideoService:
    """图片轮播视频合成服务"""

    def __init__(self):
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow 未安装")
        if not IMAGEIO_AVAILABLE:
            raise RuntimeError("imageio 未安装，请执行: pip install imageio[ffmpeg]")

    async def create_slideshow_video(
        self,
        image_urls: list[str],
        scenes: list[dict],
        output_name: Optional[str] = None,
    ) -> dict:
        """根据图片和分镜信息合成轮播视频。

        Args:
            image_urls: 图片 URL 列表（可复用，不够则循环）
            scenes: 分镜列表 [{"scene": "场景名", "narration": "旁白", "duration": 5}, ...]
            output_name: 输出文件名前缀

        Returns:
            {"video_path": "...", "video_url": "...", "duration": 30, "frame_count": 720}
        """
        os.makedirs(_STORAGE_DIR, exist_ok=True)

        # 1. 下载所有图片
        pil_images = []
        for i, url in enumerate(image_urls):
            img = await self._download_image(url)
            if img:
                pil_images.append(img)

        # 如果图片不够，用场景数循环复用
        if not pil_images:
            pil_images = [self._create_placeholder_image(f"场景 {i+1}") for i in range(len(scenes))]
        while len(pil_images) < len(scenes):
            pil_images.append(pil_images[len(pil_images) % len(pil_images) if len(pil_images) > 0 else 0])

        # 2. 生成视频帧
        all_frames = []
        total_duration = 0

        for idx, scene in enumerate(scenes):
            duration = scene.get("duration", 5)
            total_duration += duration
            narration = scene.get("narration", "")
            scene_name = scene.get("scene", f"场景 {idx+1}")

            img = pil_images[idx % len(pil_images)]
            # 确保图片是 RGB
            img = img.convert("RGB")
            # 缩放到视频尺寸（保持比例，居中裁切）
            img = self._crop_to_fill(img, VIDEO_WIDTH, VIDEO_HEIGHT)

            # Ken Burns 效果
            direction = random.choice(["zoom_in", "zoom_out", "pan_left", "pan_right"])
            frame_count = int(duration * VIDEO_FPS)
            scene_frames = self._ken_burns_frames(img, frame_count, direction)

            # 添加字幕
            for fi, frame in enumerate(scene_frames):
                frame = self._add_subtitle(frame, narration)
                # 场景名（小字）
                frame = self._add_scene_label(frame, scene_name)
                all_frames.append(np.array(frame))

            # 淡出转场
            if idx < len(scenes) - 1:
                fade_frames = int(FADE_DURATION * VIDEO_FPS)
                last_frame = all_frames[-1] if all_frames else np.zeros((VIDEO_HEIGHT, VIDEO_WIDTH, 3), dtype=np.uint8)
                for fi in range(fade_frames):
                    alpha = 1.0 - (fi / fade_frames)
                    faded = (last_frame * alpha).astype(np.uint8)
                    all_frames.append(faded)

        if not all_frames:
            raise RuntimeError("未生成任何帧")

        # 3. 写入视频文件
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        prefix = output_name or datetime.now().strftime("%Y%m%d")
        filename = f"{prefix}_{suffix}.mp4"
        filepath = os.path.join(_STORAGE_DIR, filename)

        writer = imageio.get_writer(filepath, fps=VIDEO_FPS, codec="libx264",
                                    quality=8, pixelformat="yuv420p")
        try:
            for frame in all_frames:
                writer.append_data(frame)
        finally:
            writer.close()

        return {
            "video_path": filepath,
            "video_url": f"/api/video/file/{filename}",
            "duration": total_duration,
            "frame_count": len(all_frames),
            "resolution": f"{VIDEO_WIDTH}x{VIDEO_HEIGHT}",
        }

    async def generate_scene_images(self, scenes: list[dict]) -> list[str]:
        """为每个分镜场景生成 AI 图片。

        Returns:
            图片 URL 列表
        """
        from app.services.ai_service import ai_service

        urls = []
        for scene in scenes:
            desc = scene.get("description", scene.get("scene", "产品展示"))
            prompt = f"电商短视频分镜画面：{desc}，高清竖屏构图，电影质感，专业打光"
            try:
                result = await ai_service.generate_image(prompt, size="720*1280", n=1)
                urls.extend(result)
            except Exception:
                urls.append(f"https://picsum.photos/seed/{random.randint(100,999)}/720/1280")
        return urls

    # ──────────────────────────────────────────
    # 内部方法
    # ──────────────────────────────────────────

    async def _download_image(self, url: str) -> Optional[Image.Image]:
        """下载图片并返回 PIL Image"""
        if not url.startswith("http"):
            return None
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                return Image.open(io.BytesIO(resp.content))
        except Exception:
            return None

    def _create_placeholder_image(self, text: str) -> Image.Image:
        """创建占位图"""
        img = Image.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT), (30, 41, 59))
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 64)
        except (IOError, OSError):
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((VIDEO_WIDTH - tw) / 2, (VIDEO_HEIGHT - th) / 2), text, fill=(255, 255, 255), font=font)
        return img

    def _crop_to_fill(self, img: Image.Image, w: int, h: int) -> Image.Image:
        """裁切图片填满指定尺寸（居中裁切）"""
        iw, ih = img.size
        scale = max(w / iw, h / ih)
        new_w, new_h = int(iw * scale), int(ih * scale)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        left = (new_w - w) // 2
        top = (new_h - h) // 2
        return img.crop((left, top, left + w, top + h))

    def _ken_burns_frames(self, img: Image.Image, frame_count: int, direction: str) -> list[Image.Image]:
        """生成 Ken Burns 缩放/平移效果帧序列"""
        frames = []
        max_zoom = 1.15  # 最大缩放 15%

        for fi in range(frame_count):
            progress = fi / max(frame_count - 1, 1)

            if direction == "zoom_in":
                zoom = 1.0 + (max_zoom - 1.0) * progress
            elif direction == "zoom_out":
                zoom = max_zoom - (max_zoom - 1.0) * progress
            elif direction == "pan_left":
                zoom = 1.08
            else:  # pan_right
                zoom = 1.08

            # 裁切区域
            crop_w = int(VIDEO_WIDTH / zoom)
            crop_h = int(VIDEO_HEIGHT / zoom)
            iw, ih = img.size

            if direction == "pan_left":
                max_offset_x = iw - crop_w
                cx = int(max_offset_x * (1 - progress))
                cy = (ih - crop_h) // 2
            elif direction == "pan_right":
                max_offset_x = iw - crop_w
                cx = int(max_offset_x * progress)
                cy = (ih - crop_h) // 2
            else:
                cx = (iw - crop_w) // 2
                cy = (ih - crop_h) // 2

            cx = max(0, min(cx, iw - crop_w))
            cy = max(0, min(cy, ih - crop_h))

            cropped = img.crop((cx, cy, cx + crop_w, cy + crop_h))
            frame = cropped.resize((VIDEO_WIDTH, VIDEO_HEIGHT), Image.LANCZOS)
            frames.append(frame)

        return frames

    def _add_subtitle(self, frame: Image.Image, text: str) -> Image.Image:
        """在帧底部添加字幕"""
        if not text:
            return frame
        draw = ImageDraw.Draw(frame, "RGBA")

        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 42)
        except (IOError, OSError):
            font = ImageFont.load_default()

        # 自动换行
        lines = self._wrap_text(text, font, VIDEO_WIDTH - 120, draw)
        if not lines:
            return frame

        line_height = 52
        total_h = line_height * len(lines)
        y_start = VIDEO_HEIGHT - total_h - 100

        # 半透明背景
        draw.rectangle([0, y_start - 20, VIDEO_WIDTH, VIDEO_HEIGHT], fill=(0, 0, 0, 160))

        for i, line in enumerate(lines[-3:]):  # 最多显示3行
            bbox = draw.textbbox((0, 0), line, font=font)
            tw = bbox[2] - bbox[0]
            x = (VIDEO_WIDTH - tw) // 2
            y = y_start + i * line_height
            # 文字阴影
            draw.text((x + 2, y + 2), line, fill=(0, 0, 0), font=font)
            draw.text((x, y), line, fill=(255, 255, 255), font=font)

        return frame

    def _add_scene_label(self, frame: Image.Image, text: str) -> Image.Image:
        """在帧左上角添加场景名"""
        if not text:
            return frame
        draw = ImageDraw.Draw(frame, "RGBA")

        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 28)
        except (IOError, OSError):
            font = ImageFont.load_default()

        # 背景圆角矩形
        draw.rounded_rectangle([30, 40, 30 + len(text) * 30 + 20, 85], radius=10, fill=(0, 0, 0, 120))
        draw.text((40, 47), text, fill=(255, 255, 255), font=font)
        return frame

    def _wrap_text(self, text: str, font, max_width: int, draw) -> list[str]:
        """中文文字换行"""
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


# 条件实例化
try:
    video_service = VideoService()
except RuntimeError:
    video_service = None  # type: ignore
