import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: '淘宝SOP运营工具',
  description: '涂抹面膜全流程SOP自动化系统',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <Script
          id="suppress-ext-error"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              if(typeof window==='undefined')return;
              try{Object.defineProperty(window,'ai_ide_policy_obj',{value:{},writable:true,configurable:true,enumerable:false});}catch(e){}
              var _origDefine=Object.defineProperty;
              Object.defineProperty=function(o,p,d){
                try{return _origDefine.call(this,o,p,d);}
                catch(e){if(e.message&&e.message.indexOf('ai_ide_policy_obj')!==-1)return o;throw e;}
              };
              var _handler=function(e){
                if(e.message&&e.message.indexOf('ai_ide_policy_obj')!==-1){
                  e.preventDefault();
                  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
                }
              };
              window.addEventListener('error',_handler,true);
            })()`,
          }}
        />
      </head>
      <body className="flex h-screen overflow-hidden">
        <ToastProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
