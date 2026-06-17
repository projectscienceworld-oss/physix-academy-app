'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLiveClassesForBatch } from '@/lib/firestore-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, ExternalLink, PlayCircle } from 'lucide-react';
import type { LiveClass } from '@/lib/types';

export default function StudentLivePage() {
  const { userProfile } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) { setLoading(false); return; }
    getLiveClassesForBatch(userProfile.batch_ids[0]).then(l => { setClasses(l); setLoading(false); });
  }, [userProfile]);

  useEffect(() => {
    const update = () => {
      const next: Record<string, string> = {};
      classes.forEach(lc => {
        if (!lc.scheduled_time?.toDate) return;
        const diff = lc.scheduled_time.toDate().getTime() - Date.now();
        if (diff <= 0) { next[lc.id] = 'Live now!'; return; }
        const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
        next[lc.id] = `${h}h ${m}m ${s}s`;
      });
      setCountdown(next);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [classes]);

  const now = new Date();
  const upcoming = classes.filter(l => l.scheduled_time?.toDate ? l.scheduled_time.toDate() > now : false)
    .sort((a, b) => a.scheduled_time.toMillis() - b.scheduled_time.toMillis());
  const past = classes.filter(l => l.scheduled_time?.toDate ? l.scheduled_time.toDate() <= now : true)
    .sort((a, b) => b.scheduled_time.toMillis() - a.scheduled_time.toMillis());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-headline font-bold">Live Classes</h1>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming</h2>
          {upcoming.map(lc => (
            <Card key={lc.id} className="glass-card border-brand-cobalt/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-sm font-bold text-red-400">LIVE IN {countdown[lc.id]}</span>
                    </div>
                    <h3 className="text-xl font-bold">{lc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lc.scheduled_time?.toDate ? new Date(lc.scheduled_time.toDate()).toLocaleString() : ''}
                    </p>
                    {lc.description && <p className="text-sm text-muted-foreground mt-2">{lc.description}</p>}
                  </div>
                  <Button asChild className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-12 px-6 flex-shrink-0">
                    <a href={lc.meet_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 w-4 h-4" />Join Class
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Past Recordings */}
      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Recordings</h2>
          <div className="space-y-3">
            {past.map(lc => (
              <Card key={lc.id} className="glass-card hover:border-brand-cobalt/20 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${lc.recording_url ? 'bg-brand-cobalt/10' : 'bg-white/5'}`}>
                    {lc.recording_url ? <PlayCircle className="w-5 h-5 text-brand-cobalt" /> : <Video className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{lc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lc.scheduled_time?.toDate ? new Date(lc.scheduled_time.toDate()).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {lc.recording_url ? (
                    <Button asChild variant="outline" size="sm" className="rounded-xl border-brand-cobalt/30 hover:bg-brand-cobalt/10 flex-shrink-0">
                      <a href={lc.recording_url} target="_blank" rel="noopener noreferrer"><PlayCircle className="mr-1 w-3 h-3" />Watch</a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">Recording pending</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
      )}
      {!loading && classes.length === 0 && (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No live classes scheduled yet.</p>
        </CardContent></Card>
      )}
    </div>
  );
}
