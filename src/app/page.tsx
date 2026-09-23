'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken, removeToken } from '../lib/api';
import { User } from '../types';
import { Header } from '../components/Header';
import { AuthView } from '../components/AuthView';
import { NotesTab } from '../components/NotesTab';
import { AdminUsersTab } from '../components/AdminUsersTab';
import { InterestsTab } from '../components/InterestsTab';
import { LookupTab } from '../components/LookupTab';
import { PostsTab } from '../components/PostsTab';
import {
  FileText,
  Users,
  PieChart,
  Link as LinkIcon,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'admin' | 'interests' | 'lookup' | 'posts'>('notes');

  const checkAuth = useCallback(async () => {
    setAuthLoading(true);
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const res = await api.auth.getMe();
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        removeToken();
        setCurrentUser(null);
      }
    } catch {
      removeToken();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
  };

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
    return <AuthView onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Navigation Tabs */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'notes'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Notes CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Admin Users {currentUser.role !== 'admin' && '(Locked)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('interests')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'interests'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Scenario 1: Interests</span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'lookup'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Scenario 2: $lookup Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'posts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Public Feed</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'notes' && <NotesTab currentUser={currentUser} />}
        {activeTab === 'admin' && <AdminUsersTab currentUser={currentUser} />}
        {activeTab === 'interests' && <InterestsTab />}
        {activeTab === 'lookup' && <LookupTab currentUser={currentUser} />}
        {activeTab === 'posts' && <PostsTab />}
      </main>
    </div>
  );
}
