"""Celery AI 生成任务"""
import asyncio
from celery import shared_task


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def generate_main_images(self, product_id: int, brief: dict, count: int = 3):
    """AI 生成主图

    Args:
        product_id: 产品ID
        brief: 设计brief
        count: 生成数量
    """
    try:
        from app.services.ai_service import ai_service
        from app.services.image_service import image_service

        prompt = f"""根据以下设计brief，生成{count}个主图方案描述：
构图: {brief.get('composition', '')}
配色: {brief.get('colorScheme', '')}
文案: {brief.get('copyText', '')}
卖点: {', '.join(brief.get('sellingPoints', []))}"""

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            text_result = loop.run_until_complete(
                ai_service.chat(prompt, system_prompt="你是电商主图设计专家")
            )
        finally:
            loop.close()

        # 生成占位图
        images = []
        if image_service:
            for i in range(count):
                buf = image_service.create_placeholder(
                    text=f"主图V{i+1}",
                    color_scheme="蓝白",
                )
                images.append(f"placeholder_v{i+1}.jpg")

        return {
            "status": "success",
            "product_id": product_id,
            "ai_text": text_result,
            "images": images,
            "count": count,
        }
    except Exception as exc:
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def generate_detail_page_images(self, blocks: list[dict]):
    """根据详情页区块生成图片

    Args:
        blocks: 区块列表 [{type, title, content}]
    """
    try:
        from app.services.image_service import image_service

        if not image_service:
            return {"status": "error", "message": "Pillow 未安装"}

        block_images = []
        for block in blocks:
            buf = image_service.create_detail_page_block(
                title=block.get("title", ""),
                content=block.get("content", ""),
                block_type=block.get("type", "展示区"),
            )
            block_images.append(buf)

        # 拼接长图
        final = image_service.stitch_detail_blocks(block_images)

        return {
            "status": "success",
            "block_count": len(blocks),
            "message": f"已生成 {len(blocks)} 个区块图片并拼接",
        }
    except Exception as exc:
        self.retry(exc=exc)


@shared_task(bind=True, max_retries=1, default_retry_delay=60)
def generate_video(self, scenes: list[dict], voice_style: str = "warm"):
    """AI 生成短视频（异步，耗时较长）

    Args:
        scenes: 分镜列表
        voice_style: 配音风格
    """
    # TODO: 接入可灵/Runway API
    return {
        "status": "mock",
        "scene_count": len(scenes),
        "voice_style": voice_style,
        "message": "视频生成任务（需配置 VIDEO_GEN_API_KEY）",
    }


@shared_task
def generate_tts(self, text: str, voice: str = "warm"):
    """TTS 语音合成

    Args:
        text: 要合成的文本
        voice: 声音风格
    """
    # TODO: 接入 TTS 服务（Kokoro / 阿里云 TTS）
    return {
        "status": "mock",
        "text_length": len(text),
        "voice": voice,
        "message": "TTS 合成任务（需配置 TTS 服务）",
    }
