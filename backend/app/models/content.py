from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content_type: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="类型: main_image/detail_page/buyer_show/short_video/social_post"
    )
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"), nullable=True)
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="AI生成用的提示词")
    raw_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="AI原始输出")
    reviewed_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="人工审核后的输出")
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft",
        comment="draft/pending_review/approved/published"
    )
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="审核备注")
    performance_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="上线后的效果数据")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<GeneratedContent(id={self.id}, type='{self.content_type}', status='{self.status}')>"
