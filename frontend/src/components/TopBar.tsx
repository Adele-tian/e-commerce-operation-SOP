export function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>淘宝SOP运营工具</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-medium">涂抹面膜全流程</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">系统正常</span>
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-medium">
          管
        </div>
      </div>
    </header>
  )
}
