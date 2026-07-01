'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Form'
import { Badge } from '@/components/ui/Badge'

interface ReviewPanelProps {
  status: string
  onApprove?: (notes?: string) => void
  onReject?: (notes: string) => void
  score?: number
  onScore?: (score: number) => void
  extraFields?: React.ReactNode
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
  draft: { label: '草稿', variant: 'default' },
  pending_review: { label: '待审核', variant: 'warning' },
  approved: { label: '已审核', variant: 'success' },
  published: { label: '已发布', variant: 'info' },
}

export function ReviewPanel({ status, onApprove, onReject, score, onScore, extraFields }: ReviewPanelProps) {
  const [notes, setNotes] = useState('')
  const [hoverScore, setHoverScore] = useState(0)
  const statusInfo = statusLabels[status] || statusLabels.draft

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">审核面板</h3>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Star Rating */}
      {onScore && (
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">评分</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`text-2xl transition-transform hover:scale-110 ${n <= (hoverScore || score || 0) ? 'text-amber-400' : 'text-slate-300'}`}
                onMouseEnter={() => setHoverScore(n)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => onScore(n)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}

      {extraFields}

      {/* Review Notes */}
      <Textarea
        label="审核批注"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="输入审核意见或修改建议..."
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onApprove && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onApprove(notes || undefined)}
          >
            通过
          </Button>
        )}
        {onReject && (
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => onReject(notes || '需要修改')}
            disabled={!notes.trim()}
          >
            打回修改
          </Button>
        )}
      </div>
    </div>
  )
}
