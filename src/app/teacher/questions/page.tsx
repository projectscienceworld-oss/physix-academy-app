'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getQuestions, addQuestion, deleteQuestion } from '@/lib/firestore-helpers';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Trash2, BookOpen, Upload } from 'lucide-react';
import type { Question, QuestionType, Difficulty, PhysicsTopic } from '@/lib/types';

const TOPICS: PhysicsTopic[] = ['Mechanics','Waves','Electromagnetism','Optics','Quantum','Thermodynamics','Modern Physics'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = { 1: 'Conceptual', 2: 'Applied', 3: 'Intermediate', 4: 'Advanced' };
const DIFF_COLORS: Record<Difficulty, string> = { 1: 'text-emerald-400 bg-emerald-400/10', 2: 'text-brand-azure bg-brand-azure/10', 3: 'text-amber-400 bg-amber-400/10', 4: 'text-rose-400 bg-rose-400/10' };

const emptyForm = {
  type: 'mcq' as QuestionType,
  topic: 'Mechanics' as PhysicsTopic,
  difficulty: 1 as Difficulty,
  question_text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  explanation: '',
  solution_steps: [''],
  key_formula: '',
  image_url: '',
};

export default function QuestionsPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!userProfile) return;
    loadQuestions();
  }, [userProfile]);

  const loadQuestions = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const qs = await getQuestions(userProfile.id);
      setQuestions(qs);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      toast({ title: 'Notice', description: 'Some questions could not be loaded. If this is a new project, you may need to create database indexes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;
    setImageUploading(true);
    try {
      const sRef = storageRef(storage, `question-images/${userProfile.id}/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setForm(f => ({ ...f, image_url: url }));
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.question_text || !userProfile) {
      toast({ title: 'Question text is required', variant: 'destructive' }); return;
    }
    if (form.type === 'mcq' && !form.correct_answer) {
      toast({ title: 'Select correct answer', variant: 'destructive' }); return;
    }
    setSaving(true);
    const questionData: any = {
      topic: form.topic,
      difficulty: form.difficulty,
      type: form.type,
      question_text: form.question_text,
      options: form.type === 'mcq' ? form.options : [],
      correct_answer: form.correct_answer,
      explanation: form.explanation,
      created_by: userProfile.id,
    };
    if (form.type === 'numerical') {
      const steps = form.solution_steps.filter(Boolean);
      if (steps.length > 0) questionData.solution_steps = steps;
      if (form.key_formula) questionData.key_formula = form.key_formula;
    }
    if (form.image_url) questionData.image_url = form.image_url;

    try {
      await addQuestion(questionData as any);
      toast({ title: '✅ Question saved!' });
      setForm(emptyForm);
      setShowForm(false);
      await loadQuestions();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion(id);
    setQuestions(q => q.filter(x => x.id !== id));
    toast({ title: 'Deleted' });
  };

  const filtered = questions.filter(q =>
    (filterTopic === 'all' || q.topic === filterTopic) &&
    (filterType === 'all' || q.type === filterType)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">{questions.length} questions · Supports LaTeX via KaTeX</p>
        </div>
        <Button onClick={() => setShowForm(s => !s)} className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-11 px-5 rounded-xl">
          {showForm ? <><X className="mr-2 w-4 h-4" />Cancel</> : <><Plus className="mr-2 w-4 h-4" />Add Question</>}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="glass-card border-brand-cobalt/30">
          <CardHeader><CardTitle>New Question</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Type / Topic / Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {(['mcq', 'numerical'] as QuestionType[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${form.type === t ? 'bg-brand-cobalt text-white border-brand-cobalt' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                      {t === 'mcq' ? 'MCQ' : 'Numerical'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value as PhysicsTopic }))}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="flex gap-1">
                  {([1,2,3,4] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.difficulty === d ? 'bg-brand-cobalt text-white border-brand-cobalt' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question text */}
            <div className="space-y-2">
              <Label>Question Text (LaTeX supported: wrap in $...$ or $$...$$)</Label>
              <textarea value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
                placeholder="e.g., A car of mass $m = 1200\text{ kg}$ ..."
                className="w-full h-28 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none resize-none" />
            </div>

            {/* MCQ Options */}
            {form.type === 'mcq' && (
              <div className="space-y-3">
                <Label>Options (click radio to mark correct)</Label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" name="correct" checked={form.correct_answer === opt && opt !== ''}
                      onChange={() => form.options[i] && setForm(f => ({ ...f, correct_answer: f.options[i] }))}
                      className="w-4 h-4 text-brand-cobalt" />
                    <Input placeholder={`Option ${i + 1}`} value={opt}
                      onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm(f => ({ ...f, options: opts })); }}
                      className="bg-white/5 border-white/10 focus:border-brand-cobalt h-10" />
                  </div>
                ))}
              </div>
            )}

            {/* Numerical fields */}
            {form.type === 'numerical' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Final Answer</Label>
                  <Input placeholder="e.g., 9600 N" value={form.correct_answer}
                    onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))}
                    className="bg-white/5 border-white/10 focus:border-brand-cobalt h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Key Formula (LaTeX)</Label>
                  <Input placeholder="e.g., $F_c = \frac{mv^2}{r}$" value={form.key_formula}
                    onChange={e => setForm(f => ({ ...f, key_formula: e.target.value }))}
                    className="bg-white/5 border-white/10 focus:border-brand-cobalt h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Solution Steps</Label>
                  {form.solution_steps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder={`Step ${i + 1}`} value={step}
                        onChange={e => { const s = [...form.solution_steps]; s[i] = e.target.value; setForm(f => ({ ...f, solution_steps: s })); }}
                        className="bg-white/5 border-white/10 focus:border-brand-cobalt h-10" />
                      {i === form.solution_steps.length - 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl"
                          onClick={() => setForm(f => ({ ...f, solution_steps: [...f.solution_steps, ''] }))}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explanation</Label>
              <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Explain the answer..."
                className="w-full h-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-brand-cobalt focus:outline-none resize-none" />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Diagram / Image (optional)</Label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-cobalt/10 file:text-brand-cobalt hover:file:bg-brand-cobalt/20 cursor-pointer" />
              {form.image_url && <img src={form.image_url} alt="preview" className="h-32 rounded-xl object-contain bg-white/5" />}
            </div>

            <Button onClick={handleSave} disabled={saving || imageUploading} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-11">
              {saving ? 'Saving...' : 'Save Question'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="numerical">Numerical</option>
        </select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} questions</span>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No questions match your filters.</p>
          </CardContent></Card>
        ) : (
          filtered.map(q => (
            <Card key={q.id} className="glass-card hover:border-brand-cobalt/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${DIFF_COLORS[q.difficulty]}`}>{DIFFICULTY_LABELS[q.difficulty]}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground">{q.topic}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground uppercase">{q.type}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{q.question_text}</p>
                    {q.type === 'mcq' && q.correct_answer && (
                      <p className="text-xs text-emerald-400 mt-1">✓ {q.correct_answer}</p>
                    )}
                    {q.type === 'numerical' && q.correct_answer && (
                      <p className="text-xs text-emerald-400 mt-1">Answer: {q.correct_answer}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
