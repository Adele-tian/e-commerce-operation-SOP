'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { apiFetch } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { analyticsKPI as mockKPI, analyticsTrend as mockTrend, contentABTest as mockAB, alerts as mockAlerts } from '@/lib/mock-data'

const alertColors: Record<string, { bg: string; text: string; border: string }> = {
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  danger: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('day')
  const [kpi, setKpi] = useState(mockKPI)
  const [trendData, setTrendData] = useState(mockTrend)
  const [abTest, setAbTest] = useState(mockAB)
  const [alertsList, setAlerts] = useState(mockAlerts)
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      const [overviewData, trendResp, abData, alertData] = await Promise.all([
        apiFetch('/api/analytics/overview').catch(() => null),
        apiFetch(`/api/analytics/trend?period=${period}`).catch(() => null),
        apiFetch('/api/analytics/ab-test').catch(() => null),
        apiFetch('/api/analytics/alerts').catch(() => null),
      ])
      if (overviewData?.kpi?.length) setKpi(overviewData.kpi)
      if (trendResp?.data?.length) setTrendData(trendResp.data)
      if (abData?.results?.length) setAbTest(abData.results)
      if (alertData?.alerts?.length) setAlerts(alertData.alerts)
    } catch {
      // fallback to mock
    }
  }, [period])

  useEffect(() => { loadData() }, [loadData])

  // Generate report
  const handleReport = async (type: 'weekly' | 'monthly' | 'custom') => {
    setReportLoading(true)
    setReport(null)
    try {
      const data = await apiFetch(`/api/analytics/report?report_type=${type}`, { method: 'POST' })
      setReport(data.report || '报告生成失败')
    } catch {
      setReport('[AI模拟响应] 未配置 QWEN_API_KEY，请设置环境变量后重试。')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">数据监控</h1>
          <p className="text-slate-500 mt-1">追踪运营效果，持续优化</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="📊" onClick={() => handleReport('weekly')} loading={reportLoading}>生成周报</Button>
          <Button icon="📋" onClick={() => handleReport('monthly')} loading={reportLoading}>生成月报</Button>
        </div>
      </div>

      {/* Report Modal */}
      {report && (
        <Card title="AI 分析报告" action={<Button variant="ghost" size="sm" onClick={() => setReport(null)}>关闭</Button>}>
          <div className="p-4 bg-slate-50 rounded-lg max-h-80 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{report}</pre>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} change={item.change} icon={item.icon} color={item.color} />
        ))}
      </div>

      {/* Trend Chart */}
      <Card title="运营趋势" action={
        <Tabs tabs={[
          { id: 'day', label: '日' },
          { id: 'week', label: '周' },
          { id: 'month', label: '月' },
        ]} activeTab={period} onChange={setPeriod} />
      }>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend />
            <Line type="monotone" dataKey="impressions" name="曝光量" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ctr" name="点击率(%)" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="conversionRate" name="转化率(%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="positiveRate" name="好评率(%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A/B Test Results */}
        <Card title="内容效果对比" subtitle="A/B测试结果">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-2 font-medium text-slate-600">内容版本</th>
                  <th className="pb-2 font-medium text-slate-600">类型</th>
                  <th className="pb-2 font-medium text-slate-600">点击率</th>
                  <th className="pb-2 font-medium text-slate-600">转化率</th>
                  <th className="pb-2 font-medium text-slate-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {abTest.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{item.name}</td>
                    <td className="py-2.5 text-slate-600">{item.type}</td>
                    <td className="py-2.5">{item.ctr > 0 ? `${item.ctr}%` : '-'}</td>
                    <td className="py-2.5 font-medium text-emerald-600">{item.cvr}%</td>
                    <td className="py-2.5">
                      <Badge variant={item.status.includes('胜出') ? 'success' : 'default'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Alerts */}
        <Card title="异常告警" action={<Badge variant="danger">{alertsList.length} 条</Badge>}>
          <div className="space-y-3">
            {alertsList.map((alert) => {
              const colors = alertColors[alert.type] || alertColors.info
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <h4 className={`text-sm font-semibold ${colors.text}`}>{alert.title}</h4>
                    </div>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 ml-7 mb-2">{alert.desc}</p>
                  <div className="ml-7">
                    <Button variant="ghost" size="sm" className="text-xs">{alert.action} →</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Report Generation */}
      <Card title="报告生成">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg border border-slate-200 text-center hover:border-primary-300 transition-colors cursor-pointer group">
            <span className="text-3xl block mb-2">📊</span>
            <h4 className="font-semibold text-slate-800 group-hover:text-primary-700">周报</h4>
            <p className="text-xs text-slate-500 mt-1">本周运营数据总结 + 优化建议</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => handleReport('weekly')} loading={reportLoading}>生成周报</Button>
          </div>
          <div className="p-5 rounded-lg border border-slate-200 text-center hover:border-primary-300 transition-colors cursor-pointer group">
            <span className="text-3xl block mb-2">📈</span>
            <h4 className="font-semibold text-slate-800 group-hover:text-primary-700">月报</h4>
            <p className="text-xs text-slate-500 mt-1">月度运营分析 + 趋势洞察 + 策略调整</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => handleReport('monthly')} loading={reportLoading}>生成月报</Button>
          </div>
          <div className="p-5 rounded-lg border border-slate-200 text-center hover:border-primary-300 transition-colors cursor-pointer group">
            <span className="text-3xl block mb-2">🔍</span>
            <h4 className="font-semibold text-slate-800 group-hover:text-primary-700">专项分析</h4>
            <p className="text-xs text-slate-500 mt-1">针对特定内容或指标的深入分析</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => handleReport('custom')} loading={reportLoading}>开始分析</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
