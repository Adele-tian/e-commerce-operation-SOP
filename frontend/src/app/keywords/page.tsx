'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Form'
import { Tabs } from '@/components/ui/Tabs'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, PieChart, Pie, Cell } from 'recharts'
import { keywordsList as mockKeywords, keywordCategoryStats as mockStats } from '@/lib/mock-data'
import { apiFetch } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const categoryColors: Record<string, string> = {
  '功能': 'info', '场景': 'success', '人群': 'purple', '品牌': 'warning',
}
const categoryTabs = [
  { id: 'all', label: '全部' },
  { id: '功能', label: '功能需求' },
  { id: '场景', label: '场景需求' },
  { id: '人群', label: '人群需求' },
  { id: '品牌', label: '品牌需求' },
]
const pieColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

type SortKey = 'searchVolume' | 'competition' | 'potential'
type SortDir = 'asc' | 'desc'

interface Keyword {
  id: number
  keyword: string
  searchVolume: number
  competition: number
  potential: number
  category: string
  source: string
}

// 将 API 返回格式转为前端格式
function mapApiKeyword(k: Record<string, unknown>): Keyword {
  return {
    id: k.id as number,
    keyword: k.keyword as string,
    searchVolume: (k.search_volume as number) || 0,
    competition: (k.competition_level as number) || 0,
    potential: (k.potential_score as number) || 0,
    category: (k.category as string) || '功能',
    source: (k.source as string) || '',
  }
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('searchVolume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [collecting, setCollecting] = useState(false)

  // 尝试从 API 加载关键词
  useEffect(() => {
    apiFetch('/api/keywords/list')
      .then((data) => {
        if (data.keywords && data.keywords.length > 0) {
          setKeywords(data.keywords.map(mapApiKeyword))
        }
      })
      .catch(() => {}) // 失败则使用 mock 数据
  }, [])

  const filtered = useMemo(() => {
    let list = keywords
    if (category !== 'all') list = list.filter((k) => k.category === category)
    if (search) list = list.filter((k) => k.keyword.includes(search))
    return [...list].sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey])
  }, [keywords, search, category, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''
  const selected = keywords.find((k) => k.id === selectedId)

  const bubbleData = keywords.map((k) => ({
    x: k.competition, y: k.potential, z: k.searchVolume / 100, name: k.keyword,
  }))

  // 分类统计
  const catStats = useMemo(() => {
    const map: Record<string, number> = {}
    keywords.forEach((k) => { map[k.category] = (map[k.category] || 0) + 1 })
    return Object.entries(map).map(([cat, count]) => ({ category: cat + '需求', count, percent: Math.round(count / keywords.length * 100) }))
  }, [keywords])

  const pieData = catStats.length > 0 ? catStats : mockStats

  const handleExport = () => {
    window.open(`${API_BASE}/api/keywords/export`, '_blank')
  }

  const handleCollect = async () => {
    setCollecting(true)
    try {
      await apiFetch('/api/keywords/collect', {
        method: 'POST',
        body: JSON.stringify({ seed_keyword: '涂抹面膜' }),
      })
      // 重新加载
      const data = await apiFetch('/api/keywords/list')
      if (data.keywords) setKeywords(data.keywords.map(mapApiKeyword))
    } catch {
      alert('关键词采集需要数据库支持，当前使用 mock 数据')
    } finally {
      setCollecting(false)
    }
  }

  const handleClassify = async (kwId: number) => {
    try {
      await apiFetch('/api/keywords/analyze', {
        method: 'POST',
        body: JSON.stringify({ keyword_ids: [kwId] }),
      })
    } catch {
      // mock fallback - do nothing
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">关键词分析</h1>
          <p className="text-slate-500 mt-1">挖掘搜索需求，布局关键词策略</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="🔑" onClick={handleCollect} loading={collecting}>
            {collecting ? '采集中...' : '采集关键词'}
          </Button>
          <Button icon="📤" onClick={handleExport}>导出Excel</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Input placeholder="搜索关键词..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Tabs tabs={categoryTabs} activeTab={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 font-medium text-slate-600">关键词</th>
                  <th className="pb-3 font-medium text-slate-600 cursor-pointer hover:text-primary-600" onClick={() => toggleSort('searchVolume')}>搜索量{sortIcon('searchVolume')}</th>
                  <th className="pb-3 font-medium text-slate-600 cursor-pointer hover:text-primary-600" onClick={() => toggleSort('competition')}>竞争度{sortIcon('competition')}</th>
                  <th className="pb-3 font-medium text-slate-600 cursor-pointer hover:text-primary-600" onClick={() => toggleSort('potential')}>潜力评分{sortIcon('potential')}</th>
                  <th className="pb-3 font-medium text-slate-600">分类</th>
                  <th className="pb-3 font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kw) => (
                  <tr key={kw.id}
                    className={`border-b border-slate-50 cursor-pointer hover:bg-primary-50/30 transition-colors ${selectedId === kw.id ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedId(kw.id)}>
                    <td className="py-3 font-medium text-slate-800">{kw.keyword}</td>
                    <td className="py-3 text-slate-600">{kw.searchVolume.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-orange-400" style={{ width: `${kw.competition * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{(kw.competition * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`font-medium ${kw.potential >= 85 ? 'text-emerald-600' : kw.potential >= 70 ? 'text-blue-600' : 'text-slate-600'}`}>{kw.potential}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={categoryColors[kw.category] as 'info' | 'success' | 'purple' | 'warning'}>{kw.category}</Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClassify(kw.id) }}>AI分类</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>共 {filtered.length} 条关键词</span>
            <div className="flex gap-1">
              <Button variant="secondary" size="sm">批量分类</Button>
              <Button variant="secondary" size="sm" onClick={handleExport}>批量导出</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="关键词详情">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{selected.keyword}</h3>
                  <Badge variant={categoryColors[selected.category] as 'info' | 'success' | 'purple' | 'warning'} className="mt-1">{selected.category}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">搜索量</p><p className="font-semibold text-slate-800">{selected.searchVolume.toLocaleString()}</p></div>
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">竞争度</p><p className="font-semibold text-slate-800">{(selected.competition * 100).toFixed(0)}%</p></div>
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">潜力评分</p><p className="font-semibold text-emerald-600">{selected.potential}</p></div>
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">来源</p><p className="font-semibold text-slate-800">{selected.source}</p></div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-1">AI 建议</p>
                  <p className="text-sm text-blue-600">
                    该词竞争度{selected.competition > 0.6 ? '较高' : '适中'}，潜力评分{selected.potential >= 85 ? '优秀' : '良好'}。
                    {selected.potential >= 85 ? '建议重点布局，作为核心关键词。' : '可作为辅助长尾词使用。'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">点击关键词查看详情</p>
            )}
          </Card>

          <Card title="需求分布">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
                  {pieData.map((_: unknown, i: number) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <Card title="关键词气泡图" subtitle="X轴:竞争度 | Y轴:潜力评分 | 气泡大小:搜索量">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="x" name="竞争度" type="number" domain={[0, 1]} tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: '竞争度', position: 'insideBottom', offset: -5, fontSize: 11 }} />
            <YAxis dataKey="y" name="潜力评分" type="number" domain={[30, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: '潜力评分', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <ZAxis dataKey="z" range={[40, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-slate-500">竞争度: {(d.x * 100).toFixed(0)}%</p>
                  <p className="text-slate-500">潜力: {d.y}</p>
                </div>
              )
            }} />
            <Scatter data={bubbleData} fill="#3b82f6" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
