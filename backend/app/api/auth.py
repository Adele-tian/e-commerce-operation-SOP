"""简单的 JWT Token 认证中间件"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError

from app.config import settings

# JWT 配置
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str = "admin"
    password: str = "admin123"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    """验证 JWT token，返回 payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )


# 不需要认证的路径白名单
PUBLIC_PATHS = {
    "/api/health",
    "/api/auth/login",
    "/api/auth/token",
    "/api/docs",
    "/api/openapi.json",
    "/api/redoc",
}


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """用户登录，获取 JWT token"""
    # 简单的硬编码验证（生产环境应对接数据库）
    valid_users = {
        "admin": "admin123",
        "operator": "op2024",
    }
    if req.username not in valid_users or valid_users[req.username] != req.password:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({"sub": req.username, "role": "admin" if req.username == "admin" else "operator"})
    return TokenResponse(access_token=token)


@router.get("/token", response_model=TokenResponse)
async def get_dev_token():
    """开发模式：直接获取一个测试 token（仅 DEBUG=true 时可用）"""
    if not settings.DEBUG:
        raise HTTPException(status_code=403, detail="仅开发模式可用")
    token = create_access_token({"sub": "dev", "role": "admin"})
    return TokenResponse(access_token=token)


@router.get("/verify")
async def verify_current_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """验证当前 token 是否有效"""
    if not credentials:
        raise HTTPException(status_code=401, detail="请提供 token")
    payload = verify_token(credentials.credentials)
    return {"status": "success", "user": payload.get("sub"), "role": payload.get("role")}


async def auth_middleware_dependency(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """认证中间件依赖 — 仅在非公开路径时验证 token"""
    path = request.url.path

    # 白名单路径不检查认证
    for public_path in PUBLIC_PATHS:
        if path.startswith(public_path):
            return

    # 开发模式下（DEBUG=true）如果没有提供 token，放行
    if settings.DEBUG and not credentials:
        return

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请提供认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

    verify_token(credentials.credentials)
