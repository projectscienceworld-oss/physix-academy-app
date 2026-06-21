'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { getAllUsers, adminUpdateUser, adminDeleteUserProfile } from '@/lib/firestore-helpers';
import type { UserProfile, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type RoleFilter = 'all' | 'student' | 'teacher' | 'admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, search, roleFilter]);

  const startEdit = (u: UserProfile) => {
    setEditingId(u.id);
    setEditName(u.name);
    setEditRole(u.role);
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (uid: string) => {
    setSaving(true);
    try {
      await adminUpdateUser(uid, { name: editName, role: editRole });
      toast({ title: 'User updated', description: 'Changes saved successfully.' });
      setEditingId(null);
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (uid: string, name: string) => {
    if (!confirm(`Delete profile for "${name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteUserProfile(uid);
      toast({ title: 'User deleted', description: `${name}'s profile removed.` });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    }
  };

  const roleColors: Record<string, string> = {
    student: 'bg-blue-500/10 text-blue-400',
    teacher: 'bg-emerald-500/10 text-emerald-400',
    admin: 'bg-rose-500/10 text-rose-400',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <span className="text-sm text-white/30 ml-1">({users.length} total)</span>
        </div>
        <p className="text-white/40 text-sm">Manage all students, teachers and admins.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-rose-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'student', 'teacher', 'admin'] as RoleFilter[]).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === r
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider hidden md:table-cell">Batches</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-white/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-8 bg-white/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                : filtered.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleColors[u.role] || 'bg-white/10 text-white'}`}>
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            {editingId === u.id ? (
                              <input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="bg-white/10 border border-rose-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none w-40"
                                autoFocus
                              />
                            ) : (
                              <p className="font-medium text-white">{u.name}</p>
                            )}
                            <p className="text-xs text-white/30 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === u.id ? (
                          <div className="relative">
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value as UserRole)}
                              className="appearance-none bg-white/10 border border-rose-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none pr-8"
                            >
                              <option value="student">student</option>
                              <option value="teacher">teacher</option>
                              <option value="admin">admin</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
                          </div>
                        ) : (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-white/50">{u.batch_ids?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-white/30 text-xs">
                          {u.last_active?.toDate?.()?.toLocaleDateString() || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === u.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(u.id)}
                                disabled={saving}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(u)}
                                className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteUser(u.id, u.name)}
                                className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              >
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
            <div className="text-center py-16 text-white/25">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
