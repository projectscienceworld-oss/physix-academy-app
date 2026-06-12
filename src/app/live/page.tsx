"use client"

import React from 'react';
import { 
  Users, 
  Video, 
  ExternalLink, 
  PlayCircle, 
  Calendar as CalendarIcon, 
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LiveClassPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Online Class Hub</h1>
          <p className="text-muted-foreground mt-2">Access live lectures and archives effortlessly.</p>
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl">
          <Settings className="mr-2 h-4 w-4" /> Instructor Settings
        </Button>
      </div>

      {/* Highlighted Live Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-cobalt p-1">
        <div className="bg-brand-navy rounded-[22px] p-8 md:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-cobalt/20 rounded-full blur-[100px]" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-brand-azure/20 rounded-full blur-[100px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <Badge className="bg-brand-cobalt text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
                UPCOMING LIVE
              </Badge>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
                  Thermodynamics: <span className="text-brand-cobalt">Entropy & Laws</span>
                </h2>
                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-brand-cobalt" />
                    <span>Tuesday, Oct 24</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-cobalt" />
                    <span>02:00 PM - 03:30 PM</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-brand-cobalt/20">
                  <ExternalLink className="mr-2 w-5 h-5" /> Join via Zoom
                </Button>
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 h-14 px-8 rounded-2xl">
                  Add to Google Calendar
                </Button>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-brand-azure font-headline uppercase tracking-[0.2em] font-semibold">Class starts in</p>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-4xl font-headline font-bold">01</div>
                  <p className="text-xs text-muted-foreground uppercase">Day</p>
                </div>
                <div className="space-y-2 border-x border-white/5 px-6">
                  <div className="text-4xl font-headline font-bold">04</div>
                  <p className="text-xs text-muted-foreground uppercase">Hours</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-headline font-bold">22</div>
                  <p className="text-xs text-muted-foreground uppercase">Min</p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-brand-cobalt" />
                <span>42 students already set reminders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Archive */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-headline font-bold">Past Class Recordings</h2>
          <Button variant="ghost" className="text-brand-cobalt hover:bg-brand-cobalt/10">View Archive</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card group cursor-pointer hover:border-brand-cobalt/50 transition-all overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img src={`https://picsum.photos/seed/live${i}/400/225`} alt="Rec" className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl" />
                </div>
              </div>
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-2 text-xs opacity-70">Nov 15, 2024</Badge>
                <h3 className="font-bold text-lg group-hover:text-brand-cobalt transition-colors">Special Relativity: Lorentz Transformation</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">Duration: 1h 24m</span>
                  <Button variant="ghost" size="sm" className="h-8 text-brand-azure p-0">Watch Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
