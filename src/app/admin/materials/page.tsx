'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Search, Trash2, Pencil, Check, X, ExternalLink } from 'lucide-react';
import { getAllMaterials, getAllUsers, deleteMaterial, adminUpdateMaterial } from '@/lib/firestore-helpers';
import type { Material, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const TYPE_COLORS: Record<string, string> = {
  video: 'bg-blue-500/10 text-blue-400',
  audio: 'bg-purple-500/10 text-purple-400',
  pdf: 'bg-rose-500/10 text-rose-400',
  link: 'bg-amber-500/10 text-amber-400',
};

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [filtered, setFiltered] = useState<Material[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [mats, allUsers] = await Promise.all([getAllMaterials(), getAllUsers()]);
    const userMap: Record<string, UserProfile> = {};
    allUsers.forEach(u => { userMap[u.id] = u; });
    setMaterials(mats);
    setUsers(userMap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(materials); return; }
    const q = search.toLowerCase();
    setFiltered(materials.filter(m => m.title?.toLowerCase().includes(q) || m.topic?.toLowerCase().includes(q)));
  }, [materials, search]);

  const startEdit = (m: Material) => {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditDesc(m.description || '');
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await adminUpdateMaterial(id, { title: editTitle, description: editDesc });
      toast({ title: 'Material updated' });
      setEditingId(null);
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to update material.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteMaterial(id);
      toast({ title: 'Material deleted' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete material.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Materials</h1>
          <span className="text-sm text-white/30 ml-1">({materials.length} total)</span>
        </div>
        <p className="text-white/40 text-sm">All uploaded learning materials across every class.</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by title or topic…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-rose-500/50"
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider hidden md:table-cell">Topic</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider hidden lg:table-cell">Uploaded by</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        {editingId === m.id ? (
                          <div className="space-y-1.5">
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full bg-white/10 border border-rose-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                            />
                            <input
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="Description"
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-white truncate">{m.title}</p>
                            {m.description && <p className="text-xs text-white/30 truncate mt-0.5">{m.description}</p>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[m.type] || 'bg-white/10 text-white/50'}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-white/50">{m.topic}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-white/40 text-xs">
                        {users[m.uploaded_by]?.name || m.uploaded_by?.slice(0, 8) + '…'}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-white/30 text-xs">
                        {m.uploaded_at?.toDate?.()?.toLocaleDateString() || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {editingId === m.id ? (
                            <>
                              <button onClick={() => saveEdit(m.id)} disabled={saving} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-amber-500/10 hover:text-amber-400 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(m.id, m.title)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-white/25">No materials found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
