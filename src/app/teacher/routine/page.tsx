'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getRoutineForBatch, setRoutineSlot, deleteRoutineSlot } from '@/lib/firestore-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calendar } from 'lucide-react';
import type { Class, RoutineSlot, WeekDay, PhysicsTopic } from '@/lib/types';

const DAYS: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TOPICS: PhysicsTopic[] = ['Mechanics','Waves','Electromagnetism','Optics','Quantum','Thermodynamics','Modern Physics'];

export default function RoutinePage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState<WeekDay | null>(null);
  const [newSlot, setNewSlot] = useState({ time_slot: '', topic: 'Mechanics' as PhysicsTopic, note: '' });

  useEffect(() => { if (userProfile) loadData(); }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    const cls = await getTeacherClasses(userProfile.id);
    setClasses(cls);
    const batchId = selectedBatch || cls[0]?.id || '';
    if (batchId) {
      const r = await getRoutineForBatch(batchId);
      setRoutine(r);
      setSelectedBatch(batchId);
    }
    setLoading(false);
  };

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatch(batchId);
    setLoading(true);
    const r = await getRoutineForBatch(batchId);
    setRoutine(r);
    setLoading(false);
  };

  const handleAdd = async (day: WeekDay) => {
    if (!newSlot.time_slot) { toast({ title: 'Enter time slot', variant: 'destructive' }); return; }
    try {
      await setRoutineSlot(selectedBatch, { day, time_slot: newSlot.time_slot, topic: newSlot.topic, note: newSlot.note });
      toast({ title: 'Slot added' });
      setAddingDay(null);
      setNewSlot({ time_slot: '', topic: 'Mechanics', note: '' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRoutineSlot(id);
    setRoutine(r => r.filter(s => s.id !== id));
    toast({ title: 'Removed' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Class Routine</h1>
          <p className="text-muted-foreground mt-1">Manage the weekly schedule for each batch.</p>
        </div>
        {classes.length > 1 && (
          <select value={selectedBatch} onChange={e => handleBatchChange(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySlots = routine.filter(s => s.day === day).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
            return (
              <Card key={day} className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    {day}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                      onClick={() => setAddingDay(addingDay === day ? null : day)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {daySlots.length === 0 && addingDay !== day && (
                    <p className="text-xs text-muted-foreground text-center py-2">No sessions</p>
                  )}
                  {daySlots.map(slot => (
                    <div key={slot.id} className="flex items-start gap-2 p-3 bg-white/5 rounded-xl group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-brand-cobalt">{slot.time_slot}</p>
                        <p className="text-sm font-medium mt-0.5">{slot.topic}</p>
                        {slot.note && <p className="text-xs text-muted-foreground mt-0.5">{slot.note}</p>}
                      </div>
                      <button onClick={() => handleDelete(slot.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {addingDay === day && (
                    <div className="space-y-2 p-3 bg-brand-cobalt/10 rounded-xl border border-brand-cobalt/20">
                      <Input value={newSlot.time_slot} onChange={e => setNewSlot(s => ({ ...s, time_slot: e.target.value }))}
                        placeholder="09:00 - 10:30" className="bg-white/5 border-white/10 h-8 text-sm" />
                      <select value={newSlot.topic} onChange={e => setNewSlot(s => ({ ...s, topic: e.target.value as PhysicsTopic }))}
                        className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none">
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <Input value={newSlot.note} onChange={e => setNewSlot(s => ({ ...s, note: e.target.value }))}
                        placeholder="Optional note" className="bg-white/5 border-white/10 h-8 text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAdd(day)} className="flex-1 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-lg h-7 text-xs">Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingDay(null)} className="flex-1 rounded-lg h-7 text-xs">Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
