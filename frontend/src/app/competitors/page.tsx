'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { apiFetch } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const sentimentColors = ['#3b82f6', '#f59e0b', '#ef4444']
const filterTabs = [
  { id: 'all', label: '全部' },
  { id: 'positive', label: '好评' },
  { id: 'negative', label: '差评' },
  { id: 'image', label: '有图' },
]
const sectionTabs = [
  { id: 'overview', label: '评价概览' },
  { id: 'needs', label: '需求分析' },
  { id: 'details', label: '评价明细' },
  { id: 'suggestions', label: '优化建议' },
]

interface Competitor {
  id: number
  name: string
  price: number
  review_count: number
  rating: number
  store: string
}

interface Analysis {
  sentiment: { positive: number; neutral: number; negative: number }
  review_trend: { month: string; count: number }[]
  needs_top10: { need: string; percent: number; count: number; color: string }[]
  dimensions: { dimension: string; count: number; percent: string; interpretation: string }[]
  pain_points: { id: number; text: string; frequency: number; intensity: number }[]
  positive_points: { id: number; text: string; frequency: number }[]
  keywords: { word: string; count: number; sentiment: string }[]
  needs_summary: { rank: number; title: string; percent: string; desc: string; quote: string }[]
  optimization_suggestions: string[]
  review_details: { id: number; content: string; sku: string; needs: string; persona: string; scene: string; sentiment: string }[]
  analysis_date: string
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [selectedComp, setSelectedComp] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('overview')

  // 加载竞品列表
  useEffect(() => {
    apiFetch('/api/competitors')
      .then((data) => setCompetitors(data.competitors || []))
      .catch(() => setCompetitors([]))
  }, [])

  // 加载竞品分析
  const loadAnalysis = useCallback(async (compId: number) => {
    setLoading(true)
    try {
      const data = await apiFetch(`/api/competitors/${compId}/analysis`)
      setAnalysis(data.analysis)
    } catch {
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const comp = competitors.find((c) => c.id === selectedComp)

  const handleSelectComp = (id: number) => {
    setSelectedComp(id)
    setActiveSection('overview')
    loadAnalysis(id)
  }

  const handleExport = () => {
    if (selectedComp) {
      window.open(`${API_BASE}/api/competitors/${selectedComp}/export`, '_blank')
    }
  }

  // 衍生数据
  const sentimentPie = analysis
    ? [
        { name: '好评', value: analysis.sentiment.positive },
        { name: '中评', value: analysis.sentiment.neutral },
        { name: '差评', value: analysis.sentiment.negative },
      ]
    : []

  const filteredKeywords = analysis
    ? filter === 'all' ? analysis.keywords
      : filter === 'positive' ? analysis.keywords.filter((k) => k.sentiment === 'positive')
      : filter === 'negative' ? analysis.keywords.filter((k) => k.sentiment === 'negative')
      : analysis.keywords
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">竞品评价分析</h1>
          <p className="text-slate-500 mt-1">研究竞品评价，提取用户需求与痛点洞察</p>
        </div>
        <Button icon="🔄" onClick={() => { setSelectedComp(null); setAnalysis(null); }}>刷新数据</Button>
      </div>

      {/* Competitor Cards */}
      {!selectedComp && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((c) => (
            <div key={c.id}
              onClick={() => handleSelectComp(c.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                  🧴
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 truncate">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.store}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-primary-600">¥{c.price}</span>
                    <span className="text-xs text-slate-400">{c.review_count.toLocaleString()} 条评价</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-sm">{'★'.repeat(Math.floor(c.rating))}</span>
                    <span className="text-xs text-slate-500">{c.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {competitors.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">加载中...</div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-3" />
            <p className="text-slate-500">正在分析竞品评价数据...</p>
          </div>
        </div>
      )}

      {/* Analysis Detail */}
      {comp && analysis && !loading && (
        <>
          {/* Report Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedComp(null); setAnalysis(null) }}>← 返回列表</Button>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">评价分析报告【{comp.name}】</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{comp.store} · ¥{comp.price} · 分析时间: {analysis.analysis_date?.slice(0, 19).replace('T', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{comp.review_count.toLocaleString()} 条评价</Badge>
                <Button variant="ghost" size="sm" onClick={handleExport}>📥 导出报告</Button>
              </div>
            </div>
          </div>

          {/* Section 1: 总体评价 */}
          <Card title="一、总体评价" subtitle={`该商品总体用户满意度：好评率达${analysis.sentiment.positive}%，好/差评主要集中在补水效果、质地肤感、使用效果、温和度及性价比等方面。`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">评价分布</h4>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={sentimentPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80} startAngle={90} endAngle={-270}>
                        {sentimentPie.map((_, i) => <Cell key={i} fill={sentimentColors[i]} />)}
                      </Pie>
                      <Tooltip formatter={(val) => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {sentimentPie.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: sentimentColors[i] }} />
                        <span className="text-sm text-slate-600 w-8">{s.name}</span>
                        <span className="text-sm font-bold text-slate-800">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">评价趋势</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analysis.review_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="累计评价数" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Tabs tabs={sectionTabs} activeTab={activeSection} onChange={setActiveSection} />

          {/* Section 2: 评价概览 */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="用户需求分析 TOP10" subtitle="按评价提及频率排序的核心需求维度">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={analysis.needs_top10} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="need" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Bar dataKey="percent" name="占比" radius={[0, 4, 4, 0]} barSize={20}>
                        {analysis.needs_top10.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="高频关键词" className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Tabs tabs={filterTabs} activeTab={filter} onChange={setFilter} className="w-fit" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredKeywords.map((kw) => {
                      const size = Math.max(12, Math.min(28, kw.count / 100))
                      return (
                        <span key={kw.word}
                          className={`inline-block px-2.5 py-1 rounded-lg transition-colors cursor-default ${kw.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                          style={{ fontSize: `${size}px` }}
                          title={`出现 ${kw.count} 次`}>
                          {kw.word}
                        </span>
                      )
                    })}
                  </div>
                </Card>
              </div>

              <Card title="关注维度解读">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 w-28">关注点</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700 w-20">维度数量</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700 w-24">重要度占比</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">维度解读</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.dimensions.map((d, i) => (
                        <tr key={d.dimension} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                          <td className="py-3 px-4"><span className="font-medium text-primary-600">{d.dimension}</span></td>
                          <td className="py-3 px-4 text-center text-slate-600">{d.count}</td>
                          <td className="py-3 px-4 text-center"><Badge variant="info">{d.percent}</Badge></td>
                          <td className="py-3 px-4 text-slate-600 leading-relaxed">{d.interpretation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="痛点排序" subtitle="按出现频率和情感强度排序">
                  <div className="space-y-3">
                    {analysis.pain_points.map((p, i) => (
                      <div key={p.id} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">{p.text}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-slate-500">出现 {p.frequency} 次</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-red-400" style={{ width: `${p.intensity * 100}%` }} />
                            </div>
                            <span className="text-xs text-red-500 font-medium">强度 {(p.intensity * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="好评点排序">
                  <div className="space-y-3">
                    {analysis.positive_points.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="flex-1 text-sm text-slate-800">{p.text}</p>
                        <Badge variant="success">{p.frequency} 次</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Section 3: 用户需求分析总结 */}
          {activeSection === 'needs' && (
            <Card title="用户需求分析总结" subtitle="基于评价数据的核心用户诉求，含典型用户评论摘录">
              <div className="space-y-5">
                {analysis.needs_summary.map((item) => (
                  <div key={item.rank} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">{item.rank}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{item.title}</h4>
                          <Badge variant="info">占比{item.percent}</Badge>
                          {item.rank <= 2 && <Badge variant="warning">核心需求</Badge>}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                        <div className="mt-2 p-2.5 bg-white rounded-lg border-l-3 border-l-primary-400 border border-slate-100">
                          <p className="text-xs text-slate-500 italic">💬 典型评论：{item.quote}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Section 4: 评价明细 */}
          {activeSection === 'details' && (
            <Card title="评价明细" subtitle="抽样展示真实评价记录，含用户需求、人群画像、场景维度分析"
              action={<Button variant="ghost" size="sm" onClick={handleExport}>📥 导出Excel</Button>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 w-[280px]">评价内容</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 w-[140px]">SKU名称</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 w-[150px]">用户需求</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-700 w-[110px]">人群画像</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-700 w-[100px]">场景维度</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-700 w-[80px]">情绪</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.review_details.map((r, i) => (
                      <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="py-3 px-3 text-slate-700 leading-relaxed">{r.content}</td>
                        <td className="py-3 px-3 text-slate-500 text-xs">{r.sku}</td>
                        <td className="py-3 px-3"><span className="text-xs text-primary-600">{r.needs}</span></td>
                        <td className="py-3 px-3 text-center text-xs text-slate-500">{r.persona}</td>
                        <td className="py-3 px-3 text-center text-xs text-slate-500">{r.scene}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={r.sentiment === '正面' ? 'success' : 'danger'}>{r.sentiment}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Section 5: 优化建议 */}
          {activeSection === 'suggestions' && (
            <Card title="AI 产品优化建议" subtitle="基于评价数据分析，为产品优化和营销策略提供方向性建议"
              action={<Button variant="ghost" size="sm">🔄 重新生成</Button>}>
              <div className="space-y-3">
                {analysis.optimization_suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
