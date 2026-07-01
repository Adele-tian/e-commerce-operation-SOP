import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
