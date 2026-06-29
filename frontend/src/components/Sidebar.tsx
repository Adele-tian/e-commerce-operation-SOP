'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: '总览', href: '/', icon: '🏠' },
  { label: '蓝海探测', href: '/market', icon: '🔍' },
  { label: '关键词分析', href: '/keywords', icon: '🔑' },
  { label: '竞品评价', href: '/competitors', icon: '📊' },
  { label: '主图生成', href: '/images', icon: '🖼️' },
  { label: '详情页', href: '/detail-page', icon: '📄' },
  { label: '买家秀', href: '/buyer-show', icon: '👤' },
  { label: '短视频', href: '/video', icon: '🎬' },
  { label: '社媒营销', href: '/social', icon: '📱' },
  { label: '数据监控', href: '/analytics', icon: '📈' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-slate-800 text-slate-300 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">淘宝SOP工具</h1>
        <p className="text-xs text-slate-400 mt-0.5">涂抹面膜运营系统</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white border-r-2 border-primary-400'
                  : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-700 text-xs text-slate-500">
        钟永发店铺 v0.1.0
      </div>
    </aside>
  )
}
