import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiFetch(path: string, options?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // 自动附加 JWT token（如果存在）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
  })

  if (!res.ok) {
    let detail = `API Error: ${res.status}`
    try {
      const errData = await res.json()
      if (errData.detail) detail = errData.detail
    } catch { /* ignore */ }
    throw new Error(detail)
  }

  return res.json()
}

/** 保存认证 token */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

/** 清除认证 token */
export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}
