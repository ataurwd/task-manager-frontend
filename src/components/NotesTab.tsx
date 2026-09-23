'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Note, User, Pagination } from '../types';
import { NoteModal } from './NoteModal';
import {
  FileText,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NotesTabProps {
  currentUser: User;
}

export const NotesTab: React.FC<NotesTabProps> = ({ currentUser }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.notes.list(page, 6);
      if (res.success) {
        setNotes(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.notes.delete(id);
      loadNotes();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            My Notes
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' && (
            <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-rose-600" />
              Admin View: Viewing all notes
            </span>
          )}

          <button
            onClick={() => {
              setEditingNote(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Note</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Loading notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-base font-semibold text-slate-700">No notes available</p>
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
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{note.title}</h3>
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {(isOwner || currentUser.role === 'admin') && (
                        <>
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setModalOpen(true);
                            }}
                            className="p-1 hover:text-emerald-600 text-slate-400 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="p-1 hover:text-rose-600 text-slate-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{author ? `By ${author.name}` : 'Note'}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-xs text-slate-500 font-medium">
            Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={loadNotes}
        editingNote={editingNote}
      />
    </div>
  );
};
