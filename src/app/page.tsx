'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, removeToken } from '../lib/api';
import {
  User,
  Note,
  Post,
  Pagination,
  Scenario1Group,
  Scenario2UserWithPosts,
} from '../types';
import {
  FileText,
  Users,
  PieChart,
  Link as LinkIcon,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'admin' | 'interests' | 'lookup' | 'posts'>('notes');

  // Auth form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [authInterests, setAuthInterests] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesPagination, setNotesPagination] = useState<Pagination>({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [notesPage, setNotesPage] = useState(1);
  const [viewAllNotesAsAdmin, setViewAllNotesAsAdmin] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState<Pagination>({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [adminUserModal, setAdminUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserInterests, setNewUserInterests] = useState('');

  // Aggregation 1 state
  const [interestsData, setInterestsData] = useState<Scenario1Group[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);

  // Aggregation 2 state
  const [lookupUserList, setLookupUserList] = useState<User[]>([]);
  const [selectedLookupUserId, setSelectedLookupUserId] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<Scenario2UserWithPosts | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Public posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsPagination, setPostsPagination] = useState<Pagination>({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [postsPage, setPostsPage] = useState(1);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postsLoading, setPostsLoading] = useState(false);

  // Check auth session
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

  // Load Notes
  const loadNotes = useCallback(async () => {
    if (!currentUser) return;
    setNotesLoading(true);
    try {
      const res = await api.notes.list(notesPage, 6);
      if (res.success) {
        setNotes(res.data);
        setNotesPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setNotesLoading(false);
    }
  }, [currentUser, notesPage]);

  // Load Admin Users
  const loadAdminUsers = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    setUsersLoading(true);
    try {
      const res = await api.admin.listUsers(usersPage, 6);
      if (res.success) {
        setAdminUsers(res.data);
        setUsersPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [currentUser, usersPage]);

  // Load Scenario 1 (Interests Aggregation)
  const loadInterests = useCallback(async () => {
    setInterestsLoading(true);
    try {
      const res = await api.aggregations.groupByInterests();
      if (res.success) {
        setInterestsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching interests aggregation:', err);
    } finally {
      setInterestsLoading(false);
    }
  }, []);

  // Load Scenario 2 User Selector
  const loadLookupUsers = useCallback(async () => {
    try {
      const res = await api.admin.listUsers(1, 50);
      if (res.success) {
        setLookupUserList(res.data);
        if (res.data.length > 0 && !selectedLookupUserId) {
          setSelectedLookupUserId(res.data[0]._id);
        }
      }
    } catch {
      // If not admin, fallback to current user
      if (currentUser) {
        setLookupUserList([currentUser]);
        setSelectedLookupUserId(currentUser._id);
      }
    }
  }, [currentUser, selectedLookupUserId]);

  const loadLookupData = useCallback(async (userId: string) => {
    if (!userId) return;
    setLookupLoading(true);
    try {
      const res = await api.aggregations.userPostsLookup(userId);
      if (res.success) {
        setLookupResult(res.data);
      }
    } catch (err) {
      console.error('Error fetching lookup data:', err);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // Load Posts Feed
  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await api.posts.list(postsPage, 6);
      if (res.success) {
        setPosts(res.data);
        setPostsPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, [postsPage]);

  // Trigger loads on tab changes
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'notes') loadNotes();
    if (activeTab === 'admin') loadAdminUsers();
    if (activeTab === 'interests') loadInterests();
    if (activeTab === 'lookup') {
      loadLookupUsers();
      if (selectedLookupUserId) loadLookupData(selectedLookupUserId);
    }
    if (activeTab === 'posts') loadPosts();
  }, [currentUser, activeTab, loadNotes, loadAdminUsers, loadInterests, loadLookupUsers, loadLookupData, loadPosts, selectedLookupUserId]);

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      if (isRegistering) {
        const interestsArr = authInterests.split(',').map((s) => s.trim()).filter(Boolean);
        const res = await api.auth.register({
          name: authName,
          email: authEmail,
          password: authPassword,
          role: authRole,
          interests: interestsArr,
        });
        setToken(res.token);
        setCurrentUser(res.user);
      } else {
        const res = await api.auth.login({
          email: authEmail,
          password: authPassword,
        });
        setToken(res.token);
        setCurrentUser(res.user);
      }
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleDemoLogin = async (email: string, pass = 'Password123!') => {
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const res = await api.auth.login({ email, password: pass });
      setToken(res.token);
      setCurrentUser(res.user);
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
  };

  // Note CRUD handlers
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    try {
      if (editingNoteId) {
        await api.notes.update(editingNoteId, { title: noteTitle, content: noteContent });
      } else {
        await api.notes.create({ title: noteTitle, content: noteContent });
      }
      setNoteModalOpen(false);
      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      loadNotes();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.notes.delete(id);
      loadNotes();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Admin User CRUD handlers
  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const interestsArr = newUserInterests.split(',').map((s) => s.trim()).filter(Boolean);
      await api.admin.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        interests: interestsArr,
      });
      setAdminUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserInterests('');
      loadAdminUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? Their notes and posts will be removed.')) return;
    try {
      await api.admin.deleteUser(id);
      loadAdminUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Post creation handler
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    try {
      await api.posts.create({ title: postTitle, content: postContent });
      setPostTitle('');
      setPostContent('');
      loadPosts();
    } catch (err) {
      alert((err as Error).message);
    }
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

  // Unauthenticated View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/30">
            <ShieldCheck className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Secure Notes & Tasks
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Role-Based Access Control • MongoDB Indexing • Aggregation Pipelines
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/90 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800">
            {/* Quick Demo Login Buttons */}
            <div className="mb-6 pb-6 border-b border-slate-800">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
                Quick Demo Accounts (1-Click)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@example.com')}
                  disabled={authSubmitting}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600/20 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" /> Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alice@example.com')}
                  disabled={authSubmitting}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all"
                >
                  <UserIcon className="h-4 w-4" /> User Login
                </button>
              </div>
            </div>

            {/* Toggle form type */}
            <div className="flex border-b border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setAuthError(''); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  !isRegistering
                    ? 'border-b-2 border-indigo-500 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setAuthError(''); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  isRegistering
                    ? 'border-b-2 border-indigo-500 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Role</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value as 'user' | 'admin')}
                      className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Interests (Comma separated, for Scenario 1 Aggregation)
                    </label>
                    <input
                      type="text"
                      value={authInterests}
                      onChange={(e) => setAuthInterests(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      placeholder="chess, reading, technology"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
              >
                {authSubmitting ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
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
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

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
        {/* TAB 1: NOTES CRUD */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Notes Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Supported by compound index{' '}
                  <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
                    {'{ userId: 1, createdAt: -1 }'}
                  </code>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentUser.role === 'admin' && (
                  <span className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-rose-400" />
                    Admin View: Can view everyone&apos;s notes
                  </span>
                )}

                <button
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                    setNoteModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Note</span>
                </button>
              </div>
            </div>

            {/* Notes List */}
            {notesLoading ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Loading indexed notes...</span>
              </div>
            ) : notes.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="text-base font-medium">No notes available</p>
                <p className="text-xs text-slate-500 mt-1">Create your first note using the button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {notes.map((note) => {
                  const author = typeof note.userId === 'object' ? (note.userId as User) : null;
                  const isOwner = author?._id === currentUser._id || note.userId === currentUser._id;

                  return (
                    <div
                      key={note._id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white text-sm line-clamp-1">{note.title}</h3>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {(isOwner || currentUser.role === 'admin') && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note._id);
                                    setNoteTitle(note.title);
                                    setNoteContent(note.content);
                                    setNoteModalOpen(true);
                                  }}
                                  className="p-1 hover:text-indigo-400 text-slate-400"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note._id)}
                                  className="p-1 hover:text-rose-400 text-slate-400"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-3 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {author ? `By ${author.name}` : 'Note'}
                        </span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {notesPagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">
                  Page {notesPagination.page} of {notesPagination.totalPages} (Total: {notesPagination.total})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={notesPagination.page <= 1}
                    onClick={() => setNotesPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={notesPagination.page >= notesPagination.totalPages}
                    onClick={() => setNotesPage((p) => p + 1)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADMIN USER MANAGEMENT */}
        {activeTab === 'admin' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Admin User Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Supported by compound index{' '}
                  <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
                    {'{ role: 1, createdAt: -1 }'}
                  </code>
                </p>
              </div>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setAdminUserModal(true)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New User</span>
                </button>
              )}
            </div>

            {currentUser.role !== 'admin' ? (
              <div className="mt-12 p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 max-w-lg mx-auto">
                <ShieldCheck className="h-12 w-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">RBAC Access Restricted</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Only users with the <span className="text-rose-400 font-semibold">admin</span> role can manage users. Current role: <span className="text-indigo-400 font-semibold">{currentUser.role}</span>.
                </p>
              </div>
            ) : usersLoading ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Loading users...</span>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Interests</th>
                      <th className="px-6 py-3.5">Joined</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {adminUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.interests && u.interests.length > 0 ? (
                              u.interests.map((int, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md"
                                >
                                  {int}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteAdminUser(u._id)}
                            className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCENARIO 1 (INTERESTS AGGREGATION) */}
        {activeTab === 'interests' && (
          <div>
            <div className="pb-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-400" />
                    Scenario 1: Users Grouped by Interests
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Constraint strictly satisfied: <span className="text-emerald-400 font-semibold">Exactly one collection.aggregate() call</span>.
                    Supported by multikey index <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">{'{ interests: 1 }'}</code>.
                  </p>
                </div>
                <button
                  onClick={loadInterests}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${interestsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {interestsLoading ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Running aggregation pipeline...</span>
              </div>
            ) : interestsData.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <PieChart className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="text-base font-medium">No interest groups discovered</p>
                <p className="text-xs text-slate-500 mt-1">Users need to have interests assigned to be grouped.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {interestsData.map((group) => (
                  <div
                    key={group.interest}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="font-bold text-white text-base capitalize flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        {group.interest}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {group.count} {group.count === 1 ? 'User' : 'Users'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {group.users.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-800/60"
                        >
                          <div>
                            <span className="font-medium text-slate-200">{u.name}</span>
                            <span className="text-[10px] text-slate-400 block">{u.email}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              u.role === 'admin' ? 'bg-rose-950 text-rose-300' : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SCENARIO 2 ($LOOKUP USER POSTS) */}
        {activeTab === 'lookup' && (
          <div>
            <div className="pb-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-indigo-400" />
                Scenario 2: User Posts ($lookup) Aggregation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Constraint strictly satisfied: <span className="text-emerald-400 font-semibold">Single aggregation pipeline with a $lookup stage</span>.
                ForeignField indexing supported by <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">{'{ authorId: 1, createdAt: -1 }'}</code>.
              </p>
            </div>

            {/* User Selector */}
            <div className="mt-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Select User to Run $lookup Pipeline:
              </label>
              <select
                value={selectedLookupUserId}
                onChange={(e) => {
                  setSelectedLookupUserId(e.target.value);
                  loadLookupData(e.target.value);
                }}
                className="w-full sm:w-auto flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {lookupUserList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) - Role: {u.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Display */}
            {lookupLoading ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Executing single aggregation with $lookup stage...</span>
              </div>
            ) : !lookupResult ? (
              <div className="py-20 text-center text-slate-500">
                <Search className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="text-base font-medium">Select a user above to run the pipeline</p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* User Summary Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{lookupResult.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {lookupResult.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{lookupResult.email}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[11px] text-slate-500">Interests:</span>
                      {lookupResult.interests?.map((int, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-800/40 px-4 py-3 rounded-xl text-center">
                    <span className="block text-2xl font-extrabold text-indigo-400">
                      {lookupResult.postsCount}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      $lookup Posts
                    </span>
                  </div>
                </div>

                {/* Joined Posts List */}
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    Posts Joined from &apos;posts&apos; Collection via $lookup:
                  </h4>

                  {lookupResult.posts.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                      This user has not authored any posts yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lookupResult.posts.map((post) => (
                        <div
                          key={post._id}
                          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                        >
                          <div>
                            <h5 className="font-semibold text-white text-sm">{post.title}</h5>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{post.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-4 block border-t border-slate-800/80 pt-2">
                            Created: {new Date(post.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PUBLIC FEED */}
        {activeTab === 'posts' && (
          <div>
            <div className="pb-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                Public Community Posts Feed
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visible to everyone. Supported by index <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">{'{ createdAt: -1 }'}</code>.
              </p>
            </div>

            {/* Post creation form */}
            <form onSubmit={handleCreatePost} className="mt-6 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Publish New Post</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Post title..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Share knowledge with the community..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Publish Post
                  </button>
                </div>
              </div>
            </form>

            {/* Posts Grid */}
            {postsLoading ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Loading feed...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="text-base font-medium">No posts published yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {posts.map((p) => {
                  const author = typeof p.authorId === 'object' ? (p.authorId as User) : null;
                  return (
                    <div
                      key={p._id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                        <p className="text-xs text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">
                          {p.content}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{author ? `By ${author.name}` : 'Post'}</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Note Create/Edit Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingNoteId ? 'Edit Note' : 'Create New Note'}
            </h3>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Note title..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Content</label>
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Note content..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add User Modal */}
      {adminUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add User (Admin Capability)</h3>
            <form onSubmit={handleCreateAdminUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="User Name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Interests (Comma separated)</label>
                <input
                  type="text"
                  value={newUserInterests}
                  onChange={(e) => setNewUserInterests(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="chess, reading, hiking"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminUserModal(false)}
                  className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
