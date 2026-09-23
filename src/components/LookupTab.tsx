'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { User, Scenario2UserWithPosts } from '../types';
import { Link as LinkIcon, RefreshCw, Search, MessageSquare } from 'lucide-react';

interface LookupTabProps {
  currentUser: User;
}

export const LookupTab: React.FC<LookupTabProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<Scenario2UserWithPosts | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsersList = useCallback(async () => {
    try {
      const res = await api.admin.listUsers(1, 50);
      if (res.success && res.data.length > 0) {
        setUsers(res.data);
        if (!selectedUserId) {
          setSelectedUserId(res.data[0]._id);
        }
      }
    } catch {
      // If not admin, fallback to current user
      setUsers([currentUser]);
      setSelectedUserId(currentUser._id);
    }
  }, [currentUser, selectedUserId]);

  const runLookup = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.aggregations.userPostsLookup(userId);
      if (res.success) {
        setLookupResult(res.data);
      }
    } catch (err) {
      console.error('Error fetching lookup data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersList();
  }, [loadUsersList]);

  useEffect(() => {
    if (selectedUserId) {
      runLookup(selectedUserId);
    }
  }, [selectedUserId, runLookup]);

  return (
    <div>
      <div className="pb-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-indigo-400" />
          Scenario 2: User Posts ($lookup) Aggregation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Constraint strictly satisfied:{' '}
          <span className="text-emerald-400 font-semibold">
            Single aggregation pipeline with a $lookup stage
          </span>
          . ForeignField indexing supported by{' '}
          <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
            {'{ authorId: 1, createdAt: -1 }'}
          </code>
          .
        </p>
      </div>

      {/* User Selector */}
      <div className="mt-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
          Select User to Run $lookup Pipeline:
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full sm:w-auto flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email}) - Role: {u.role}
            </option>
          ))}
        </select>
      </div>

      {/* Results Display */}
      {loading ? (
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
  );
};
