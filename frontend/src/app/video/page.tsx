'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea, Input, Select } from '@/components/ui/Form'
import { ProgressBar } from '@/components/ui/Progress'
import { apiFetch } from '@/lib/utils'
import { videoTypes as mockTypes, videoStoryboard as mockScenes, videoGenerationSteps as mockSteps } from '@/lib/mock-data'

export default function VideoPage() {
  const [videoTypes, setVideoTypes] = useState(mockTypes)
  const [selectedType, setSelectedType] = useState('showcase')
  const [scenes, setScenes] = useState(mockScenes)
  const [selectedScene, setSelectedScene] = useState<number>(0)
  const [generating, setGenerating] = useState(false)
  const [genSteps, setGenSteps] = useState(mockSteps)
  const [genProgress, setGenProgress] = useState(0)
  const [reviewStatus, setReviewStatus] = useState('draft')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [sceneImages, setSceneImages] = useState<string[]>([])
  const [genMessage, setGenMessage] = useState('')

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

  // Load script from API
  const loadScript = useCallback(async () => {
    try {
      const [typesData, scriptData] = await Promise.all([
        apiFetch('/api/video/types').catch(() => null),
        apiFetch('/api/video/script').catch(() => null),
      ])
      if (typesData?.types?.length) setVideoTypes(typesData.types)
      if (scriptData?.scenes?.length) {
        setScenes(scriptData.scenes)
        setSelectedType(scriptData.video_type || 'showcase')
      }
      if (scriptData?.review_status) setReviewStatus(scriptData.review_status)
      if (scriptData?.video_url) setVideoUrl(scriptData.video_url)
      if (scriptData?.scene_images?.length) setSceneImages(scriptData.scene_images)
    } catch {
      // fallback to mock
    }
  }, [])

  useEffect(() => { loadScript() }, [loadScript])

  const updateScene = (id: number, updates: Partial<typeof scenes[0]>) => {
    setScenes((items) => items.map((s) => s.id === id ? { ...s, ...updates } : s))
  }

  // Generate script via AI
  const handleGenerateScript = async () => {
    setGenerating(true)
    try {
      const data = await apiFetch('/api/video/script/generate', {
        method: 'POST',
        body: JSON.stringify({ video_type: selectedType, product_name: '涂抹面膜-补水保湿款' }),
      })
      if (data.scenes?.length) setScenes(data.scenes)
    } catch {
      // keep current scenes
    } finally {
      setGenerating(false)
    }
  }

  // Start video generation
  const handleGenerateVideo = async () => {
    setGenerating(true)
    setGenMessage('正在生成分镜图片...')
    try {
      const data = await apiFetch('/api/video/generate', { method: 'POST' })
      if (data.steps) setGenSteps(data.steps)
      if (data.progress) setGenProgress(data.progress)
      if (data.video_url) {
        setVideoUrl(data.video_url)
        setGenMessage('视频生成完成！')
      }
      if (data.scene_images?.length) setSceneImages(data.scene_images)
      if (data.message) setGenMessage(data.message)
    } catch {
      setGenProgress(45)
      setGenMessage('视频生成需要启动后端服务')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadVideo = () => {
    if (videoUrl) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const url = videoUrl.startsWith('http') ? videoUrl : `${API_BASE}${videoUrl}`
      const a = document.createElement('a')
      a.href = url; a.download = 'video.mp4'; a.target = '_blank'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    }
  }

  // Review
  const handleReview = async (action: 'approve' | 'reject') => {
    try {
      const data = await apiFetch('/api/video/review', {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      setReviewStatus(data.review_status || (action === 'approve' ? 'approved' : 'draft'))
    } catch {
      setReviewStatus(action === 'approve' ? 'approved' : 'draft')
    }
  }

  // Save scenes
  const handleSaveScenes = async () => {
    try {
      await apiFetch('/api/video/scenes/update', {
        method: 'POST',
        body: JSON.stringify({ scenes }),
      })
    } catch {
      // silent
    }
  }

  const scene = scenes[selectedScene]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">短视频生成</h1>
          <p className="text-slate-500 mt-1">制作吸引用户的产品视频</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={reviewStatus === 'approved' ? 'success' : 'default'}>
            {reviewStatus === 'approved' ? '已审核' : '草稿'}
          </Badge>
          <Button variant="secondary" icon="✨" onClick={handleGenerateScript} loading={generating}>
            {generating ? 'AI生成中...' : 'AI生成脚本'}
          </Button>
          <Button onClick={handleGenerateVideo} icon="🎬" loading={generating}>
            {generating ? '生成中...' : '生成视频'}
          </Button>
          {videoUrl && (
            <Button variant="primary" icon="⬇" onClick={handleDownloadVideo}>
              下载视频
            </Button>
          )}
        </div>
      </div>

      {/* Video Type Selection */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {videoTypes.map((vt) => (
          <button key={vt.id}
            onClick={() => setSelectedType(vt.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${selectedType === vt.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-300'}`}>
            <span className="text-lg">{vt.icon}</span>
            {vt.label}
          </button>
        ))}
      </div>

      {/* Generation Progress */}
      {(generating || genMessage) && (
        <Card title="生成进度">
          <div className="flex items-center gap-4">
            {genSteps.map((step, i) => {
              const colors = {
                complete: 'bg-emerald-100 text-emerald-700',
                in_progress: 'bg-primary-100 text-primary-700',
                pending: 'bg-slate-100 text-slate-500',
              }
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors[step.status as keyof typeof colors]}`}>
                    {step.status === 'complete' ? '✓' : i + 1}
                  </span>
                  <span className={`text-xs ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {step.step}
                  </span>
                  {i < genSteps.length - 1 && <span className="text-slate-300 ml-auto">→</span>}
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <ProgressBar value={genProgress} label={`总进度 ${genProgress}%`} color="primary" />
          </div>
          {genMessage && <p className="mt-2 text-sm text-slate-600">{genMessage}</p>}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Storyboard Editor */}
        <Card title="分镜脚本" subtitle={`共 ${scenes.length} 个分镜 | 总时长 ${totalDuration}s`} className="lg:col-span-4">
          <div className="space-y-2">
            {scenes.map((s, i) => (
              <div key={s.id}
                onClick={() => setSelectedScene(i)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedScene === i ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}>
                <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{s.scene}</p>
                    <Badge variant="default">{s.duration}s</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" size="sm" className="flex-1" icon="+" onClick={() => {
              const newId = Math.max(...scenes.map(s => s.id), 0) + 1
              setScenes(prev => [...prev, { id: newId, scene: '新分镜', description: '画面描述', narration: '旁白文案', duration: 5 }])
              setSelectedScene(scenes.length)
            }}>添加分镜</Button>
            <Button variant="ghost" size="sm" className="flex-1" icon="💾" onClick={handleSaveScenes}>保存</Button>
          </div>
        </Card>

        {/* Center: Video Preview */}
        <Card title="视频预览" className="lg:col-span-4">
          {/* Video Player */}
          <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative mb-4">
            {videoUrl ? (
              <video
                src={videoUrl.startsWith('http') ? videoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${videoUrl}`}
                controls
                className="w-full h-full object-cover"
                autoPlay
                loop
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/30 transition-colors">
                    <span className="text-white text-2xl ml-1">▶</span>
                  </div>
                  <p className="text-white/70 text-sm">{scene?.scene}</p>
                  <p className="text-white/40 text-xs mt-1">点击“生成视频”开始制作</p>
                </div>
              </div>
            )}
            {!videoUrl && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/70 to-transparent flex items-end px-3 pb-1">
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${((selectedScene + 1) / scenes.length) * 100}%` }} />
                </div>
                <span className="text-white/80 text-[10px] ml-2">
                  {scenes.slice(0, selectedScene + 1).reduce((s, sc) => s + sc.duration, 0)}s / {totalDuration}s
                </span>
              </div>
            )}
          </div>

          {/* Scene Thumbnails with real images */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {scenes.map((s, i) => (
              <button key={s.id}
                onClick={() => setSelectedScene(i)}
                className={`shrink-0 w-20 aspect-video rounded border-2 overflow-hidden ${selectedScene === i ? 'border-primary-500' : 'border-slate-200'}`}>
                {sceneImages[i] ? (
                  <img src={sceneImages[i]} alt={s.scene} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <span className="text-white/60 text-xs">{i + 1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Cover Selection */}
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">封面图</label>
            <div className="flex gap-2">
              {scenes.slice(0, 4).map((s, i) => (
                <div key={i} className="flex-1 aspect-video rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-primary-300">
                  {sceneImages[i] ? (
                    <img src={sceneImages[i]} alt={`封面${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <span className="text-xs text-slate-400">分镜{i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Scene Editor + Review */}
        <div className="lg:col-span-4 space-y-4">
          {scene && (
            <Card title={`编辑分镜 ${selectedScene + 1}`}>
              <div className="space-y-3">
                <Input label="场景名称" value={scene.scene}
                  onChange={(e) => updateScene(scene.id, { scene: e.target.value })} />
                <Textarea label="画面描述" rows={3} value={scene.description}
                  onChange={(e) => updateScene(scene.id, { description: e.target.value })} />
                <Textarea label="旁白文案" rows={2} value={scene.narration}
                  onChange={(e) => updateScene(scene.id, { narration: e.target.value })} />
                <Select label="时长(秒)" options={[
                  { value: '3', label: '3秒' }, { value: '5', label: '5秒' },
                  { value: '8', label: '8秒' }, { value: '10', label: '10秒' },
                ]} value={String(scene.duration)}
                  onChange={(e) => updateScene(scene.id, { duration: Number(e.target.value) })} />
              </div>
            </Card>
          )}

          <Card title="审核面板">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">评分</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} className="text-2xl text-amber-400 hover:scale-110 transition-transform">★</button>
                  ))}
                </div>
              </div>
              <Select label="配音风格" options={[
                { value: 'warm', label: '温暖女声' },
                { value: 'professional', label: '专业播音' },
                { value: 'casual', label: '轻松口播' },
                { value: 'energetic', label: '活力男声' },
              ]} />
              <Textarea label="审核批注" rows={3} placeholder="输入审核意见..." />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => handleReview('approve')}>通过</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => handleReview('reject')}>打回重做</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
