'use client'

import { useState } from 'react'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Form'
import { ProgressBar } from '@/components/ui/Progress'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { competitionTrend, entryStrategies } from '@/lib/mock-data'
import { apiFetch } from '@/lib/utils'

const barColors = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-slate-500">蓝海评分</p>
      </div>
    </div>
  )
}

interface ScanResult {
  blue_ocean_score: number
  market_capacity: string
  avg_price: number
  total_products: number
  top_seller_share: number
  new_product_survival: number
  avg_sales: number
  price_distribution: { range: string; count: number; avgSales: number }[]
  report?: string
}

export default function MarketPage() {
  const [scanning, setScanning] = useState(false)
  const [keyword, setKeyword] = useState('涂抹面膜')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  const handleScan = async () => {
    setScanning(true)
    setError('')
    try {
      await apiFetch('/api/market/blue-ocean/scan', {
        method: 'POST',
        body: JSON.stringify({ keyword }),
      })
      const res = await apiFetch(`/api/market/blue-ocean/results?keyword=${encodeURIComponent(keyword)}`)
      if (res.status === 'success') {
        setResult(res.result)
      }
    } catch (e) {
      setError('扫描失败，请检查后端服务是否运行')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">蓝海探测</h1>
        <p className="text-slate-500 mt-1">发现市场机会，评估品类竞争度</p>
      </div>

      {/* Scan Control */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input label="品类关键词" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入品类关键词，如：涂抹面膜" />
          </div>
          <Button onClick={handleScan} loading={scanning} icon="🔍" className="w-full sm:w-auto">
            {scanning ? '扫描中...' : '开始蓝海扫描'}
          </Button>
        </div>
        {scanning && (
          <div className="mt-4">
            <ProgressBar value={65} label="正在采集和分析市场数据..." color="primary" />
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      {result && (
        <>
          {/* Market Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-center">
              <ScoreRing score={result.blue_ocean_score} />
            </div>
            <StatCard label="市场容量" value={result.market_capacity} icon="📈" color="green" />
            <StatCard label="平均价格" value={`¥${result.avg_price}`} icon="💰" color="orange" />
            <StatCard label="在售商品数" value={result.total_products.toLocaleString()} icon="📦" color="purple" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="价格带分布" subtitle="各价格区间商品数量">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={result.price_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: '价格(元)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="商品数量" radius={[4, 4, 0, 0]}>
                    {result.price_distribution.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="市场指标" subtitle="竞争分析概览">
              <div className="space-y-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">头部卖家销量占比</span>
                  <span className="text-sm font-semibold text-slate-800">{result.top_seller_share}%</span>
                </div>
                <ProgressBar value={result.top_seller_share} color={result.top_seller_share > 50 ? 'red' : 'green'} />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-slate-600">新品存活率</span>
                  <span className="text-sm font-semibold text-slate-800">{result.new_product_survival}%</span>
                </div>
                <ProgressBar value={result.new_product_survival} color={result.new_product_survival > 50 ? 'green' : 'orange'} />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-slate-600">平均月销量</span>
                  <span className="text-sm font-semibold text-slate-800">{result.avg_sales}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Report */}
          {result.report && (
            <Card title="AI 市场评估报告" action={<Button variant="ghost" size="sm" onClick={handleScan}>重新生成</Button>}>
              <div className="prose prose-sm max-w-none text-slate-700">
                {result.report.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.slice(3)}</h2>
                  if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-slate-800 mt-3 mb-1">{line.slice(4)}</h3>
                  if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>
                  if (/^\d+\./.test(line)) return <li key={i} className="ml-4 text-sm list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
                  if (line.trim()) return <p key={i} className="text-sm my-1">{line}</p>
                  return null
                })}
              </div>
            </Card>
          )}

          {/* Entry Strategies */}
          <Card title="建议入场策略">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entryStrategies.map((s, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{s.title}</h4>
                    <Badge variant={s.score >= 80 ? 'success' : 'warning'}>{s.score}分</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{s.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>难度:</span>
                    <Badge variant={s.difficulty === '较低' ? 'success' : 'warning'}>{s.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
