'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoutineForBatch } from '@/lib/firestore-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { RoutineSlot, WeekDay } from '@/lib/types';

const DAYS: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentRoutinePage() {
  const { userProfile } = useAuth();
  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const today = DAYS[new Date().getDay() - 1] as WeekDay | undefined;

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) { setLoading(false); return; }
    getRoutineForBatch(userProfile.batch_ids[0]).then(r => { setRoutine(r); setLoading(false); });
  }, [userProfile]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Class Routine</h1>
        <p className="text-muted-foreground mt-1">Your weekly schedule at a glance.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : routine.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No routine set yet. Check back later!</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySlots = routine.filter(s => s.day === day).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
            const isToday = day === today;
            return (
              <Card key={day} className={`glass-card ${isToday ? 'border-brand-cobalt/50 ring-1 ring-brand-cobalt/20' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {day}
                    {isToday && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-cobalt/20 text-brand-cobalt">Today</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No sessions</p>
                  ) : daySlots.map(slot => (
                    <div key={slot.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-xs font-medium text-brand-cobalt">{slot.time_slot}</p>
                      <p className="text-sm font-semibold mt-0.5">{slot.topic}</p>
                      {slot.note && <p className="text-xs text-muted-foreground mt-1">{slot.note}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
