import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

export const metadata: Metadata = {
  title: '淘宝SOP运营工具',
  description: '涂抹面膜全流程SOP自动化系统',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
