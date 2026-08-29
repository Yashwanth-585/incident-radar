'use client';

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Environment selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-slate-100 cursor-pointer">
            <span>Production</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
            SR
          </div>
        </div>
      </div>
    </header>
  );
}
