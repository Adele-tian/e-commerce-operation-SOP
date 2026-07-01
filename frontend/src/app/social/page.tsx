'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { Select } from '@/components/ui/Form'
import { apiFetch } from '@/lib/utils'
import {
  socialPlatforms as mockPlatforms,
  generatedSocialContent as mockContent,
  calendarEvents as mockEvents,
} from '@/lib/mock-data'

const platformColors: Record<string, string> = {
  xiaohongshu: 'bg-red-100 text-red-700',
  douyin: 'bg-slate-800 text-white',
  wechat: 'bg-green-100 text-green-700',
}

export default function SocialPage() {
  const [platforms, setPlatforms] = useState(mockPlatforms)
  const [platform, setPlatform] = useState('xiaohongshu')
  const [view, setView] = useState<'content' | 'calendar' | 'archive'>('content')
  const [content, setContent] = useState<Record<string, any>>(mockContent)
  const [events, setEvents] = useState(mockEvents)
  const [generating, setGenerating] = useState(false)
  const [goal, setGoal] = useState('engagement')
  const [tone, setTone] = useState('casual')

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      const [platData, calData] = await Promise.all([
        apiFetch('/api/social/platforms').catch(() => null),
        apiFetch('/api/social/calendar').catch(() => null),
      ])
      if (platData?.platforms?.length) setPlatforms(platData.platforms)
      if (calData?.events?.length) setEvents(calData.events)
    } catch {
      // fallback
    }
    // Load content for current platform
    try {
      const data = await apiFetch(`/api/social/content?platform=${platform}`)
      if (data.content?.length) {
        // API returns array, take first as current
        setContent((prev) => ({ ...prev, [platform]: data.content[0] }))
      }
    } catch {
      // use mock
    }
  }, [platform])

  useEffect(() => { loadData() }, [loadData])

  // Generate content
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await apiFetch('/api/social/generate', {
        method: 'POST',
        body: JSON.stringify({ platform, goal, tone }),
      })
      if (data.content) {
        setContent((prev) => ({ ...prev, [platform]: data.content }))
      }
    } catch {
      // keep mock
    } finally {
      setGenerating(false)
    }
  }

  // Mark as published
  const handlePublish = async (contentId: number) => {
    try {
      await apiFetch('/api/social/mark-published', {
        method: 'POST',
        body: JSON.stringify({ content_id: contentId }),
      })
      // Refresh events
      const calData = await apiFetch('/api/social/calendar')
      if (calData?.events) setEvents(calData.events)
    } catch {
      // silent
    }
  }

  const daysInMonth = 31
  const firstDay = 2
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.date)
      return d.getDate() === day && d.getMonth() === 6
    })
  }

  // Current platform content
  const c = content[platform] || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">社媒营销</h1>
          <p className="text-slate-500 mt-1">多平台协同内容分发</p>
        </div>
        <Button icon="✨" onClick={handleGenerate} loading={generating}>
          {generating ? 'AI生成中...' : 'AI生成内容'}
        </Button>
      </div>

      {/* Platform + View Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs tabs={platforms.map((p) => ({ id: p.id, label: p.label, icon: p.icon }))} activeTab={platform} onChange={setPlatform} />
        <Tabs tabs={[
          { id: 'content', label: '内容生成' },
          { id: 'calendar', label: '发布日历' },
          { id: 'archive', label: '已发布' },
        ]} activeTab={view} onChange={(v) => setView(v as typeof view)} />
      </div>

      {/* Content Generation View */}
      {view === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card title="生成设置" className="lg:col-span-3">
            <div className="space-y-4">
              <Select label="目标产品" options={[
                { value: '1', label: '涂抹面膜-补水保湿款' },
                { value: '2', label: '涂抹面膜-美白提亮款' },
              ]} />
              <Select label="内容目标" value={goal} onChange={(e) => setGoal(e.target.value)} options={[
                { value: 'awareness', label: '品牌曝光' },
                { value: 'conversion', label: '转化引导' },
                { value: 'engagement', label: '互动种草' },
              ]} />
              <Select label="语气风格" value={tone} onChange={(e) => setTone(e.target.value)} options={[
                { value: 'casual', label: '日常分享' },
                { value: 'professional', label: '专业测评' },
                { value: 'emotional', label: '情感共鸣' },
              ]} />
              <Button className="w-full" icon="✨" onClick={handleGenerate} loading={generating}>
                生成{platform === 'xiaohongshu' ? '小红书笔记' : platform === 'douyin' ? '抖音文案' : '朋友圈文案'}
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-9">
            {platform === 'xiaohongshu' && (
              <Card title="小红书笔记" action={
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">编辑</Button>
                  <Button variant="primary" size="sm" onClick={() => c.id && handlePublish(c.id)}>标记发布</Button>
                </div>
              }>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">{c.title || '点击"AI生成内容"开始'}</h3>
                  {c.body && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{c.body}</p>
                    </div>
                  )}
                  {c.tags && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">标签</p>
                      <div className="flex flex-wrap gap-2">
                        {c.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.image_tip && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs font-medium text-amber-700 mb-1">配图建议</p>
                      <p className="text-sm text-amber-600">{c.image_tip}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {platform === 'douyin' && (
              <Card title="抖音短视频文案" action={
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">编辑</Button>
                  <Button variant="primary" size="sm" onClick={() => c.id && handlePublish(c.id)}>标记发布</Button>
                </div>
              }>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">{c.title || '点击"AI生成内容"开始'}</h3>
                  {c.script && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">脚本流程</p>
                      <p className="text-sm text-slate-700">{c.script}</p>
                    </div>
                  )}
                  {c.body && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700 whitespace-pre-line">{c.body}</p>
                    </div>
                  )}
                  {c.tags && (
                    <div className="flex flex-wrap gap-2">
                      {c.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 text-white rounded-full text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {platform === 'wechat' && (
              <Card title="朋友圈文案" action={
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">编辑</Button>
                  <Button variant="primary" size="sm" onClick={() => c.id && handlePublish(c.id)}>标记发布</Button>
                </div>
              }>
                <div className="space-y-4">
                  {(c.copy || c.body) && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{c.copy || c.body}</p>
                    </div>
                  )}
                  {c.image_tip && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs font-medium text-amber-700 mb-1">配图建议</p>
                      <p className="text-sm text-amber-600">{c.image_tip}</p>
                    </div>
                  )}
                  {!c.copy && !c.body && (
                    <p className="text-center text-slate-400 py-8">点击"AI生成内容"开始创建朋友圈文案</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <Card title="2026年7月 内容日历" action={<Button variant="secondary" size="sm">添加排期</Button>}>
          <div className="grid grid-cols-7 gap-1">
            {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : []
              return (
                <div key={i} className={`min-h-[80px] rounded-lg border p-1.5 ${day ? 'border-slate-200 bg-white' : 'border-transparent bg-slate-50'}`}>
                  {day && (
                    <>
                      <span className="text-xs font-medium text-slate-600">{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((e, j) => (
                          <div key={j} className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${platformColors[e.platform] || 'bg-slate-100 text-slate-600'}`}>
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Archive View */}
      {view === 'archive' && (
        <Card title="已发布内容归档">
          <div className="space-y-3">
            {events.filter((e) => e.status === 'published').map((e, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-primary-200 transition-colors">
                <span className={`px-2 py-1 rounded text-xs font-medium ${platformColors[e.platform] || ''}`}>
                  {e.platform === 'xiaohongshu' ? '小红书' : e.platform === 'douyin' ? '抖音' : '朋友圈'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{e.title}</p>
                  <p className="text-xs text-slate-500">{e.date}</p>
                </div>
                <Badge variant="success">已发布</Badge>
                <Button variant="ghost" size="sm">查看</Button>
              </div>
            ))}
            {events.filter((e) => e.status === 'published').length === 0 && (
              <p className="text-center text-slate-400 py-8">暂无已发布内容</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
