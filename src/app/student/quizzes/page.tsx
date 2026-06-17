'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizzesForBatch, getQuestionsByIds, submitQuizAttempt, getStudentAttemptForQuiz, getStudentAttempts } from '@/lib/firestore-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Quiz, Question, QuizAttempt } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

type QuizView = 'list' | 'taking' | 'result';

function QuizTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  const m = Math.floor(remaining / 60), s = remaining % 60;
  const pct = (remaining / seconds) * 100;
  return (
    <div className={`flex items-center gap-3 ${remaining < 60 ? 'text-red-400' : 'text-muted-foreground'}`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-bold text-lg">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${remaining < 60 ? 'bg-red-400' : 'bg-brand-cobalt'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StudentQuizzesPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [view, setView] = useState<QuizView>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Taking quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [lastQuestions, setLastQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) { setLoading(false); return; }
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    const [qzs, atts] = await Promise.all([
      getQuizzesForBatch(userProfile.batch_ids[0]),
      getStudentAttempts(userProfile.id),
    ]);
    const now = new Date();
    const open = qzs.filter(q => q.status === 'published' && q.scheduled_close?.toDate ? q.scheduled_close.toDate() > now : true);
    setQuizzes(open);
    setAttempts(atts);
    setLoading(false);
  };

  const startQuiz = async (quiz: Quiz) => {
    const qs = await getQuestionsByIds(quiz.question_ids);
    setActiveQuiz(quiz);
    setQuestions(qs);
    setAnswers({});
    setCurrentQ(0);
    setStartTime(Date.now());
    setView('taking');
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!activeQuiz || !userProfile || submitting) return;
    setSubmitting(true);
    if (auto) toast({ title: '⏰ Time\'s up! Submitting automatically...' });
    try {
      const qs = await getQuestionsByIds(activeQuiz.question_ids);
      let correct = 0;
      qs.forEach(q => { if (answers[q.id] === q.correct_answer) correct++; });
      const score = Math.round((correct / qs.length) * 100);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      await submitQuizAttempt({
        quiz_id: activeQuiz.id, student_id: userProfile.id,
        answers, score, time_taken: timeTaken,
      });
      const attempt: QuizAttempt = {
        id: 'new', quiz_id: activeQuiz.id, student_id: userProfile.id,
        answers, score, time_taken: timeTaken, submitted_at: Timestamp.now(),
      };
      setLastAttempt(attempt);
      setLastQuestions(qs);
      setView('result');
      await loadData();
    } catch (err: any) {
      toast({ title: 'Submit failed', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  }, [activeQuiz, userProfile, answers, startTime, submitting]);

  const attemptedIds = new Set(attempts.map(a => a.quiz_id));

  // Score trend chart data
  const chartData = attempts.slice().reverse().slice(-8).map((a, i) => ({
    name: `Quiz ${i + 1}`, score: a.score,
  }));

  if (view === 'taking' && activeQuiz && questions.length > 0) {
    const q = questions[currentQ];
    const answered = Object.keys(answers).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{activeQuiz.title}</h2>
            <p className="text-sm text-muted-foreground">{currentQ + 1} / {questions.length}</p>
          </div>
          <QuizTimer seconds={activeQuiz.time_limit * 60} onExpire={() => handleSubmit(true)} />
        </div>

        <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2" />

        <Card className="glass-card border-brand-cobalt/20">
          <CardContent className="p-6 space-y-6">
            <p className="text-lg font-medium leading-relaxed">{q.question_text}</p>
            {q.image_url && <img src={q.image_url} alt="question" className="rounded-xl max-h-48 object-contain" />}

            {q.type === 'mcq' ? (
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                      answers[q.id] === opt
                        ? 'border-brand-cobalt bg-brand-cobalt/10 text-brand-cobalt'
                        : 'border-white/10 hover:border-white/30'
                    }`}>
                    <span className="mr-3 font-bold text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Your answer:</label>
                <input type="text" value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Enter your numerical answer..."
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-brand-cobalt focus:outline-none text-lg font-mono" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}
            className="rounded-xl border-white/10">
            <ArrowLeft className="mr-2 w-4 h-4" />Previous
          </Button>
          <span className="text-sm text-muted-foreground">{answered} / {questions.length} answered</span>
          {currentQ < questions.length - 1 ? (
            <Button onClick={() => setCurrentQ(c => c + 1)} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl">
              Next<ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => handleSubmit()} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-600/90 rounded-xl">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'result' && lastAttempt && activeQuiz) {
    const score = lastAttempt.score;
    const mins = Math.floor(lastAttempt.time_taken / 60), secs = lastAttempt.time_taken % 60;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="text-center py-8">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold ${
            score >= 70 ? 'bg-emerald-400/10 text-emerald-400' : score >= 40 ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'
          }`}>{score}%</div>
          <h2 className="text-2xl font-bold">{score >= 70 ? '🎉 Well Done!' : score >= 40 ? '📚 Keep Practicing!' : '💪 Try Again!'}</h2>
          <p className="text-muted-foreground mt-2">Completed in {mins}m {secs}s</p>
        </div>

        {activeQuiz.show_explanations && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Review</h3>
            {lastQuestions.map(q => {
              const isCorrect = lastAttempt.answers[q.id] === q.correct_answer;
              return (
                <Card key={q.id} className={`glass-card border ${isCorrect ? 'border-emerald-400/20' : 'border-red-400/20'}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                      <p className="text-sm">{q.question_text}</p>
                    </div>
                    {!isCorrect && <p className="text-xs text-muted-foreground ml-8">Your answer: <span className="text-red-400">{lastAttempt.answers[q.id] || 'Not answered'}</span></p>}
                    <p className="text-xs ml-8">Correct: <span className="text-emerald-400 font-medium">{q.correct_answer}</span></p>
                    {q.explanation && <p className="text-xs text-muted-foreground ml-8 bg-white/5 p-2 rounded-lg">{q.explanation}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Button onClick={() => { setView('list'); setActiveQuiz(null); }} className="w-full bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-12">
          Back to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-headline font-bold">Quizzes</h1>

      {/* Score trend */}
      {chartData.length > 1 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" />Score History</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="transparent" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="transparent" />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quiz list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : quizzes.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No quizzes open right now. Check back later!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => {
            const attempted = attemptedIds.has(quiz.id);
            const myAttempt = attempts.find(a => a.quiz_id === quiz.id);
            const closesAt = quiz.scheduled_close?.toDate ? quiz.scheduled_close.toDate() : null;
            return (
              <Card key={quiz.id} className={`glass-card hover:border-brand-cobalt/30 transition-all ${attempted ? 'opacity-75' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${attempted ? 'bg-emerald-400/10' : 'bg-amber-400/10'}`}>
                      <Trophy className={`w-5 h-5 ${attempted ? 'text-emerald-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {quiz.topic} · {quiz.question_ids.length} questions · {quiz.time_limit} min
                        {closesAt && <> · Closes {closesAt.toLocaleDateString()}</>}
                      </p>
                      {attempted && myAttempt && (
                        <p className="text-xs text-emerald-400 mt-0.5">✓ Score: {myAttempt.score}%</p>
                      )}
                    </div>
                    {!attempted ? (
                      <Button size="sm" onClick={() => startQuiz(quiz)} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl flex-shrink-0">
                        Start <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-400 flex-shrink-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Done</span>
                    )}
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
