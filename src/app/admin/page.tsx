'use client';

import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, HelpCircle, ClipboardList, FileCheck, TrendingUp, Clock, Activity } from 'lucide-react';
import { getAllUsers, getAllClasses, getAllMaterials, getAllQuestions, getAllQuizzes, getAllQuizAttempts } from '@/lib/firestore-helpers';
import type { UserProfile } from '@/lib/types';

interface Stats {
  students: number;
  teachers: number;
  classes: number;
  materials: number;
  questions: number;
  quizzes: number;
  attempts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [users, classes, materials, questions, quizzes, attempts] = await Promise.all([
        getAllUsers(),
        getAllClasses(),
        getAllMaterials(),
        getAllQuestions(),
        getAllQuizzes(),
        getAllQuizAttempts(),
      ]);
      setStats({
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        classes: classes.length,
        materials: materials.length,
        questions: questions.length,
        quizzes: quizzes.length,
        attempts: attempts.length,
      });
      // Sort by created_at descending, take top 6
      const sorted = [...users].sort((a, b) => {
        const aTime = a.created_at?.toMillis?.() ?? 0;
        const bTime = b.created_at?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setRecentUsers(sorted.slice(0, 6));
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Students', value: stats?.students ?? 0, icon: Users, color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
    { label: 'Teachers', value: stats?.teachers ?? 0, icon: GraduationCap, color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
    { label: 'Classes', value: stats?.classes ?? 0, icon: Activity, color: 'from-violet-500/20 to-violet-600/5', iconColor: 'text-violet-400', border: 'border-violet-500/20' },
    { label: 'Materials', value: stats?.materials ?? 0, icon: BookOpen, color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400', border: 'border-amber-500/20' },
    { label: 'Questions', value: stats?.questions ?? 0, icon: HelpCircle, color: 'from-cyan-500/20 to-cyan-600/5', iconColor: 'text-cyan-400', border: 'border-cyan-500/20' },
    { label: 'Quizzes', value: stats?.quizzes ?? 0, icon: ClipboardList, color: 'from-rose-500/20 to-rose-600/5', iconColor: 'text-rose-400', border: 'border-rose-500/20' },
    { label: 'Quiz Attempts', value: stats?.attempts ?? 0, icon: FileCheck, color: 'from-orange-500/20 to-orange-600/5', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-white/40 text-sm">Complete overview of PhysixAcademy platform activity.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon, color, iconColor, border }) => (
            <div key={label} className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-5 flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <span className="text-3xl font-bold text-white">{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Users */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Recently Joined Users</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    <div className="h-2.5 w-48 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))
            : recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    u.role === 'teacher' ? 'bg-emerald-500/20 text-emerald-400' :
                    u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {u.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/30 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400' :
                    u.role === 'admin' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-white/20 hidden sm:block">
                    {u.last_active?.toDate?.()?.toLocaleDateString?.() || '—'}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
