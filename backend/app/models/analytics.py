from datetime import datetime, date
from typing import Optional

from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"), nullable=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, comment="快照日期")
    impressions: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="曝光量")
    clicks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="点击量")
    ctr: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="点击率")
    add_to_cart: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="加购数")
    orders: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="下单数")
    conversion_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="转化率")
    review_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="评价数")
    positive_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="好评率")
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, comment="数据来源")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AnalyticsSnapshot(id={self.id}, date={self.snapshot_date})>"
