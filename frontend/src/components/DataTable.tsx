'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'

interface Column {
  key: string
  label: string
  width?: string
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  pageSize?: number
  onRowClick?: (row: any) => void
  emptyText?: string
}

type SortDir = 'asc' | 'desc' | null

export function DataTable({ columns, data, pageSize = 10, onRowClick, emptyText = '暂无数据' }: DataTableProps) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const sa = String(av || '')
      const sb = String(bv || '')
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc')
      if (sortDir === 'desc') setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`pb-2.5 pt-1 text-left font-medium text-slate-600 ${col.sortable ? 'cursor-pointer hover:text-slate-800 select-none' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`border-b border-slate-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-2.5 text-slate-800">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            共 {sortedData.length} 条，第 {page + 1}/{totalPages} 页
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-transparent"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number
              if (totalPages <= 5) {
                p = i
              } else if (page < 3) {
                p = i
              } else if (page > totalPages - 4) {
                p = totalPages - 5 + i
              } else {
                p = page - 2 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded ${page === p ? 'bg-primary-500 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}
                >
                  {p + 1}
                </button>
              )
            })}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-transparent"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
