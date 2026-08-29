'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  AlertTriangle,
  Activity,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: BarChart3 },
    { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { href: '/events', label: 'Events', icon: Activity },
    { href: '/services', label: 'Services', icon: Zap },
    { href: '/simulation', label: 'Simulation', icon: Activity },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">◉</span>
              </div>
              <span className="font-semibold text-slate-100">Incident Radar</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="px-4 py-2 rounded-lg text-xs space-y-1">
            {!collapsed ? (
              <>
                <div className="text-slate-400 font-medium">Production</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-slate-300">Operational</span>
                </div>
              </>
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
