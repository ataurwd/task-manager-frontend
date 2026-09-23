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
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight">SecureNotes Manager</h1>
            <p className="text-xs text-slate-400 hidden sm:block">MongoDB Indexed REST Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
            <span className="text-xs text-slate-300 font-medium">{currentUser.name}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
