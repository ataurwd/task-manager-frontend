'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { AuthView } from './AuthView';
import { FileText, Users, RefreshCw } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, authLoading, logout, login } = useAuth();
  const pathname = usePathname();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-base font-semibold">Initializing Secure Platform...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onAuthSuccess={(user) => login(localStorage.getItem('token') || '', user)} />;
  }

  const isNotesActive = pathname === '/notes' || pathname === '/';
  const isUsersActive = pathname.startsWith('/users');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header currentUser={currentUser} onLogout={logout} />

      {/* Admin Navigation Bar with real Route Links */}
      {currentUser.role === 'admin' && (
        <nav className="border-b border-slate-200 bg-white/70 backdrop-blur shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5">
            <Link
              href="/notes"
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isNotesActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>All Notes</span>
            </Link>

            <Link
              href="/users"
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isUsersActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
};
