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
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-600" />
              Users Grouped by Interests
            </h2>
          </div>
          <button
            onClick={loadInterests}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Running aggregation pipeline...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <PieChart className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-base font-semibold text-slate-700">No interest groups discovered</p>
          <p className="text-xs text-slate-500 mt-1">Users need to have interests assigned to be grouped.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {data.map((group) => (
            <div
              key={group.interest}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-base capitalize flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  {group.interest}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {group.count} {group.count === 1 ? 'User' : 'Users'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {group.users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{u.name}</span>
                      <span className="text-[10px] text-slate-500 block">{u.email}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-200 text-slate-700'
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
