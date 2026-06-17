'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getMaterialsForBatch, getQuizzesForBatch, getAttemptsByQuiz } from '@/lib/firestore-helpers';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Users, CheckCircle2, Trophy } from 'lucide-react';
import type { Class, UserProfile, Material, Quiz, QuizAttempt } from '@/lib/types';

interface StudentRow {
  profile: UserProfile;
  materialsCompleted: number;
  totalMaterials: number;
  quizzesAttempted: number;
  totalQuizzes: number;
  avgScore: number;
  lastActive: Date | null;
}

export default function StudentsPage() {
  const { userProfile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userProfile) loadData(); }, [userProfile]);

  const loadData = async (batchId?: string) => {
    if (!userProfile) return;
    setLoading(true);
    const cls = await getTeacherClasses(userProfile.id);
    setClasses(cls);
    const bid = batchId || selectedBatch || cls[0]?.id || '';
    setSelectedBatch(bid);
    if (!bid) { setLoading(false); return; }

    const batchClass = cls.find(c => c.id === bid);
    if (!batchClass) { setLoading(false); return; }

    // Fetch materials and quizzes for this batch
    const [materials, quizzes] = await Promise.all([
      getMaterialsForBatch(bid),
      getQuizzesForBatch(bid),
    ]);

    // Fetch all quiz attempts for this batch's quizzes
    const allAttempts: QuizAttempt[] = [];
    for (const quiz of quizzes) {
      const attempts = await getAttemptsByQuiz(quiz.id);
      allAttempts.push(...attempts);
    }

    // Fetch student profiles
    const studentRows: StudentRow[] = [];
    for (const studentId of batchClass.student_ids) {
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', studentId)));
      const profile = userDoc.empty ? null : { id: userDoc.docs[0].id, ...userDoc.docs[0].data() } as UserProfile;
      if (!profile) continue;

      const completed = materials.filter(m => m.completed_by?.includes(studentId)).length;
      const studentAttempts = allAttempts.filter(a => a.student_id === studentId);
      const attempted = new Set(studentAttempts.map(a => a.quiz_id)).size;
      const avgScore = studentAttempts.length > 0
        ? Math.round(studentAttempts.reduce((s, a) => s + a.score, 0) / studentAttempts.length)
        : 0;
      const lastActive = profile.last_active?.toDate ? profile.last_active.toDate() : null;

      studentRows.push({
        profile,
        materialsCompleted: completed,
        totalMaterials: materials.length,
        quizzesAttempted: attempted,
        totalQuizzes: quizzes.length,
        avgScore,
        lastActive,
      });
    }

    // Sort by last active
    studentRows.sort((a, b) => (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0));
    setRows(studentRows);
    setLoading(false);
  };

  const handleBatchChange = (bid: string) => {
    setSelectedBatch(bid);
    loadData(bid);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Student Progress</h1>
          <p className="text-muted-foreground mt-1">Track learning activity and quiz performance per student.</p>
        </div>
        {classes.length > 1 && (
          <select value={selectedBatch} onChange={e => handleBatchChange(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No students enrolled yet. Share your class code!</p>
        </CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-white/10">
                <th className="pb-3 pr-4 font-medium">Student</th>
                <th className="pb-3 pr-4 font-medium text-center">Materials</th>
                <th className="pb-3 pr-4 font-medium text-center">Quizzes</th>
                <th className="pb-3 pr-4 font-medium text-center">Avg Score</th>
                <th className="pb-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map(row => (
                <tr key={row.profile.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-cobalt/20 flex items-center justify-center text-brand-cobalt font-bold text-sm flex-shrink-0">
                        {row.profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{row.profile.name}</p>
                        <p className="text-xs text-muted-foreground">{row.profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{row.materialsCompleted}/{row.totalMaterials}</p>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-16 mx-auto">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: row.totalMaterials > 0 ? `${(row.materialsCompleted / row.totalMaterials) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <p className="text-sm font-semibold">{row.quizzesAttempted}/{row.totalQuizzes}</p>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <span className={`text-sm font-bold ${row.avgScore >= 70 ? 'text-emerald-400' : row.avgScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {row.quizzesAttempted > 0 ? `${row.avgScore}%` : '—'}
                    </span>
                  </td>
                  <td className="py-4 text-xs text-muted-foreground">
                    {row.lastActive ? row.lastActive.toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
