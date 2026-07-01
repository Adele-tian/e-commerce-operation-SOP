"""API 集成测试"""
import httpx
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)


@pytest.fixture
def client():
    """创建测试客户端（同步方式用 httpx）"""
    return httpx.Client(base_url="http://testserver", transport=httpx.MockTransport(_mock_handler))


def _mock_handler(request: httpx.Request) -> httpx.Response:
    """转发请求到 ASGI app"""
    import asyncio
    async def _run():
        async with AsyncClient(transport=transport, base_url="http://testserver") as c:
            resp = await c.request(
                method=request.method,
                url=str(request.url),
                content=request.content,
                headers=dict(request.headers),
            )
            return resp
    return asyncio.get_event_loop().run_until_complete(_run())


# ============================================================
# Health
# ============================================================

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ============================================================
# Dashboard
# ============================================================

@pytest.mark.asyncio
async def test_dashboard_overview():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/dashboard/overview")
    assert r.status_code == 200
    data = r.json()
    assert "stats" in data or "activities" in data


@pytest.mark.asyncio
async def test_dashboard_trend():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/dashboard/trend")
    assert r.status_code == 200


# ============================================================
# Keywords
# ============================================================

@pytest.mark.asyncio
async def test_keywords_list():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/keywords/list")
    assert r.status_code == 200
    data = r.json()
    assert "keywords" in data


# ============================================================
# Competitors
# ============================================================

@pytest.mark.asyncio
async def test_competitors_list():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/competitors")
    assert r.status_code == 200
    data = r.json()
    assert "competitors" in data


@pytest.mark.asyncio
async def test_competitors_analysis():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/competitors/1/analysis")
    assert r.status_code == 200


# ============================================================
# Images
# ============================================================

@pytest.mark.asyncio
async def test_images_brief_default():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/images/brief/default")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_images_generate():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/images/generate", json={"brief": {}})
    assert r.status_code == 200


# ============================================================
# Detail Page
# ============================================================

@pytest.mark.asyncio
async def test_detail_page_script():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/detail-page/script")
    assert r.status_code == 200
    data = r.json()
    assert "blocks" in data
    assert len(data["blocks"]) > 0


@pytest.mark.asyncio
async def test_detail_page_update_blocks():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/detail-page/blocks/update", json={
            "blocks": [{"id": "b1", "type": "冲击区", "title": "测试", "content": "测试内容", "order": 1}]
        })
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_detail_page_review():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/detail-page/review", json={"action": "approve"})
    assert r.status_code == 200
    assert r.json()["review_status"] == "approved"


# ============================================================
# Buyer Show
# ============================================================

@pytest.mark.asyncio
async def test_buyer_show_templates():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/buyer-show/templates")
    assert r.status_code == 200
    assert "templates" in r.json()


@pytest.mark.asyncio
async def test_buyer_show_list():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/buyer-show/list")
    assert r.status_code == 200


# ============================================================
# Video
# ============================================================

@pytest.mark.asyncio
async def test_video_types():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/video/types")
    assert r.status_code == 200
    assert len(r.json()["types"]) >= 5


@pytest.mark.asyncio
async def test_video_script():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/video/script")
    assert r.status_code == 200
    assert "scenes" in r.json()


@pytest.mark.asyncio
async def test_video_generate():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/video/generate")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_video_review():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/video/review", json={"action": "approve"})
    assert r.status_code == 200


# ============================================================
# Social
# ============================================================

@pytest.mark.asyncio
async def test_social_platforms():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/social/platforms")
    assert r.status_code == 200
    assert len(r.json()["platforms"]) == 3


@pytest.mark.asyncio
async def test_social_calendar():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/social/calendar")
    assert r.status_code == 200
    assert len(r.json()["events"]) > 0


@pytest.mark.asyncio
async def test_social_generate():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/social/generate", json={"platform": "xiaohongshu"})
    assert r.status_code == 200
    assert "content" in r.json()


# ============================================================
# Analytics
# ============================================================

@pytest.mark.asyncio
async def test_analytics_overview():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/overview")
    assert r.status_code == 200
    assert len(r.json()["kpi"]) == 4


@pytest.mark.asyncio
async def test_analytics_trend():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/trend?period=day")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analytics_ab_test():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/ab-test")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analytics_alerts():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/alerts")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analytics_product():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/product/1")
    assert r.status_code == 200
    assert r.json()["product_id"] == 1


@pytest.mark.asyncio
async def test_analytics_content():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/analytics/content/1")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analytics_snapshot():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/analytics/snapshot?product_id=1")
    assert r.status_code == 200
    assert "snapshot" in r.json()


@pytest.mark.asyncio
async def test_analytics_report():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/analytics/report?report_type=weekly")
    assert r.status_code == 200


# ============================================================
# Auth
# ============================================================

@pytest.mark.asyncio
async def test_auth_login():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_login_invalid():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_auth_dev_token():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/auth/token")
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_auth_verify():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        # 先获取 token
        login_r = await c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        token = login_r.json()["access_token"]
        # 验证 token
        r = await c.get("/api/auth/verify", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["user"] == "admin"


# ============================================================
# Market
# ============================================================

@pytest.mark.asyncio
async def test_market_scan():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/market/blue-ocean/scan", json={"keyword": "涂抹面膜"})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_market_results():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        # 先扫描一次
        await c.post("/api/market/blue-ocean/scan", json={"keyword": "涂抹面膜"})
        # 再获取结果
        r = await c.get("/api/market/blue-ocean/results?keyword=涂抹面膜")
    assert r.status_code == 200


# ============================================================
# Keywords (CRUD)
# ============================================================

@pytest.mark.asyncio
async def test_keywords_collect():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/keywords/collect", json={"seed_keyword": "面膜测试"})
    assert r.status_code == 200
    assert r.json()["collected"] > 0


@pytest.mark.asyncio
async def test_keywords_create():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/keywords/", json={"keyword": "测试关键词创建", "search_volume": 5000})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_keywords_list_with_filter():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/keywords/list?category=功能需求")
    assert r.status_code == 200
    data = r.json()
    assert all(k["category"] == "功能需求" for k in data["keywords"])


@pytest.mark.asyncio
async def test_keywords_export():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.get("/api/keywords/export")
    assert r.status_code == 200
    assert "spreadsheet" in r.headers.get("content-type", "")


# ============================================================
# Images (Search Analysis)
# ============================================================

@pytest.mark.asyncio
async def test_images_search_analysis():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        r = await c.post("/api/images/search-analysis?keyword=涂抹面膜&top_n=10")
    assert r.status_code == 200
    data = r.json()
    assert "analysis" in data
    assert data["analysis"]["keyword"] == "涂抹面膜"


@pytest.mark.asyncio
async def test_images_search_analysis_get():
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        # 先创建
        await c.post("/api/images/search-analysis?keyword=test")
        # 再获取
        r = await c.get("/api/images/search-analysis/1")
    assert r.status_code == 200
