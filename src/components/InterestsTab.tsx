'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Scenario1Group } from '../types';
import { PieChart, RefreshCw, Sparkles } from 'lucide-react';

export const InterestsTab: React.FC = () => {
  const [data, setData] = useState<Scenario1Group[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInterests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.aggregations.groupByInterests();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching interests aggregation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  return (
    <div>
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-400" />
              Scenario 1: Users Grouped by Interests
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Constraint strictly satisfied:{' '}
              <span className="text-emerald-400 font-semibold">
                Exactly one collection.aggregate() call
              </span>
              . Supported by multikey index{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">
                {'{ interests: 1 }'}
              </code>
              .
            </p>
          </div>
          <button
            onClick={loadInterests}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
          <span>Running aggregation pipeline...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <PieChart className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <p className="text-base font-medium">No interest groups discovered</p>
          <p className="text-xs text-slate-500 mt-1">Users need to have interests assigned to be grouped.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {data.map((group) => (
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
  );
};
