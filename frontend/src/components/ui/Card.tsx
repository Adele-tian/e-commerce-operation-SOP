import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Card({ title, subtitle, action, children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon?: string
  color?: string
}

export function StatCard({ label, value, change, icon, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {change !== undefined && (
            <p className={cn('text-sm mt-1 flex items-center gap-0.5', change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-slate-400 ml-1">较上月</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', colorMap[color] || colorMap.primary)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
