'use client';

import React from 'react';
import { User } from '../types';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base tracking-tight">SecureNotes Manager</h1>
            <p className="text-xs text-slate-500 hidden sm:block">MongoDB Indexed REST Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
            <span className="text-xs text-slate-800 font-semibold">{currentUser.name}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
