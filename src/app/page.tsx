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
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-lg font-medium">Initializing Secure Platform...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Notes CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Admin Users {currentUser.role !== 'admin' && '(Locked)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('interests')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'interests'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Scenario 1: Interests</span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'lookup'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Scenario 2: $lookup Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'posts'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
