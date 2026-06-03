'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, ShieldAlert, Settings } from 'lucide-react';

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Real-time Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Historical Analytics', icon: History },
    { href: '/quarantine', label: 'Quarantine Zone (S3)', icon: ShieldAlert },
    { href: '/settings', label: 'System Settings', icon: Settings, isSettings: true },
  ];

  return (
    <div className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/20 shadow-inner shadow-blue-500/10' 
                : 'text-zinc-400 font-medium hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
            } ${link.isSettings ? 'mt-2' : ''}`}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
