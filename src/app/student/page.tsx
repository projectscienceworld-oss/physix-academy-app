'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMaterialsForBatch, getQuizzesForBatch, getLiveClassesForBatch, getStudentAttempts } from '@/lib/firestore-helpers';
import { NotificationBell } from '@/components/layout/notification-bell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Video, Calendar, TrendingUp, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { Quiz, LiveClass } from '@/lib/types';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ materialsTotal: 0, materialsCompleted: 0, quizzesDone: 0, quizzesTotal: 0, avgScore: 0 });
  const [upcomingQuiz, setUpcomingQuiz] = useState<Quiz | null>(null);
  const [nextClass, setNextClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) { setLoading(false); return; }
    const batchId = userProfile.batch_ids[0];
    (async () => {
      const [materials, quizzes, liveClasses, attempts] = await Promise.all([
        getMaterialsForBatch(batchId),
        getQuizzesForBatch(batchId),
        getLiveClassesForBatch(batchId),
        getStudentAttempts(userProfile.id),
      ]);
      const completed = materials.filter(m => m.completed_by?.includes(userProfile.id)).length;
      const attemptedQuizIds = new Set(attempts.map(a => a.quiz_id));
      const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
      setStats({ materialsTotal: materials.length, materialsCompleted: completed, quizzesDone: attemptedQuizIds.size, quizzesTotal: quizzes.length, avgScore });
      const now = new Date();
      const upcoming = quizzes.filter(q => q.status === 'published' && !attemptedQuizIds.has(q.id)).find(q => q.scheduled_close?.toDate ? q.scheduled_close.toDate() > now : true);
      setUpcomingQuiz(upcoming || null);
      const nextLive = liveClasses.filter(l => l.scheduled_time?.toDate ? l.scheduled_time.toDate() > now : false).sort((a, b) => a.scheduled_time.toMillis() - b.scheduled_time.toMillis())[0];
      setNextClass(nextLive || null);
      setLoading(false);
    })();
  }, [userProfile]);

  useEffect(() => {
    if (!nextClass?.scheduled_time) return;
    const update = () => {
      const diff = nextClass.scheduled_time.toDate().getTime() - Date.now();
      if (diff <= 0) { setCountdown('Starting now!'); return; }
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [nextClass]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">
            Hello, <span className="text-brand-cobalt">{userProfile?.name?.split(' ')[0] || 'Student'}</span>!
          </h1>
          <p className="text-muted-foreground mt-2">Keep up the great work.</p>
        </div>
        <NotificationBell />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-24" />)
        ) : (
          <>
            <Card className="glass-card"><CardContent className="p-5 flex items-center gap-3">
              <div className="bg-brand-cobalt/10 p-2.5 rounded-xl"><BookOpen className="w-5 h-5 text-brand-cobalt" /></div>
              <div><p className="text-xs text-muted-foreground">Materials</p><p className="text-2xl font-bold">{stats.materialsCompleted}/{stats.materialsTotal}</p></div>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="p-5 flex items-center gap-3">
              <div className="bg-amber-400/10 p-2.5 rounded-xl"><Trophy className="w-5 h-5 text-amber-400" /></div>
              <div><p className="text-xs text-muted-foreground">Quizzes Done</p><p className="text-2xl font-bold">{stats.quizzesDone}/{stats.quizzesTotal}</p></div>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="p-5 flex items-center gap-3">
              <div className="bg-emerald-400/10 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
              <div><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-2xl font-bold">{stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}</p></div>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="p-5 flex items-center gap-3">
              <div className="bg-brand-azure/10 p-2.5 rounded-xl"><CheckCircle2 className="w-5 h-5 text-brand-azure" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{stats.materialsTotal > 0 ? `${Math.round((stats.materialsCompleted / stats.materialsTotal) * 100)}%` : '—'}</p>
              </div>
            </CardContent></Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Live Class */}
        {nextClass && (
          <Card className="glass-card overflow-hidden border-brand-cobalt/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-400">LIVE IN</span>
              </div>
              <div className="text-3xl font-headline font-bold mb-2">{countdown}</div>
              <h3 className="text-lg font-semibold mb-4">{nextClass.title}</h3>
              <Button asChild className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl">
                <Link href="/student/live">Join Class →</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Quiz */}
        {upcomingQuiz && (
          <Card className="glass-card overflow-hidden border-amber-400/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">QUIZ OPEN</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{upcomingQuiz.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{upcomingQuiz.topic} · {upcomingQuiz.time_limit} minutes</p>
              <Button asChild className="bg-amber-500 hover:bg-amber-500/90 rounded-xl text-white">
                <Link href="/student/quizzes">Take Quiz →</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { href: '/student/library', label: 'Study Library', icon: BookOpen, color: 'brand-cobalt' },
          { href: '/student/quizzes', label: 'Quizzes', icon: Trophy, color: 'amber-400' },
          { href: '/student/live', label: 'Live Classes', icon: Video, color: 'red-400' },
          { href: '/student/routine', label: 'My Schedule', icon: Calendar, color: 'emerald-400' },
          { href: '/student/numericals', label: 'Numericals', icon: TrendingUp, color: 'brand-azure' },
          { href: '/student/simulations', label: 'Simulations', icon: ArrowRight, color: 'purple-400' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="glass-card hover:border-brand-cobalt/30 transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`bg-${color}/10 p-2.5 rounded-xl flex-shrink-0`}>
                  <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                <span className="font-medium text-sm group-hover:text-brand-cobalt transition-colors">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
