'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea, Select } from '@/components/ui/Form'
import { buyerShowTemplates as mockTemplates, generatedBuyerShows as mockShows } from '@/lib/mock-data'
import { apiFetch } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
  draft: { label: '草稿', variant: 'default' },
  pending_review: { label: '待审核', variant: 'warning' },
  approved: { label: '已通过', variant: 'success' },
  published: { label: '已发布', variant: 'info' },
}

interface BuyerShow {
  id: number
  template: string
  content: string
  tone_score: number
  image_tip: string
  status: string
}

interface Template {
  id: string
  name: string
  desc: string
  icon: string
}

export default function BuyerShowPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [shows, setShows] = useState<BuyerShow[]>(mockShows.map((s) => ({ ...s, tone_score: s.toneScore, image_tip: s.imageTip })))
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    apiFetch('/api/buyer-show/templates')
      .then((d) => d.templates && setTemplates(d.templates))
      .catch(() => {})
    apiFetch('/api/buyer-show/list')
      .then((d) => {
        if (d.shows) setShows(d.shows.map((s: Record<string, unknown>) => ({
          id: s.id, template: s.template, content: s.content,
          tone_score: s.tone_score || s.toneScore, image_tip: s.image_tip || s.imageTip, status: s.status,
        })))
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    const tpl = templates.find((t) => t.id === selectedTemplate)
    try {
      const res = await apiFetch('/api/buyer-show/generate', {
        method: 'POST',
        body: JSON.stringify({
          product_name: '涂抹面膜',
          template: tpl?.name || '使用体验型',
          tone: '真实自然',
          count: 3,
        }),
      })
      if (res.shows) setShows((prev) => [...prev, ...res.shows])
    } catch {
      // fallback
      const baseId = shows.length + 10
      setShows((prev) => [...prev, ...Array.from({ length: 3 }, (_, i) => ({
        id: baseId + i, template: tpl?.name || '使用体验型',
        content: `[模拟] ${tpl?.name || '使用体验型'}风格买家秀文案 #${baseId + i}`,
        tone_score: 4.0, image_tip: '产品实拍 + 使用场景 + 效果对比', status: 'draft',
      }))])
    } finally {
      setGenerating(false)
    }
  }

  const handleReview = async (showId: number, action: string) => {
    try {
      const res = await apiFetch('/api/buyer-show/review', {
        method: 'POST',
        body: JSON.stringify({ show_id: showId, action }),
      })
      if (res.show) setShows((prev) => prev.map((s) => s.id === res.show.id ? res.show : s))
    } catch {
      setShows((prev) => prev.map((s) => s.id === showId ? { ...s, status: action === 'approve' ? 'approved' : 'draft' } : s))
    }
  }

  const handleExport = () => {
    window.open(`${API_BASE}/api/buyer-show/export`, '_blank')
  }

  const startEdit = (id: number, content: string) => { setEditingId(id); setEditContent(content) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">买家秀生成</h1>
          <p className="text-slate-500 mt-1">制作真实自然的评价内容</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="📤" onClick={handleExport}>导出文案</Button>
          <Button onClick={handleGenerate} loading={generating} icon="✨">
            {generating ? '生成中...' : '批量生成'}
          </Button>
        </div>
      </div>

      <Card title="文案风格模板">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTemplate === t.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{t.icon}</span>
                <h4 className="font-semibold text-slate-800">{t.name}</h4>
              </div>
              <p className="text-sm text-slate-600">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card title="生成设置" className="lg:col-span-3">
          <div className="space-y-4">
            <Select label="目标产品" options={[
              { value: '1', label: '涂抹面膜-补水保湿款' },
              { value: '2', label: '涂抹面膜-美白提亮款' },
            ]} />
            <Select label="用户画像" options={[
              { value: 'young', label: '年轻女性 (18-25)' },
              { value: 'office', label: '职场女性 (25-35)' },
              { value: 'mom', label: '宝妈群体 (28-40)' },
            ]} />
            <Select label="语气风格" options={[
              { value: 'casual', label: '轻松随意' },
              { value: 'enthusiastic', label: '热情推荐' },
              { value: 'rational', label: '理性分析' },
            ]} />
            <Textarea label="特殊要求" rows={3} placeholder="如：提到换季敏感、加班熬夜等场景..." />
            <Select label="生成数量" options={[
              { value: '3', label: '3条' }, { value: '5', label: '5条' }, { value: '10', label: '10条' },
            ]} />
          </div>
        </Card>

        <div className="lg:col-span-6 space-y-4">
          <Card title="生成结果" subtitle={`共 ${shows.length} 条`}>
            <div className="space-y-4">
              {shows.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-slate-200 hover:border-primary-200 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple">{item.template}</Badge>
                      <Badge variant={statusMap[item.status]?.variant || 'default'}>{statusMap[item.status]?.label || item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">语气评分:</span>
                      <span className="text-sm font-semibold text-amber-500">{item.tone_score}</span>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <Textarea rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingId(null)}>保存</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.content}</p>
                  )}

                  <div className="p-2 bg-slate-50 rounded-lg mb-3">
                    <p className="text-xs font-medium text-slate-500 mb-0.5">配图建议</p>
                    <p className="text-xs text-slate-600">{item.image_tip}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(item.id, item.content)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleReview(item.id, 'approve')} className="text-emerald-600">通过</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="批量操作" className="lg:col-span-3">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-slate-800">{shows.length}</p>
              <p className="text-xs text-slate-500 mt-1">已生成文案</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-emerald-600">{shows.filter((s) => s.status === 'approved').length}</p>
              <p className="text-xs text-slate-500 mt-1">已通过</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-500">{shows.filter((s) => s.status === 'pending_review').length}</p>
              <p className="text-xs text-slate-500 mt-1">待审核</p>
            </div>
            <div className="space-y-2 pt-2">
              <Button variant="primary" size="sm" className="w-full">全部通过</Button>
              <Button variant="secondary" size="sm" className="w-full" onClick={handleExport}>导出Excel</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
