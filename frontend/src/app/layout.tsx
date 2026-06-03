import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Search, Settings, ChevronDown, LayoutDashboard, History, ShieldAlert, Database, Cpu, Activity } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { NavLinks } from '@/components/ui/NavLinks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Manufacturing Analytics',
  description: 'Production level AWS Data Engineering Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-zinc-100 flex h-screen overflow-hidden`}>
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-[#09090b] border-r border-zinc-800/50 flex flex-col shadow-2xl relative z-20">
          <div className="h-20 flex items-center px-8 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center border border-blue-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-wide text-zinc-100 block leading-tight">DataHub AI</span>
                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Enterprise Edition</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Core Platform</div>
              <NavLinks />
            </div>
            
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">AWS Infrastructure</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30 group hover:border-zinc-700 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Kinesis Stream</span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30 group hover:border-zinc-700 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Lambda Validator</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
              </div>
            </div>
          </nav>
          
          <div className="p-6 border-t border-zinc-800/50 bg-[#09090b]">
            <div className="flex items-center justify-between group cursor-pointer hover:bg-zinc-800/40 p-2 -m-2 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 border-2 border-zinc-800 shadow-md"></div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">Senior Data Engineer</p>
                  <p className="text-xs text-zinc-500 font-medium">Role: AdminAccess</p>
                </div>
              </div>
              <Settings className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b] relative">
          <style>{`
            @keyframes pan-grid-layout {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: -24px -24px, -24px -24px; }
            }
          `}</style>
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
            style={{ animation: 'pan-grid-layout 5s linear infinite' }}
          ></div>

          {/* Top Navbar */}
          <header className="h-20 flex items-center justify-between px-10 border-b border-zinc-800/50 bg-[#09090b]/95 backdrop-blur-xl z-50 sticky top-0">
            <div>
              <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
                Fleet Operations Overview
              </h1>
              <p className="text-sm text-zinc-400 font-medium mt-1">Live metrics from AWS Data Pipeline</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="hidden md:flex relative group">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search machines, alerts..." 
                  suppressHydrationWarning
                  className="bg-zinc-900 border border-zinc-800 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600 text-zinc-200"
                />
              </div>

              {/* Notification Button */}
              <NotificationBell />

              <div className="h-6 w-px bg-zinc-800"></div>

              {/* Status Badge */}
              <span className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AWS KINESIS: CONNECTED
              </span>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto z-10 relative scrollbar-hide">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
