'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTeacherClasses, getLiveClassesForBatch, addLiveClass, updateLiveClass, deleteLiveClass } from '@/lib/firestore-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Trash2, Video, ExternalLink, Edit2, Check } from 'lucide-react';
import type { Class, LiveClass } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export default function LivePage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', batch_id: '', meet_link: '', scheduled_time: '', description: '', recording_url: '' });

  useEffect(() => { if (userProfile) loadData(); }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    const cls = await getTeacherClasses(userProfile.id);
    setClasses(cls);
    if (cls.length > 0) {
      const live = await getLiveClassesForBatch(cls[0].id);
      setLiveClasses(live);
      setForm(f => ({ ...f, batch_id: cls[0].id }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.meet_link || !form.scheduled_time) {
      toast({ title: 'Fill title, link and time', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const data: Omit<LiveClass, 'id'> = {
        title: form.title, batch_id: form.batch_id, meet_link: form.meet_link,
        scheduled_time: Timestamp.fromDate(new Date(form.scheduled_time)),
        description: form.description || undefined, recording_url: form.recording_url || undefined,
        created_by: userProfile!.id,
      };
      if (editId) {
        await updateLiveClass(editId, data);
        toast({ title: '✅ Updated!' });
      } else {
        await addLiveClass(data);
        toast({ title: '✅ Class scheduled! Students notified.' });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ title: '', batch_id: classes[0]?.id || '', meet_link: '', scheduled_time: '', description: '', recording_url: '' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const startEdit = (lc: LiveClass) => {
    setForm({
      title: lc.title, batch_id: lc.batch_id, meet_link: lc.meet_link,
      scheduled_time: lc.scheduled_time?.toDate ? new Date(lc.scheduled_time.toDate()).toISOString().slice(0, 16) : '',
      description: lc.description || '', recording_url: lc.recording_url || '',
    });
    setEditId(lc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    await deleteLiveClass(id);
    setLiveClasses(l => l.filter(x => x.id !== id));
    toast({ title: 'Deleted' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Live Class Manager</h1>
          <p className="text-muted-foreground mt-1">Schedule classes and upload recordings. Students get notified automatically.</p>
        </div>
        <Button onClick={() => { setShowForm(s => !s); setEditId(null); setForm({ title: '', batch_id: classes[0]?.id || '', meet_link: '', scheduled_time: '', description: '', recording_url: '' }); }}
          className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-11 px-5 rounded-xl">
          {showForm ? <><X className="mr-2 w-4 h-4" />Cancel</> : <><Plus className="mr-2 w-4 h-4" />Schedule Class</>}
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card border-brand-cobalt/30">
          <CardHeader><CardTitle>{editId ? 'Edit Class' : 'New Live Class'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Quantum Mechanics — Session 3" className="bg-white/5 border-white/10 h-10" />
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <select value={form.batch_id} onChange={e => setForm(f => ({ ...f, batch_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Google Meet / Zoom Link</Label>
                <Input value={form.meet_link} onChange={e => setForm(f => ({ ...f, meet_link: e.target.value }))}
                  placeholder="https://meet.google.com/..." className="bg-white/5 border-white/10 h-10" />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Time</Label>
                <Input type="datetime-local" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Topics covered, prerequisites..." className="w-full h-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <Label>Recording URL (add after class)</Label>
              <Input value={form.recording_url} onChange={e => setForm(f => ({ ...f, recording_url: e.target.value }))}
                placeholder="https://youtube.com/... or Google Drive link" className="bg-white/5 border-white/10 h-10" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-11">
              {saving ? 'Saving...' : editId ? 'Update Class' : 'Schedule & Notify Students'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)
        ) : liveClasses.length === 0 ? (
          <Card className="glass-card"><CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No classes scheduled yet.</p>
          </CardContent></Card>
        ) : liveClasses.map(lc => {
          const isUpcoming = lc.scheduled_time?.toDate ? lc.scheduled_time.toDate() > new Date() : false;
          return (
            <Card key={lc.id} className="glass-card hover:border-brand-cobalt/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${isUpcoming ? 'bg-brand-cobalt/10' : 'bg-white/5'}`}>
                    <Video className={`w-5 h-5 ${isUpcoming ? 'text-brand-cobalt' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{lc.title}</h3>
                      {isUpcoming && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-400">Upcoming</span>}
                      {lc.recording_url && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-azure/10 text-brand-azure">Recording</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lc.scheduled_time?.toDate ? new Date(lc.scheduled_time.toDate()).toLocaleString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <a href={lc.meet_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(lc)} className="h-9 w-9 rounded-xl">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lc.id)} className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
