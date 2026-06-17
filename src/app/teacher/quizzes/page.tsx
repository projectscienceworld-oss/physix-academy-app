'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getQuestions, getQuizzesForBatch, addQuiz, updateQuiz, deleteQuiz, getAttemptsByQuiz } from '@/lib/firestore-helpers';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Trash2, Trophy, CheckSquare, Square, BarChart2, Users, Clock } from 'lucide-react';
import type { Class, Question, Quiz, QuizStatus, Difficulty, PhysicsTopic } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const TOPICS: PhysicsTopic[] = ['Mechanics','Waves','Electromagnetism','Optics','Quantum','Thermodynamics','Modern Physics'];
const DIFF_LABELS: Record<Difficulty, string> = { 1: 'Conceptual', 2: 'Applied', 3: 'Intermediate', 4: 'Advanced' };

export default function QuizzesPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [analyticsQuiz, setAnalyticsQuiz] = useState<Quiz | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ attempts: any[], questions: Question[] } | null>(null);

  // Form
  const [form, setForm] = useState({
    title: '', batch_id: '', topic: 'Mechanics' as PhysicsTopic, difficulty: 1 as Difficulty,
    time_limit: 30, scheduled_open: '', scheduled_close: '',
    status: 'draft' as QuizStatus, show_explanations: true,
    selected_question_ids: [] as string[],
  });

  useEffect(() => {
    if (!userProfile) return;
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    const [cls, qs] = await Promise.all([getTeacherClasses(userProfile.id), getQuestions(userProfile.id)]);
    setClasses(cls);
    setQuestions(qs);
    const batchId = selectedBatch || cls[0]?.id || '';
    if (batchId) {
      const qzs = await getQuizzesForBatch(batchId);
      setQuizzes(qzs);
      setForm(f => ({ ...f, batch_id: batchId }));
      setSelectedBatch(batchId);
    }
    setLoading(false);
  };

  const toggleQuestion = (id: string) => {
    setForm(f => ({
      ...f,
      selected_question_ids: f.selected_question_ids.includes(id)
        ? f.selected_question_ids.filter(x => x !== id)
        : [...f.selected_question_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.batch_id || form.selected_question_ids.length === 0) {
      toast({ title: 'Fill title, batch, and select at least one question', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      await addQuiz({
        title: form.title, batch_id: form.batch_id, topic: form.topic, difficulty: form.difficulty,
        question_ids: form.selected_question_ids, time_limit: form.time_limit,
        scheduled_open: Timestamp.fromDate(new Date(form.scheduled_open || Date.now())),
        scheduled_close: Timestamp.fromDate(new Date(form.scheduled_close || Date.now() + 86400000)),
        status: form.status, show_explanations: form.show_explanations, created_by: userProfile!.id,
      });
      // Notify if published
      if (form.status === 'published') {
        await addDoc(collection(db, 'notifications'), {
          batch_id: form.batch_id, type: 'quiz_published',
          title: 'New Quiz Available!', message: `"${form.title}" is now open. Good luck!`,
          created_at: serverTimestamp(), read_by: [],
        });
      }
      toast({ title: '✅ Quiz saved!' });
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (quiz: Quiz) => {
    const next = quiz.status === 'draft' ? 'published' : 'draft';
    await updateQuiz(quiz.id, { status: next });
    setQuizzes(qs => qs.map(q => q.id === quiz.id ? { ...q, status: next } : q));
    if (next === 'published') {
      await addDoc(collection(db, 'notifications'), {
        batch_id: quiz.batch_id, type: 'quiz_published',
        title: 'New Quiz Available!', message: `"${quiz.title}" is now open!`,
        created_at: serverTimestamp(), read_by: [],
      });
    }
    toast({ title: `Quiz ${next}` });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    await deleteQuiz(id);
    setQuizzes(qs => qs.filter(q => q.id !== id));
    toast({ title: 'Deleted' });
  };

  const showAnalytics = async (quiz: Quiz) => {
    setAnalyticsQuiz(quiz);
    const [attempts, qs] = await Promise.all([
      getAttemptsByQuiz(quiz.id),
      Promise.resolve(questions.filter(q => quiz.question_ids.includes(q.id))),
    ]);
    setAnalyticsData({ attempts, questions: qs });
  };

  const filteredQ = questions.filter(q =>
    (form.topic === 'all' || q.topic === form.topic)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Quiz Builder</h1>
          <p className="text-muted-foreground mt-1">Create and schedule quizzes for your students.</p>
        </div>
        <Button onClick={() => setShowForm(s => !s)} className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-11 px-5 rounded-xl">
          {showForm ? <><X className="mr-2 w-4 h-4" />Cancel</> : <><Plus className="mr-2 w-4 h-4" />New Quiz</>}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="glass-card border-brand-cobalt/30">
          <CardHeader><CardTitle>New Quiz</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Mechanics Mid-Term" className="bg-white/5 border-white/10 h-10" />
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <select value={form.batch_id} onChange={e => setForm(f => ({ ...f, batch_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Topic Filter (for question selection)</Label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value as PhysicsTopic }))}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input type="number" value={form.time_limit} onChange={e => setForm(f => ({ ...f, time_limit: +e.target.value }))}
                  min={5} max={180} className="bg-white/5 border-white/10 h-10" />
              </div>
              <div className="space-y-2">
                <Label>Opens At</Label>
                <Input type="datetime-local" value={form.scheduled_open} onChange={e => setForm(f => ({ ...f, scheduled_open: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10" />
              </div>
              <div className="space-y-2">
                <Label>Closes At</Label>
                <Input type="datetime-local" value={form.scheduled_close} onChange={e => setForm(f => ({ ...f, scheduled_close: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_explanations} onChange={e => setForm(f => ({ ...f, show_explanations: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm">Show explanations to students after submission</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.status === 'published'} onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'published' : 'draft' }))} className="w-4 h-4" />
                <span className="text-sm">Publish immediately</span>
              </label>
            </div>

            {/* Question selection */}
            <div className="space-y-2">
              <Label>Select Questions ({form.selected_question_ids.length} selected)</Label>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredQ.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions in this topic. Add them in Question Bank first.</p>
                ) : filteredQ.map(q => (
                  <div key={q.id} onClick={() => toggleQuestion(q.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${form.selected_question_ids.includes(q.id) ? 'border-brand-cobalt bg-brand-cobalt/10' : 'border-white/10 hover:border-white/20'}`}>
                    {form.selected_question_ids.includes(q.id) ? <CheckSquare className="w-4 h-4 text-brand-cobalt mt-0.5 flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{q.question_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{DIFF_LABELS[q.difficulty]} · {q.type.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-11">
              {saving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Modal */}
      {analyticsQuiz && analyticsData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setAnalyticsQuiz(null); setAnalyticsData(null); }}>
          <div className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{analyticsQuiz.title} — Analytics</h3>
              <button onClick={() => { setAnalyticsQuiz(null); setAnalyticsData(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{analyticsData.attempts.length}</p>
                <p className="text-xs text-muted-foreground">Attempts</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">
                  {analyticsData.attempts.length > 0 ? Math.round(analyticsData.attempts.reduce((s, a) => s + a.score, 0) / analyticsData.attempts.length) : '—'}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{analyticsData.questions.length}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
            <div className="space-y-2">
              {analyticsData.questions.map(q => {
                const correct = analyticsData.attempts.filter(a => a.answers?.[q.id] === q.correct_answer).length;
                const pct = analyticsData.attempts.length ? Math.round((correct / analyticsData.attempts.length) * 100) : 0;
                return (
                  <div key={q.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-4">{q.question_text.slice(0, 60)}...</span>
                      <span className="font-medium flex-shrink-0">{pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-cobalt rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)
        ) : quizzes.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No quizzes yet. Create your first one above.</p>
          </CardContent></Card>
        ) : (
          quizzes.map(quiz => (
            <Card key={quiz.id} className="glass-card hover:border-brand-cobalt/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${quiz.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                        {quiz.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{quiz.question_ids.length} questions · {quiz.time_limit} min · {quiz.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => showAnalytics(quiz)} className="h-9 rounded-xl">
                      <BarChart2 className="w-4 h-4 mr-1" />Stats
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(quiz)} className="h-9 rounded-xl">
                      {quiz.status === 'draft' ? 'Publish' : 'Unpublish'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
