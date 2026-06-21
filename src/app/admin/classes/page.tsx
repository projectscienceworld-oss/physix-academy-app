'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GraduationCap, Search, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllClasses, getAllUsers, adminDeleteClass } from '@/lib/firestore-helpers';
import type { Class, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [filtered, setFiltered] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [cls, allUsers] = await Promise.all([getAllClasses(), getAllUsers()]);
    const userMap: Record<string, UserProfile> = {};
    allUsers.forEach(u => { userMap[u.id] = u; });
    setClasses(cls);
    setUsers(userMap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(classes); return; }
    const q = search.toLowerCase();
    setFiltered(classes.filter(c =>
      c.name?.toLowerCase().includes(q) || c.class_code?.toLowerCase().includes(q)
    ));
  }, [classes, search]);

  const deleteClass = async (id: string, name: string) => {
    if (!confirm(`Delete class "${name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteClass(id);
      toast({ title: 'Class deleted', description: `"${name}" has been removed.` });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete class.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <GraduationCap className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Classes</h1>
          <span className="text-sm text-white/30 ml-1">({classes.length} total)</span>
        </div>
        <p className="text-white/40 text-sm">View all batches and their members.</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by class name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-rose-500/50"
        />
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))
          : filtered.map(cls => {
              const teacher = users[cls.teacher_id];
              const isExpanded = expandedId === cls.id;
              return (
                <div key={cls.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-white">{cls.name}</p>
                        <code className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40 font-mono">{cls.class_code}</code>
                      </div>
                      <p className="text-xs text-white/30 mt-0.5">
                        Teacher: <span className="text-white/50">{teacher?.name || cls.teacher_id}</span>
                        {' · '}
                        Created: {cls.created_at?.toDate?.()?.toLocaleDateString() || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-white/50">
                        <Users className="w-3.5 h-3.5" />
                        {cls.student_ids?.length ?? 0}
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteClass(cls.id, cls.name)}
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/5 px-6 py-4">
                      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Students</p>
                      {cls.student_ids?.length === 0 ? (
                        <p className="text-sm text-white/20">No students in this class.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {cls.student_ids.map(sid => {
                            const s = users[sid];
                            return (
                              <div key={sid} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                                  {s?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="text-xs text-white/60">{s?.name || sid}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/25">No classes found.</div>
        )}
      </div>
    </div>
  );
}
