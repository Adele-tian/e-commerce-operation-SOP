from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CompetitorAnalysis(Base):
    __tablename__ = "competitor_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, comment="关联竞品产品ID")
    review_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="评价数据汇总")
    sentiment_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="情感分析结果")
    pain_points: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="痛点列表(按频率排序)")
    positive_points: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="好评点列表")
    keyword_frequency: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="评价高频词")
    analysis_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<CompetitorAnalysis(id={self.id}, product_id={self.product_id})>"
