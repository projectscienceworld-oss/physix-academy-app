'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Search, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { getAllQuizzes, getAllQuizAttempts, getAllClasses, adminDeleteQuiz } from '@/lib/firestore-helpers';
import type { Quiz, QuizAttempt, Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/5 text-white/40',
  published: 'bg-emerald-500/10 text-emerald-400',
};

const DIFFICULTY_LABELS: Record<number, string> = { 1: 'Conceptual', 2: 'Applied', 3: 'Intermediate', 4: 'Advanced' };

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [classes, setClasses] = useState<Record<string, Class>>({});
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [qzs, atts, cls] = await Promise.all([getAllQuizzes(), getAllQuizAttempts(), getAllClasses()]);
    const classMap: Record<string, Class> = {};
    cls.forEach(c => { classMap[c.id] = c; });
    setQuizzes(qzs);
    setAttempts(atts);
    setClasses(classMap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(quizzes); return; }
    const q = search.toLowerCase();
    setFiltered(quizzes.filter(qz => qz.title?.toLowerCase().includes(q) || qz.topic?.toLowerCase().includes(q)));
  }, [quizzes, search]);

  const getQuizStats = (quizId: string) => {
    const qAttempts = attempts.filter(a => a.quiz_id === quizId);
    if (!qAttempts.length) return { count: 0, avg: null };
    const avg = qAttempts.reduce((sum, a) => sum + a.score, 0) / qAttempts.length;
    return { count: qAttempts.length, avg: Math.round(avg) };
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete quiz "${title}"? This cannot be undone.`)) return;
    try {
      await adminDeleteQuiz(id);
      toast({ title: 'Quiz deleted' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete quiz.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <span className="text-sm text-white/30 ml-1">({quizzes.length} total)</span>
        </div>
        <p className="text-white/40 text-sm">All quizzes with attempt counts and average scores.</p>
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

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))
          : filtered.map(qz => {
              const isExpanded = expandedId === qz.id;
              const stats = getQuizStats(qz.id);
              const cls = classes[qz.batch_id];
              return (
                <div key={qz.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white">{qz.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[qz.status]}`}>
                          {qz.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-white/30">{qz.topic}</span>
                        <span className="text-xs text-white/30">{DIFFICULTY_LABELS[qz.difficulty]}</span>
                        <span className="text-xs text-white/30">Class: {cls?.name || qz.batch_id.slice(0, 8)}</span>
                        <span className="text-xs text-white/30">{qz.time_limit} min · {qz.question_ids?.length ?? 0} Qs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1 text-white/50 text-xs justify-end">
                          <Users className="w-3 h-3" />
                          {stats.count} attempts
                        </div>
                        {stats.avg !== null ? (
                          <p className={`text-sm font-bold ${stats.avg >= 70 ? 'text-emerald-400' : stats.avg >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {stats.avg}% avg
                          </p>
                        ) : (
                          <p className="text-xs text-white/20">No attempts</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : qz.id)}
                          className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(qz.id, qz.title)}
                          className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/5 px-5 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: 'Attempts', value: stats.count },
                          { label: 'Avg Score', value: stats.avg !== null ? `${stats.avg}%` : '—' },
                          { label: 'Time Limit', value: `${qz.time_limit} min` },
                          { label: 'Questions', value: qz.question_ids?.length ?? 0 },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg bg-white/5 px-4 py-3">
                            <p className="text-xs text-white/30 mb-1">{label}</p>
                            <p className="text-lg font-bold text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/40">
                        <div>Opens: {qz.scheduled_open?.toDate?.()?.toLocaleString() || '—'}</div>
                        <div>Closes: {qz.scheduled_close?.toDate?.()?.toLocaleString() || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/25">No quizzes found.</div>
        )}
      </div>
    </div>
  );
}
