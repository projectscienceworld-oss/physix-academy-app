'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMaterialsForBatch, markMaterialComplete } from '@/lib/firestore-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, BookOpen, Video, Music, FileText, Link as LinkIcon, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Material, MaterialType, PhysicsTopic } from '@/lib/types';

const TYPE_ICONS: Record<MaterialType, React.ElementType> = { video: Video, audio: Music, pdf: FileText, link: LinkIcon };
const TOPICS: PhysicsTopic[] = ['Mechanics','Waves','Electromagnetism','Optics','Quantum','Thermodynamics','Modern Physics'];

function MediaPlayer({ mat, onClose }: { mat: Material; onClose: () => void }) {
  if (mat.type === 'video' || mat.type === 'link') {
    const isYoutube = mat.file_url.includes('youtube.com') || mat.file_url.includes('youtu.be');
    const embedUrl = isYoutube
      ? mat.file_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
      : mat.file_url;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 bg-card">
            <h3 className="font-semibold truncate">{mat.title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-4 flex-shrink-0">✕</button>
          </div>
          <iframe src={embedUrl} className="w-full aspect-video" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
      </div>
    );
  }
  if (mat.type === 'audio') {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-card rounded-2xl p-8 space-y-4" onClick={e => e.stopPropagation()}>
          <h3 className="font-semibold">{mat.title}</h3>
          <audio controls src={mat.file_url} className="w-full" autoPlay />
          <Button variant="ghost" onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    );
  }
  if (mat.type === 'pdf') {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={onClose}>
        <div className="flex items-center justify-between p-4 bg-card">
          <h3 className="font-semibold">{mat.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <iframe src={mat.file_url} className="flex-1 w-full" onClick={e => e.stopPropagation()} />
      </div>
    );
  }
  return null;
}

export default function LibraryPage() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [playing, setPlaying] = useState<Material | null>(null);

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) { setLoading(false); return; }
    getMaterialsForBatch(userProfile.batch_ids[0]).then(m => { setMaterials(m); setLoading(false); });
  }, [userProfile]);

  const handleComplete = async (mat: Material) => {
    if (!userProfile) return;
    if (mat.completed_by?.includes(userProfile.id)) return;
    await markMaterialComplete(mat.id, userProfile.id);
    setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, completed_by: [...(m.completed_by || []), userProfile.id] } : m));
    toast({ title: '✅ Marked as completed!' });
  };

  const filtered = materials.filter(m =>
    (filterTopic === 'all' || m.topic === filterTopic) &&
    (filterType === 'all' || m.type === filterType) &&
    (!search || m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {playing && <MediaPlayer mat={playing} onClose={() => { setPlaying(null); handleComplete(playing); }} />}

      <div>
        <h1 className="text-3xl font-headline font-bold">Learning Library</h1>
        <p className="text-muted-foreground mt-1">{materials.length} materials · {materials.filter(m => m.completed_by?.includes(userProfile?.id || '')).length} completed</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
            className="pl-10 bg-white/5 border-white/10 h-10" />
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Types</option>
          {(['video','audio','pdf','link'] as MaterialType[]).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No materials found.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(mat => {
            const Icon = TYPE_ICONS[mat.type] || FileText;
            const isCompleted = mat.completed_by?.includes(userProfile?.id || '');
            return (
              <Card key={mat.id} className={`glass-card hover:border-brand-cobalt/30 transition-all ${isCompleted ? 'opacity-70' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${isCompleted ? 'bg-emerald-400/10' : 'bg-brand-cobalt/10'}`}>
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-emerald-400' : 'text-brand-cobalt'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{mat.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{mat.topic} · {mat.type.toUpperCase()}</p>
                      {mat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" onClick={() => setPlaying(mat)}
                      className="flex-1 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-lg h-8 text-xs">
                      {mat.type === 'pdf' ? 'View PDF' : mat.type === 'link' ? 'Open Link' : `▶ Play ${mat.type}`}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleComplete(mat)}
                      className={`rounded-lg h-8 px-3 ${isCompleted ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {isCompleted ? 'Done' : 'Mark Done'}
                    </Button>
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
