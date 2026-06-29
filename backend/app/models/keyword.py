from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Keyword(Base):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    keyword: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, comment="关键词文本")
    search_volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="搜索量")
    competition_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="竞争度 (0-1)")
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, comment="分类: 功能/场景/人群/品牌")
    potential_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="潜力评分")
    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, comment="来源: 下拉词/相关搜索/生意参谋")
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"), nullable=True, comment="关联产品ID")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="备注")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Keyword(id={self.id}, keyword='{self.keyword}', volume={self.search_volume})>"
