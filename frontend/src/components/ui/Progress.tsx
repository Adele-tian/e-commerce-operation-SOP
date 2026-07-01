import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: string
  className?: string
}

export function ProgressBar({ value, max = 100, label, color = 'primary', className }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100)
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-600',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">{label}</span>
          <span className="text-slate-500">{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[color] || colorMap.primary)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
