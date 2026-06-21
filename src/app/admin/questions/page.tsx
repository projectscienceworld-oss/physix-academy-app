'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { HelpCircle, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllQuestions, getAllUsers, adminDeleteQuestion } from '@/lib/firestore-helpers';
import type { Question, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const DIFFICULTY_LABELS: Record<number, string> = { 1: 'Conceptual', 2: 'Applied', 3: 'Intermediate', 4: 'Advanced' };
const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/10 text-emerald-400',
  2: 'bg-blue-500/10 text-blue-400',
  3: 'bg-amber-500/10 text-amber-400',
  4: 'bg-rose-500/10 text-rose-400',
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [filtered, setFiltered] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [qs, allUsers] = await Promise.all([getAllQuestions(), getAllUsers()]);
    const userMap: Record<string, UserProfile> = {};
    allUsers.forEach(u => { userMap[u.id] = u; });
    setQuestions(qs);
    setUsers(userMap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(questions); return; }
    const q = search.toLowerCase();
    setFiltered(questions.filter(qn =>
      qn.question_text?.toLowerCase().includes(q) || qn.topic?.toLowerCase().includes(q)
    ));
  }, [questions, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    try {
      await adminDeleteQuestion(id);
      toast({ title: 'Question deleted' });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete question.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <HelpCircle className="w-5 h-5 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Questions</h1>
          <span className="text-sm text-white/30 ml-1">({questions.length} total)</span>
        </div>
        <p className="text-white/40 text-sm">All MCQ and numerical questions in the question bank.</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by question text or topic…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-rose-500/50"
        />
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))
          : filtered.map(q => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0 flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === 'mcq' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'}`}>
                          {q.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 line-clamp-1">{q.question_text}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-white/30">{q.topic}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[q.difficulty]}`}>
                            {DIFFICULTY_LABELS[q.difficulty]}
                          </span>
                          <span className="text-xs text-white/20">
                            by {users[q.created_by]?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/5 px-5 py-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Question</p>
                        <p className="text-sm text-white/70">{q.question_text}</p>
                      </div>
                      {q.type === 'mcq' && q.options?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Options</p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, idx) => (
                              <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${opt === q.correct_answer ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-white/[0.03] text-white/50'}`}>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 flex-shrink-0">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                                {opt === q.correct_answer && <span className="ml-auto text-xs">✓ Correct</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {q.type === 'numerical' && (
                        <div>
                          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Answer</p>
                          <p className="text-sm text-emerald-400 font-mono">{q.correct_answer}</p>
                        </div>
                      )}
                      {q.explanation && (
                        <div>
                          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Explanation</p>
                          <p className="text-sm text-white/50">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/25">No questions found.</div>
        )}
      </div>
    </div>
  );
}
