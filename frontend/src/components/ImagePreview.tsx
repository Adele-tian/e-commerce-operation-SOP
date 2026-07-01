'use client'

import { useState } from 'react'

interface ImagePreviewProps {
  images: { id: string | number; url?: string; label?: string; status?: string }[]
  selectedId?: string | number
  onSelect?: (id: string | number) => void
  columns?: number
  aspectRatio?: 'square' | 'video' | 'detail'
}

const aspectClasses: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  detail: 'aspect-[3/4]',
}

const statusOverlay: Record<string, string> = {
  approved: 'border-emerald-400 ring-2 ring-emerald-200',
  published: 'border-blue-400 ring-2 ring-blue-200',
  draft: 'border-slate-200',
  pending_review: 'border-amber-400 ring-2 ring-amber-200',
}

export function ImagePreview({ images, selectedId, onSelect, columns = 3, aspectRatio = 'square' }: ImagePreviewProps) {
  const [fullscreen, setFullscreen] = useState<string | number | null>(null)

  const gridCols = `grid-cols-${columns}`

  return (
    <>
      <div className={`grid ${gridCols} gap-3`}>
        {images.map((img) => {
          const isSelected = selectedId === img.id
          const borderClass = statusOverlay[img.status || 'draft'] || 'border-slate-200'

          return (
            <button
              key={img.id}
              onClick={() => {
                onSelect?.(img.id)
                setFullscreen(img.id)
              }}
              className={`relative ${aspectClasses[aspectRatio]} rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${borderClass} ${isSelected ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
            >
              {img.url ? (
                <img src={img.url} alt={img.label || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">{img.label || `#${img.id}`}</span>
                </div>
              )}
              {img.status && (
                <div className="absolute top-1.5 right-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    img.status === 'approved' ? 'bg-emerald-500 text-white' :
                    img.status === 'published' ? 'bg-blue-500 text-white' :
                    img.status === 'pending_review' ? 'bg-amber-500 text-white' :
                    'bg-slate-400 text-white'
                  }`}>
                    {img.status === 'approved' ? '✓' : img.status === 'published' ? '🔗' : img.status === 'pending_review' ? '⏳' : '○'}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setFullscreen(null)}
        >
          <div className="max-w-3xl max-h-[80vh]">
            {(() => {
              const img = images.find((i) => i.id === fullscreen)
              if (!img) return null
              return img.url ? (
                <img src={img.url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              ) : (
                <div className="w-[600px] h-[600px] bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-white/60 text-xl">{img.label || `#${img.id}`}</span>
                </div>
              )
            })()}
          </div>
          <button className="absolute top-4 right-4 text-white/80 text-3xl hover:text-white">✕</button>
        </div>
      )}
    </>
  )
}

/* Slider comparison for A/B versions */
export function ImageCompare({ left, right }: { left: { url?: string; label: string }; right: { url?: string; label: string } }) {
  const [sliderPos, setSliderPos] = useState(50)

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 select-none">
      {/* Left image */}
      <div className="absolute inset-0">
        {left.url ? (
          <img src={left.url} alt={left.label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-blue-500">{left.label}</span>
          </div>
        )}
      </div>
      {/* Right image (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
        {right.url ? (
          <img src={right.url} alt={right.label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <span className="text-purple-500">{right.label}</span>
          </div>
        )}
      </div>
      {/* Slider handle */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10"
      />
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <span className="text-slate-600 text-xs font-bold">⇔</span>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs">{left.label}</div>
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">{right.label}</div>
    </div>
  )
}
