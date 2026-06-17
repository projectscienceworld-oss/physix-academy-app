'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getQuestions, getUserProfile } from '@/lib/firestore-helpers';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle2, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question, PhysicsTopic } from '@/lib/types';

type Status = 'unsolved' | 'solved' | 'needs_revision';

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  unsolved: { label: 'Unsolved', color: 'text-muted-foreground', bg: 'bg-white/5' },
  solved: { label: 'Solved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  needs_revision: { label: 'Needs Revision', color: 'text-amber-400', bg: 'bg-amber-400/10' },
};

const TOPICS: PhysicsTopic[] = ['Mechanics','Waves','Electromagnetism','Optics','Quantum','Thermodynamics','Modern Physics'];

export default function NumericalsPracticePage() {
  const { userProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!userProfile) return;
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    // Fetch numericals from all teachers (students can read all questions)
    // We use the student's batch teacher's questions via a broad query
    // For this we read the numerical questions available to the student
    try {
      // Get teacher IDs from student's class
      const { getDocs, query, collection, where } = await import('firebase/firestore');
      const classSnaps = await getDocs(query(collection(db, 'classes'), where('student_ids', 'array-contains', userProfile.id)));
      const teacherIds = classSnaps.docs.map(d => d.data().teacher_id);
      
      let allNumericals: Question[] = [];
      for (const tid of teacherIds) {
        const snaps = await getDocs(query(collection(db, 'questions'), where('created_by', '==', tid), where('type', '==', 'numerical')));
        allNumericals.push(...snaps.docs.map(d => ({ id: d.id, ...d.data() }) as Question));
      }
      setQuestions(allNumericals);

      // Load per-student status from Firestore (stored in user doc's numericals_status field)
      const profile = await getUserProfile(userProfile.id);
      const savedStatuses: Record<string, Status> = (profile as any)?.numericals_status || {};
      setStatuses(savedStatuses);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (questionId: string, status: Status) => {
    if (!userProfile) return;
    const next = { ...statuses, [questionId]: status };
    setStatuses(next);
    await updateDoc(doc(db, 'users', userProfile.id), { numericals_status: next });
  };

  const filtered = questions.filter(q =>
    (filterTopic === 'all' || q.topic === filterTopic) &&
    (filterStatus === 'all' || (statuses[q.id] || 'unsolved') === filterStatus)
  );

  const counts = {
    solved: questions.filter(q => statuses[q.id] === 'solved').length,
    revision: questions.filter(q => statuses[q.id] === 'needs_revision').length,
    unsolved: questions.filter(q => !statuses[q.id] || statuses[q.id] === 'unsolved').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Numerical Practice</h1>
        <p className="text-muted-foreground mt-1">Step-by-step physics problems with LaTeX solutions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Solved', count: counts.solved, color: 'text-emerald-400', bg: 'bg-emerald-400/10', status: 'solved' as Status },
          { label: 'Revision', count: counts.revision, color: 'text-amber-400', bg: 'bg-amber-400/10', status: 'needs_revision' as Status },
          { label: 'Unsolved', count: counts.unsolved, color: 'text-muted-foreground', bg: 'bg-white/5', status: 'unsolved' as Status },
        ].map(({ label, count, color, bg, status }) => (
          <Card key={label} className="glass-card cursor-pointer hover:border-brand-cobalt/20 transition-all" onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}>
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mx-auto mb-2`}>
                <span className={`text-lg font-bold ${color}`}>{count}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="unsolved">Unsolved</option>
          <option value="solved">Solved</option>
          <option value="needs_revision">Needs Revision</option>
        </select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} problems</span>
      </div>

      {/* Problems */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No problems found. Try different filters.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const status = statuses[q.id] || 'unsolved';
            const cfg = STATUS_CONFIG[status];
            const isOpen = expanded === q.id;
            return (
              <Card key={q.id} className={`glass-card border transition-all ${status === 'solved' ? 'border-emerald-400/15' : status === 'needs_revision' ? 'border-amber-400/15' : 'border-white/10'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`}>
                      <Calculator className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-medium text-muted-foreground">{q.topic}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color} font-medium`}>{cfg.label}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{q.question_text}</p>
                        </div>
                        <button onClick={() => setExpanded(isOpen ? null : q.id)} className="text-muted-foreground flex-shrink-0 ml-2">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                          {q.key_formula && (
                            <div className="bg-brand-cobalt/10 border border-brand-cobalt/20 rounded-xl p-3">
                              <p className="text-xs text-brand-cobalt font-medium mb-1">Key Formula</p>
                              <p className="text-sm font-mono">{q.key_formula}</p>
                            </div>
                          )}
                          {q.solution_steps && q.solution_steps.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Step-by-step Solution</p>
                              {q.solution_steps.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <span className="w-6 h-6 rounded-full bg-brand-cobalt/20 text-brand-cobalt text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                  <p className="text-sm text-muted-foreground">{step}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3">
                            <p className="text-xs text-emerald-400 font-medium mb-1">Final Answer</p>
                            <p className="text-base font-bold">{q.correct_answer}</p>
                          </div>
                          {q.image_url && <img src={q.image_url} alt="diagram" className="rounded-xl max-h-48 object-contain" />}
                        </div>
                      )}

                      {/* Status buttons */}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => updateStatus(q.id, 'solved')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${status === 'solved' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-muted-foreground hover:bg-emerald-400/10 hover:text-emerald-400'}`}>
                          <CheckCircle2 className="w-3 h-3" />Solved
                        </button>
                        <button onClick={() => updateStatus(q.id, 'needs_revision')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${status === 'needs_revision' ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-muted-foreground hover:bg-amber-400/10 hover:text-amber-400'}`}>
                          <Clock className="w-3 h-3" />Revise
                        </button>
                        <button onClick={() => updateStatus(q.id, 'unsolved')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${status === 'unsolved' ? 'bg-white/10 text-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>
                          <RotateCcw className="w-3 h-3" />Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
