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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 border border-emerald-200 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Secure Notes & Tasks
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Role-Based Access Control • MongoDB Indexing • Aggregation Pipelines
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          {/* Quick Demo Login Buttons */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick Demo Accounts (1-Click)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@example.com')}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Login
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('alice@example.com')}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <UserIcon className="h-4 w-4" /> User Login
              </button>
            </div>
          </div>

          {/* Toggle form type */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                !isRegistering
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                isRegistering
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                placeholder="••••••••"
              />
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                    className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Interests (Comma separated, for Scenario 1 Aggregation)
                  </label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                    placeholder="chess, reading, technology"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
