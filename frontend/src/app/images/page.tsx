'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea, Input, Select } from '@/components/ui/Form'
import { Tabs } from '@/components/ui/Tabs'
import { generatedImages as mockImages } from '@/lib/mock-data'
import { apiFetch } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
  draft: { label: '草稿', variant: 'default' },
  pending_review: { label: '待审核', variant: 'warning' },
  approved: { label: '已通过', variant: 'success' },
  published: { label: '已发布', variant: 'info' },
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

interface Brief {
  composition: string
  color_scheme: string
  copy_text: string
  selling_points: string[]
}

interface ImageItem {
  id: number
  version: string
  status: string
  score: number
  notes: string
}

interface DesignElement {
  style: string
  count: number
  percent: number
}

interface SearchAnalysis {
  keyword: string
  top_n: number
  design_elements: {
    composition: DesignElement[]
    color_schemes: DesignElement[]
    copy_styles: DesignElement[]
  }
  high_ctr_features: string[]
  differentiation_suggestions: string[]
}

export default function ImagesPage() {
  // === 主图生成 ===
  const [brief, setBrief] = useState<Brief>({ composition: '', color_scheme: '', copy_text: '', selling_points: [] })
  const [images, setImages] = useState<ImageItem[]>(mockImages)
  const [selectedImg, setSelectedImg] = useState<ImageItem | null>(null)
  const [generating, setGenerating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  // === 竞品主图分析 ===
  const [analysisKeyword, setAnalysisKeyword] = useState('涂抹面膜')
  const [analysisTopN, setAnalysisTopN] = useState('20')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SearchAnalysis | null>(null)

  // 加载默认 Brief 和图片列表
  useEffect(() => {
    apiFetch('/api/images/brief/default')
      .then((d) => {
        if (d.brief) {
          setBrief({
            composition: d.brief.composition || '',
            color_scheme: d.brief.color_scheme || '',
            copy_text: d.brief.copy_text || '',
            selling_points: d.brief.selling_points || [],
          })
        }
      })
      .catch(() => {
        setBrief({ composition: '产品居中45°俯拍，背景渐变浅蓝到白', color_scheme: '主色调浅蓝+白色', copy_text: '涂抹面膜 补水保湿 72小时持久水润', selling_points: ['72小时持久保湿', '敏感肌适用', '免洗配方', '专利成分'] })
      })
    apiFetch('/api/images/list')
      .then((d) => d.images && setImages(d.images))
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await apiFetch('/api/images/generate', {
        method: 'POST',
        body: JSON.stringify({ brief, count: 3 }),
      })
      if (res.images) setImages((prev) => [...prev, ...res.images])
    } catch {
      const newId = images.length + 10
      setImages((prev) => [...prev, ...Array.from({ length: 3 }, (_, i) => ({
        id: newId + i, version: `V3-${String.fromCharCode(65 + i)}`, status: 'draft', score: 3.5 + i * 0.3, notes: '',
      }))])
    } finally {
      setGenerating(false)
    }
  }

  const handleReview = async (action: string) => {
    if (!selectedImg) return
    try {
      const res = await apiFetch('/api/images/review', {
        method: 'POST',
        body: JSON.stringify({ image_id: selectedImg.id, action, notes: reviewNotes }),
      })
      if (res.image) {
        setImages((prev) => prev.map((img) => img.id === res.image.id ? res.image : img))
        setSelectedImg(res.image)
      }
    } catch {
      const updated = { ...selectedImg, status: action === 'approve' ? 'approved' : 'draft', notes: reviewNotes || selectedImg.notes }
      setImages((prev) => prev.map((img) => img.id === selectedImg.id ? updated : img))
      setSelectedImg(updated)
    }
  }

  const handleSearchAnalysis = async () => {
    setAnalyzing(true)
    try {
      const res = await apiFetch(`/api/images/search-analysis?keyword=${encodeURIComponent(analysisKeyword)}&top_n=${analysisTopN}`, { method: 'POST' })
      if (res.analysis) setAnalysis(res.analysis)
    } catch {
      // fallback mock
      setAnalysis({
        keyword: analysisKeyword, top_n: parseInt(analysisTopN),
        design_elements: {
          composition: [{ style: '产品居中', count: 12, percent: 60 }, { style: '左图右文', count: 5, percent: 25 }, { style: '全背景', count: 3, percent: 15 }],
          color_schemes: [{ style: '蓝白渐变', count: 8, percent: 40 }, { style: '白色简约', count: 5, percent: 25 }, { style: '绿色自然', count: 4, percent: 20 }, { style: '粉色温柔', count: 3, percent: 15 }],
          copy_styles: [{ style: '大字标题+卖点', count: 14, percent: 70 }, { style: '小字描述型', count: 4, percent: 20 }, { style: '无文字纯产品', count: 2, percent: 10 }],
        },
        high_ctr_features: ['浅色背景（CTR 高于均值 23%）', '产品占图比 60%+（CTR 高于均值 18%）', '含价格信息（CTR 高于均值 15%）'],
        differentiation_suggestions: ['当前市场蓝白配色占主，建议尝试暖色系差异化', '多数主图缺少使用场景，可加入真人涂抹场景图', '文案同质化严重，可突出"72小时"数字记忆点', '建议增加产品成分可视化展示（如玻尿酸分子图示）'],
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const tabs = [
    { id: 'generate', label: '主图生成' },
    { id: 'analysis', label: '竞品主图分析' },
  ]

  const [activeTab, setActiveTab] = useState('generate')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">主图工作台</h1>
          <p className="text-slate-500 mt-1">AI智能生成与竞品分析</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========== Tab: 主图生成 ========== */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Brief Editor */}
          <Card title="设计Brief" className="lg:col-span-3">
            <div className="space-y-4">
              <Textarea label="构图方式" rows={3} value={brief.composition}
                onChange={(e) => setBrief({ ...brief, composition: e.target.value })} />
              <Textarea label="配色方案" rows={2} value={brief.color_scheme}
                onChange={(e) => setBrief({ ...brief, color_scheme: e.target.value })} />
              <Textarea label="文案内容" rows={2} value={brief.copy_text}
                onChange={(e) => setBrief({ ...brief, copy_text: e.target.value })} />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">卖点标签</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {brief.selling_points.map((sp, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                      {sp}
                      <button className="text-primary-400 hover:text-primary-600" onClick={() => setBrief({ ...brief, selling_points: brief.selling_points.filter((_, j) => j !== i) })}>x</button>
                    </span>
                  ))}
                </div>
                <Input placeholder="添加卖点..." onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                    setBrief({ ...brief, selling_points: [...brief.selling_points, (e.target as HTMLInputElement).value] })
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }} />
              </div>
            </div>
          </Card>

          {/* Center: Image Grid */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">生成结果 <span className="text-slate-400 font-normal">共 {images.length} 个版本</span></h3>
              <Button onClick={handleGenerate} loading={generating} icon="✨">
                {generating ? '生成中...' : '生成主图'}
              </Button>
            </div>
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id}
                    onClick={() => { setSelectedImg(img); setReviewNotes(img.notes || '') }}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all overflow-hidden group ${selectedImg?.id === img.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-slate-200 hover:border-primary-300'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl">&#128444;</span>
                        <p className="text-xs text-slate-500 mt-1">{img.version}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={statusMap[img.status]?.variant || 'default'} className="text-[10px]">{statusMap[img.status]?.label || img.status}</Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end">
                      <div className="w-full p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">{img.version}</p>
                        <p className="text-white/80 text-[10px]">评分: {img.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="版本对比">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.filter((i) => i.status === 'approved' || i.status === 'published').map((img) => (
                  <div key={img.id} className="shrink-0 w-40">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mb-2"><span className="text-3xl">&#128444;</span></div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">{img.version}</span>
                      <Badge variant={statusMap[img.status]?.variant || 'default'}>{statusMap[img.status]?.label || img.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Review Panel */}
          <Card title="审核面板" className="lg:col-span-3">
            {selectedImg ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center"><span className="text-5xl">&#128444;</span></div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-800">{selectedImg.version}</h4>
                    <Badge variant={statusMap[selectedImg.status]?.variant || 'default'}>{statusMap[selectedImg.status]?.label || selectedImg.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <span>评分:</span>
                    <span className="text-amber-400">{'★'.repeat(Math.floor(selectedImg.score))}</span>
                    <span className="text-slate-500">{selectedImg.score}</span>
                  </div>
                </div>
                <Textarea label="审核批注" rows={3} placeholder="输入审核意见..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="primary" size="sm" className="w-full" onClick={() => handleReview('approve')}>通过</Button>
                  <Button variant="danger" size="sm" className="w-full" onClick={() => handleReview('reject')}>打回</Button>
                </div>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleReview('regenerate')}>重新生成</Button>
                {selectedImg.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-1">历史记录</p>
                    <p className="text-sm text-slate-700">{selectedImg.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">选择一个版本进行审核</p>
            )}
          </Card>
        </div>
      )}

      {/* ========== Tab: 竞品主图分析 ========== */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* 分析输入 */}
          <Card title="分析参数">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input label="搜索关键词" value={analysisKeyword} onChange={(e) => setAnalysisKeyword(e.target.value)} />
              </div>
              <div className="w-32">
                <Select label="分析数量" value={analysisTopN} onChange={(e) => setAnalysisTopN(e.target.value)}
                  options={[{ value: '10', label: 'Top 10' }, { value: '20', label: 'Top 20' }, { value: '50', label: 'Top 50' }]} />
              </div>
              <Button onClick={handleSearchAnalysis} loading={analyzing} icon="📊">
                {analyzing ? '分析中...' : '开始分析'}
              </Button>
            </div>
          </Card>

          {analysis && (
            <>
              {/* 概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-600">{analysis.top_n}</p>
                    <p className="text-sm text-slate-500 mt-1">分析商品数</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{analysis.design_elements.composition.length}</p>
                    <p className="text-sm text-slate-500 mt-1">构图类型</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{analysis.design_elements.color_schemes.length}</p>
                    <p className="text-sm text-slate-500 mt-1">配色方案</p>
                  </div>
                </Card>
              </div>

              {/* 设计元素分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="构图方式分布">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analysis.design_elements.composition}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="style" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val) => [`${val}%`, '占比']} />
                      <Bar dataKey="percent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="配色方案分布">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={analysis.design_elements.color_schemes} dataKey="percent" nameKey="scheme"
                        cx="50%" cy="50%" outerRadius={90}>
                        {analysis.design_elements.color_schemes.map((_: unknown, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val}%`, '占比']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="文案风格分布">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analysis.design_elements.copy_styles}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="style" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val) => [`${val}%`, '占比']} />
                      <Bar dataKey="percent" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="高点击率特征">
                  <div className="space-y-3">
                    {analysis.high_ctr_features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                        <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <p className="text-sm text-slate-700">{feat}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* 差异化建议 */}
              <Card title="差异化设计建议 💡">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.differentiation_suggestions.map((sug, i) => (
                    <div key={i} className="p-4 border border-primary-100 bg-primary-50/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-sm font-bold">{i + 1}</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{sug}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="primary" icon="→" onClick={() => {
                    // 将建议应用到 Brief
                    setActiveTab('generate')
                    if (analysis.differentiation_suggestions.length > 0) {
                      setBrief(prev => ({
                        ...prev,
                        composition: analysis.differentiation_suggestions[0] || prev.composition,
                      }))
                    }
                  }}>
                    应用建议到 Brief
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
