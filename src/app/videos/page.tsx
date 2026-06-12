"use client"

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  BookOpen,
  CheckCircle,
  PlusCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_VIDEOS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { PhysicsTopic } from '@/lib/types';

export default function VideosPage() {
  const [filter, setFilter] = useState<PhysicsTopic | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredVideos = MOCK_VIDEOS.filter(video => {
    const matchesFilter = filter === 'All' || video.topic === filter;
    const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const topics: (PhysicsTopic | 'All')[] = ['All', 'Mechanics', 'Electromagnetism', 'Optics', 'Thermodynamics', 'Quantum'];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold">Video Lectures</h1>
          <p className="text-muted-foreground">Visual concepts for fundamental physics principles.</p>
        </div>
        <Button className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl px-6">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Lecture
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by lecture title or keyword..." 
            className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-brand-cobalt"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {topics.map((t) => (
            <Button
              key={t}
              variant={filter === t ? 'default' : 'outline'}
              className={`rounded-full px-5 whitespace-nowrap ${
                filter === t ? 'bg-brand-cobalt hover:bg-brand-cobalt/90 border-none' : 'border-white/10 text-muted-foreground'
              }`}
              onClick={() => setFilter(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="glass-card group overflow-hidden border-white/5 hover:border-brand-cobalt/40 transition-all duration-300">
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="icon" className="h-14 w-14 rounded-full bg-brand-cobalt shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <Play className="h-6 w-6 fill-white" />
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-mono">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Badge className="bg-brand-cobalt/10 text-brand-cobalt hover:bg-brand-cobalt/20 border-brand-cobalt/20">
                  {video.topic}
                </Badge>
                {video.isWatched && (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 gap-1">
                    <CheckCircle className="w-3 h-3" /> Watched
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold leading-tight group-hover:text-brand-cobalt transition-colors">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  {video.chapter}
                </div>
                <Button variant="link" className="text-brand-azure p-0 h-auto text-sm font-semibold hover:no-underline">
                  Mark as {video.isWatched ? 'Unwatched' : 'Watched'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
