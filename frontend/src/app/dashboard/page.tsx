'use client'

import { useState, useEffect } from 'react'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { apiFetch } from '@/lib/utils'
import Link from 'next/link'

const activityIcons: Record<string, string> = {
  keyword: '🔑', image: '🖼️', competitor: '📊', content: '📄', social: '📱', video: '🎬',
}

interface Stats {
  totalProducts: number
  totalKeywords: number
  pendingReview: number
  monthlyGenerated: number
}

interface TrendPoint {
  date: string
  impressions: number
  clicks: number
  conversions: number
}

interface Activity {
  id: number
  type: string
  text: string
  time: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalKeywords: 0, pendingReview: 0, monthlyGenerated: 0 })
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    apiFetch('/api/dashboard/overview').then((d) => d.stats && setStats(d.stats)).catch(() => {})
    apiFetch('/api/dashboard/trend').then((d) => d.trend && setTrend(d.trend)).catch(() => {})
    apiFetch('/api/dashboard/activities').then((d) => d.activities && setActivities(d.activities)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">总览面板</h1>
        <p className="text-slate-500 mt-1">项目总览，显示所有产品状态和关键指标</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="总产品数" value={stats.totalProducts} change={8} icon="📦" color="primary" />
        <StatCard label="关键词数" value={stats.totalKeywords} change={15} icon="🔑" color="green" />
        <StatCard label="待审核内容" value={stats.pendingReview} change={-20} icon="⏳" color="orange" />
        <StatCard label="本月生成量" value={stats.monthlyGenerated} change={23} icon="✨" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card title="运营趋势" subtitle="最近30天数据" className="lg:col-span-2" action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">7天</Button>
            <Button variant="secondary" size="sm">30天</Button>
          </div>
        }>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend />
              <Line type="monotone" dataKey="impressions" name="曝光量" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" name="点击量" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="conversions" name="转化数" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card title="快速操作">
          <div className="space-y-3">
            {[
              { label: '蓝海扫描', desc: '发现市场新机会', href: '/market', icon: '🔍' },
              { label: '采集关键词', desc: '扩展搜索词库', href: '/keywords', icon: '🔑' },
              { label: '竞品分析', desc: '研究竞品评价', href: '/competitors', icon: '📊' },
              { label: '社媒发布', desc: '多平台分发', href: '/social', icon: '📱' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-primary-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <span className="text-slate-400 group-hover:text-primary-500">→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card title="最近活动" action={<Button variant="ghost" size="sm">查看全部</Button>}>
        <div className="space-y-1">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <span className="text-base">{activityIcons[activity.type] || '📌'}</span>
              <p className="flex-1 text-sm text-slate-700">{activity.text}</p>
              <Badge variant="default">{activity.time}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
