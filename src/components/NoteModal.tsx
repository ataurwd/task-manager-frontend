'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingNote: Note | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    try {
      if (editingNote) {
        await api.notes.update(editingNote._id, { title, content });
      } else {
        await api.notes.create({ title, content });
      }
      onSave();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          {editingNote ? 'Edit Note' : 'Create New Note'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
              placeholder="Note title..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Content</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
              placeholder="Note content..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
