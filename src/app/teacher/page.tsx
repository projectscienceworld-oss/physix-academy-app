'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getMaterialsForBatch, getQuizzesForBatch, getLiveClassesForBatch } from '@/lib/firestore-helpers';
import { NotificationBell } from '@/components/layout/notification-bell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, Trophy, Users, BarChart2, GraduationCap, Copy, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Class } from '@/lib/types';

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
      <div className="h-8 bg-white/10 rounded w-1/3" />
    </div>
  );
}

export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({ students: 0, materials: 0, quizzes: 0, liveClasses: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      const cls = await getTeacherClasses(userProfile.id);
      setClasses(cls);
      if (cls.length > 0) {
        const batchId = cls[0].id;
        const [materials, quizzes, live] = await Promise.all([
          getMaterialsForBatch(batchId),
          getQuizzesForBatch(batchId),
          getLiveClassesForBatch(batchId),
        ]);
        const totalStudents = cls.reduce((sum, c) => sum + c.student_ids.length, 0);
        setStats({ students: totalStudents, materials: materials.length, quizzes: quizzes.length, liveClasses: live.length });
      }
      setLoading(false);
    })();
  }, [userProfile]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">
            Welcome, <span className="text-amber-400">{userProfile?.name?.split(' ')[0] || 'Teacher'}</span>
          </h1>
          <p className="text-muted-foreground mt-2">Here's your classroom overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button asChild className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-12 px-6 rounded-xl font-medium">
            <Link href="/teacher/materials"><Upload className="mr-2 w-5 h-5" />Upload Material</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {[
              { label: 'Total Students', value: stats.students, icon: Users, color: 'text-brand-cobalt', bg: 'bg-brand-cobalt/10' },
              { label: 'Materials', value: stats.materials, icon: Upload, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Quizzes', value: stats.quizzes, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { label: 'Live Classes', value: stats.liveClasses, icon: BarChart2, color: 'text-brand-azure', bg: 'bg-brand-azure/10' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="glass-card">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`${bg} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Classes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold">Your Classes</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-24" />)}
          </div>
        ) : classes.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No classes yet. Create one from your profile settings.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map(cls => (
              <Card key={cls.id} className="glass-card hover:border-brand-cobalt/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cls.student_ids.length} students enrolled</p>
                    </div>
                    <button
                      onClick={() => copyCode(cls.class_code)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand-cobalt/10 border border-brand-cobalt/20 rounded-lg text-brand-cobalt text-sm font-mono font-bold hover:bg-brand-cobalt/20 transition-colors flex-shrink-0"
                    >
                      {copiedCode === cls.class_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {cls.class_code}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/teacher/materials', label: 'Upload New Material', icon: Upload, desc: 'Add videos, PDFs or links', color: 'brand-cobalt' },
            { href: '/teacher/questions', label: 'Add Questions', icon: BookOpen, desc: 'Build your question bank', color: 'emerald-400' },
            { href: '/teacher/quizzes', label: 'Create Quiz', icon: Trophy, desc: 'Schedule a new quiz', color: 'amber-400' },
            { href: '/teacher/live', label: 'Schedule Live Class', icon: Users, desc: 'Add meeting link & time', color: 'brand-azure' },
            { href: '/teacher/routine', label: 'Edit Routine', icon: BarChart2, desc: 'Update weekly schedule', color: 'purple-400' },
            { href: '/teacher/students', label: 'View Progress', icon: GraduationCap, desc: 'Check student activity', color: 'rose-400' },
          ].map(({ href, label, icon: Icon, desc, color }) => (
            <Link key={href} href={href}>
              <Card className="glass-card hover:border-brand-cobalt/30 transition-all cursor-pointer group h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`bg-${color}/10 p-3 rounded-xl flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-brand-cobalt transition-colors">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
