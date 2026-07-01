"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- products ---
    op.create_table(
        "products",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False, comment="产品名称"),
        sa.Column("category", sa.String(100), nullable=False, server_default="涂抹面膜", comment="品类"),
        sa.Column("store_name", sa.String(100), nullable=False, server_default="钟永发", comment="店铺名"),
        sa.Column("price", sa.Numeric(10, 2), nullable=True, comment="价格"),
        sa.Column("sku_variants", JSON, nullable=True, comment="SKU变体列表"),
        sa.Column("main_images", JSON, nullable=True, comment="主图URL列表"),
        sa.Column("detail_images", JSON, nullable=True, comment="详情页图片URL列表"),
        sa.Column("competitor_flag", sa.Boolean, server_default=sa.text("false"), comment="是否竞品"),
        sa.Column("description", sa.Text, nullable=True, comment="产品描述"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_products_category", "products", ["category"])
    op.create_index("ix_products_competitor_flag", "products", ["competitor_flag"])

    # --- keywords ---
    op.create_table(
        "keywords",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("keyword", sa.String(255), nullable=False, unique=True, comment="关键词文本"),
        sa.Column("search_volume", sa.Integer, nullable=True, server_default=sa.text("0"), comment="搜索量"),
        sa.Column("competition_level", sa.Float, nullable=True, server_default=sa.text("0"), comment="竞争度(0-1)"),
        sa.Column("category", sa.String(50), nullable=True, comment="分类"),
        sa.Column("potential_score", sa.Float, nullable=True, server_default=sa.text("50"), comment="潜力评分"),
        sa.Column("source", sa.String(50), nullable=True, comment="来源"),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_keywords_category", "keywords", ["category"])
    op.create_index("ix_keywords_product_id", "keywords", ["product_id"])
    op.create_index("ix_keywords_search_volume", "keywords", ["search_volume"])

    # --- competitor_analyses ---
    op.create_table(
        "competitor_analyses",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column("review_data", JSON, nullable=True, comment="评价数据汇总"),
        sa.Column("sentiment_summary", JSON, nullable=True, comment="情感分析结果"),
        sa.Column("pain_points", JSON, nullable=True, comment="痛点列表"),
        sa.Column("positive_points", JSON, nullable=True, comment="好评点列表"),
        sa.Column("keyword_frequency", JSON, nullable=True, comment="评价高频词"),
        sa.Column("analysis_date", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_competitor_analyses_product_id", "competitor_analyses", ["product_id"])

    # --- generated_contents ---
    op.create_table(
        "generated_contents",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("content_type", sa.String(50), nullable=False, comment="类型"),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=True),
        sa.Column("prompt", sa.Text, nullable=True, comment="AI生成用的提示词"),
        sa.Column("raw_output", JSON, nullable=True, comment="AI原始输出"),
        sa.Column("reviewed_output", JSON, nullable=True, comment="人工审核后的输出"),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft", comment="状态"),
        sa.Column("reviewer_notes", sa.Text, nullable=True, comment="审核备注"),
        sa.Column("performance_data", JSON, nullable=True, comment="效果数据"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_generated_contents_content_type", "generated_contents", ["content_type"])
    op.create_index("ix_generated_contents_status", "generated_contents", ["status"])
    op.create_index("ix_generated_contents_product_id", "generated_contents", ["product_id"])

    # --- analytics_snapshots ---
    op.create_table(
        "analytics_snapshots",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column("snapshot_date", sa.Date, nullable=False),
        sa.Column("impressions", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("clicks", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("ctr", sa.Float, nullable=True, server_default=sa.text("0")),
        sa.Column("add_to_cart", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("orders", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("conversion_rate", sa.Float, nullable=True, server_default=sa.text("0")),
        sa.Column("review_count", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("positive_rate", sa.Float, nullable=True, server_default=sa.text("0")),
        sa.Column("source", sa.String(50), nullable=True, comment="数据来源"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_analytics_snapshots_product_id", "analytics_snapshots", ["product_id"])
    op.create_index("ix_analytics_snapshots_date", "analytics_snapshots", ["snapshot_date"])


def downgrade() -> None:
    op.drop_table("analytics_snapshots")
    op.drop_table("generated_contents")
    op.drop_table("competitor_analyses")
    op.drop_table("keywords")
    op.drop_table("products")
