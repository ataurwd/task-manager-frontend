'use client';

import React, { useState } from 'react';
import { api, setToken } from '../lib/api';
import { User } from '../types';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        const interestsArr = interests.split(',').map((s) => s.trim()).filter(Boolean);
        const res = await api.auth.register({
          name,
          email,
          password,
          role,
          interests: interestsArr,
        });
        setToken(res.token);
        onAuthSuccess(res.user);
      } else {
        const res = await api.auth.login({ email, password });
        setToken(res.token);
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword = 'Password123!') => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.auth.login({ email: demoEmail, password: demoPassword });
      setToken(res.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

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
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600/20 transition-all"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Login
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('alice@example.com')}
                disabled={submitting}
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
              onClick={() => { setIsRegistering(false); setError(''); }}
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
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                isRegistering
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
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
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="chess, reading, technology"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
