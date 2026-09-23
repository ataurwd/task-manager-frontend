'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Post, User, Pagination } from '../types';
import { MessageSquare, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const PostsTab: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.posts.list(page, 6);
      if (res.success) {
        setPosts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setPublishing(true);
    try {
      await api.posts.create({ title, content });
      setTitle('');
      setContent('');
      loadPosts();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <div className="pb-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          Public Community Posts Feed
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Visible to everyone. Supported by index{' '}
          <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
            {'{ createdAt: -1 }'}
          </code>
          .
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            required
            rows={2}
            placeholder="Share knowledge with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={publishing}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Posts Grid */}
      {loading ? (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
