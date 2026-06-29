import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">涂抹面膜全流程SOP</h1>
        <p className="text-slate-500 mt-1">淘宝运营自动化系统 - 从市场调研到内容生成的一站式工具</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: '蓝海探测', desc: '发现市场机会，评估品类竞争度', href: '/market', icon: '🔍' },
          { title: '关键词分析', desc: '挖掘搜索需求，布局关键词策略', href: '/keywords', icon: '🔑' },
          { title: '竞品评价分析', desc: '研究竞品评价，提取用户痛点', href: '/competitors', icon: '📊' },
          { title: '主图生成', desc: 'AI智能生成高点击率产品主图', href: '/images', icon: '🖼️' },
          { title: '详情页生成', desc: '打造高转化的商品详情页', href: '/detail-page', icon: '📄' },
          { title: '买家秀生成', desc: '制作真实自然的评价内容', href: '/buyer-show', icon: '👤' },
          { title: '短视频生成', desc: '制作吸引用户的产品视频', href: '/video', icon: '🎬' },
          { title: '社媒营销', desc: '多平台协同内容分发', href: '/social', icon: '📱' },
          { title: '数据监控', desc: '追踪运营效果，持续优化', href: '/analytics', icon: '📈' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
