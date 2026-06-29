from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, Numeric, Text, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="产品名称")
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="涂抹面膜", comment="品类")
    store_name: Mapped[str] = mapped_column(String(100), nullable=False, default="钟永发", comment="店铺名")
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True, comment="价格")
    sku_variants: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="SKU变体列表")
    main_images: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="主图URL列表")
    detail_images: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="详情页图片URL列表")
    competitor_flag: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否竞品")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="产品描述")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', category='{self.category}')>"
