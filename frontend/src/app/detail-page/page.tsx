'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea, Select } from '@/components/ui/Form'
import { detailPageBlocks as mockBlocks } from '@/lib/mock-data'
import { apiFetch } from '@/lib/utils'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const typeColors: Record<string, string> = {
  '冲击区': 'bg-red-100 text-red-700',
  '展示区': 'bg-blue-100 text-blue-700',
  '功效区': 'bg-emerald-100 text-emerald-700',
  '口碑区': 'bg-amber-100 text-amber-700',
  '引导区': 'bg-purple-100 text-purple-700',
}

const blockTypeOptions = [
  { value: '冲击区', label: '开场冲击区' },
  { value: '展示区', label: '产品展示区' },
  { value: '功效区', label: '功效证明区' },
  { value: '口碑区', label: '口碑背军区' },
  { value: '引导区', label: '购买引导区' },
]

interface Block {
  id: string
  type: string
  title: string
  content: string
  order: number
}

function SortableBlock({ block, isSelected, onClick }: { block: Block; isSelected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}>
      <button {...attributes} {...listeners} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
        ⠿
      </button>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[block.type] || 'bg-slate-100 text-slate-600'}`}>
        {block.type}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{block.title}</span>
      <span className="text-xs text-slate-400">#{block.order}</span>
    </div>
  )
}

export default function DetailPagePage() {
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks)
  const [selectedId, setSelectedId] = useState<string>(mockBlocks[0]?.id || '')
  const selected = blocks.find((b) => b.id === selectedId)
  const [reviewStatus, setReviewStatus] = useState('draft')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Load script from API
  const loadScript = useCallback(async () => {
    try {
      const data = await apiFetch('/api/detail-page/script')
      if (data.blocks?.length) {
        setBlocks(data.blocks)
        setSelectedId(data.blocks[0]?.id || '')
      }
      if (data.review_status) setReviewStatus(data.review_status)
    } catch {
      // fallback to mock data
    }
  }, [])

  useEffect(() => { loadScript() }, [loadScript])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const reordered = arrayMove(items, oldIndex, newIndex)
        return reordered.map((b, i) => ({ ...b, order: i + 1 }))
      })
    }
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((items) => items.map((b) => b.id === id ? { ...b, ...updates } : b))
  }

  // Generate script via AI
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await apiFetch('/api/detail-page/script/generate', {
        method: 'POST',
        body: JSON.stringify({ product_name: '涂抹面膜-补水保湿款' }),
      })
      if (data.blocks?.length) {
        setBlocks(data.blocks)
        setSelectedId(data.blocks[0]?.id || '')
      }
    } catch {
      // keep current blocks
    } finally {
      setGenerating(false)
    }
  }

  // Save blocks to backend
  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch('/api/detail-page/blocks/update', {
        method: 'POST',
        body: JSON.stringify({ blocks }),
      })
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  // Review action
  const handleReview = async (action: 'approve' | 'reject') => {
    try {
      const data = await apiFetch('/api/detail-page/review', {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      setReviewStatus(data.review_status || action === 'approve' ? 'approved' : 'draft')
    } catch {
      setReviewStatus(action === 'approve' ? 'approved' : 'draft')
    }
  }

  // Export
  const handleExport = async () => {
    try {
      await apiFetch('/api/detail-page/export')
      alert('详情页脚本已导出！')
    } catch {
      alert('导出失败，请稍后重试')
    }
  }

  const statusLabel: Record<string, string> = { draft: '草稿', approved: '已审核', published: '已发布' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">详情页生成</h1>
          <p className="text-slate-500 mt-1">打造高转化的商品详情页</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={reviewStatus === 'approved' ? 'success' : 'default'}>
            {statusLabel[reviewStatus] || reviewStatus}
          </Badge>
          <Button variant="secondary" icon="✨" onClick={handleGenerate} loading={generating}>
            {generating ? 'AI生成中...' : 'AI生成脚本'}
          </Button>
          <Button variant="secondary" icon="💾" onClick={handleSave} loading={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button icon="📥" onClick={handleExport}>导出图片包</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Block List with DnD */}
        <Card title="页面区块" subtitle="拖拽排序" className="lg:col-span-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <SortableBlock key={block.id} block={block} isSelected={selectedId === block.id}
                    onClick={() => setSelectedId(block.id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button variant="ghost" size="sm" className="w-full mt-3" icon="+" onClick={() => {
            const newId = `b${Date.now()}`
            setBlocks((prev) => [...prev, { id: newId, type: '展示区', title: '新区块', content: '在此输入内容', order: prev.length + 1 }])
            setSelectedId(newId)
          }}>添加区块</Button>
        </Card>

        {/* Center: Mobile Preview */}
        <Card title="手机预览" subtitle="375px 宽度模拟" className="lg:col-span-5">
          <div className="flex justify-center">
            <div className="w-[375px] bg-slate-900 rounded-[2rem] p-3 shadow-xl">
              <div className="bg-white rounded-[1.5rem] overflow-hidden">
                <div className="h-6 bg-white flex items-center justify-center">
                  <div className="w-20 h-4 bg-slate-900 rounded-b-xl" />
                </div>
                <div className="space-y-1 pb-4">
                  {blocks.map((block) => {
                    const bgMap: Record<string, string> = {
                      '冲击区': 'from-red-400 to-orange-400',
                      '展示区': 'from-blue-400 to-cyan-400',
                      '功效区': 'from-emerald-400 to-teal-400',
                      '口碑区': 'from-amber-400 to-yellow-400',
                      '引导区': 'from-purple-400 to-pink-400',
                    }
                    return (
                      <div key={block.id}
                        className={`mx-2 p-4 rounded-lg bg-gradient-to-r ${bgMap[block.type] || 'from-slate-400 to-slate-300'} ${selectedId === block.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                        onClick={() => setSelectedId(block.id)}>
                        <p className="text-white font-bold text-sm">{block.title}</p>
                        <p className="text-white/80 text-xs mt-1 line-clamp-2">{block.content}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Property Editor */}
        <Card title="区块属性" className="lg:col-span-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">区块类型</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeColors[selected.type] || ''}`}>{selected.type}</span>
              </div>
              <Textarea label="区块标题" value={selected.title}
                onChange={(e) => updateBlock(selected.id, { title: e.target.value })} rows={1} />
              <Textarea label="内容文案" value={selected.content}
                onChange={(e) => updateBlock(selected.id, { content: e.target.value })} rows={4} />

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">背景样式</label>
                <div className="grid grid-cols-5 gap-2">
                  {['from-red-400 to-orange-400', 'from-blue-400 to-cyan-400', 'from-emerald-400 to-teal-400', 'from-amber-400 to-yellow-400', 'from-purple-400 to-pink-400'].map((g) => (
                    <button key={g} className={`aspect-square rounded-lg bg-gradient-to-r ${g} border-2 border-transparent hover:border-slate-400`} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">配图</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <span className="text-2xl">📷</span>
                  <p className="text-xs text-slate-500 mt-1">点击上传或拖拽图片</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={handleSave}>保存修改</Button>
                <Button variant="danger" size="sm" onClick={() => {
                  setBlocks((prev) => prev.filter((b) => b.id !== selected.id))
                  setSelectedId(blocks[0]?.id || '')
                }}>删除</Button>
              </div>

              {/* Review buttons */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-medium text-slate-600 mb-2">审核操作</p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => handleReview('approve')}>审核通过</Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => handleReview('reject')}>打回修改</Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">选择一个区块进行编辑</p>
          )}
        </Card>
      </div>
    </div>
  )
}
