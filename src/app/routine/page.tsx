"use client"

import React, { useState } from 'react';
import { 
  Calendar, 
  List, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_ROUTINE } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RoutinePage() {
  const [view, setView] = useState<'weekly' | 'list'>('weekly');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  const getSlot = (day: string, timePrefix: string) => {
    return MOCK_ROUTINE.find(r => r.day === day && r.time.startsWith(timePrefix));
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'Mechanics': return 'border-l-4 border-l-brand-cobalt bg-brand-cobalt/5';
      case 'Electromagnetism': return 'border-l-4 border-l-orange-500 bg-orange-500/5';
      case 'Quantum': return 'border-l-4 border-l-brand-azure bg-brand-azure/5';
      default: return 'border-l-4 border-l-white/10 bg-white/5';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold">Class Routine</h1>
          <p className="text-muted-foreground">Stay organized with your weekly physics schedule.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <Button 
            variant={view === 'weekly' ? 'default' : 'ghost'} 
            className={`rounded-xl px-6 ${view === 'weekly' ? 'bg-brand-cobalt hover:bg-brand-cobalt/90' : 'text-muted-foreground'}`}
            onClick={() => setView('weekly')}
          >
            <Calendar className="mr-2 h-4 w-4" /> Weekly
          </Button>
          <Button 
            variant={view === 'list' ? 'default' : 'ghost'} 
            className={`rounded-xl px-6 ${view === 'list' ? 'bg-brand-cobalt hover:bg-brand-cobalt/90' : 'text-muted-foreground'}`}
            onClick={() => setView('list')}
          >
            <List className="mr-2 h-4 w-4" /> List
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 rounded-full"><ChevronLeft className="h-5 w-5" /></Button>
          <h2 className="text-xl font-headline font-bold">November 20 - 26, 2024</h2>
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 rounded-full"><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <Button variant="outline" className="border-brand-cobalt/30 text-brand-cobalt hover:bg-brand-cobalt/10 rounded-xl px-6">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {view === 'weekly' ? (
        <div className="overflow-x-auto rounded-3xl border border-white/5 shadow-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-brand-navy border-b border-white/5">
                <th className="p-6 text-left font-headline text-muted-foreground text-sm font-medium w-32 border-r border-white/5">Time</th>
                {days.map(day => (
                  <th key={day} className="p-6 text-center font-headline text-sm font-bold min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time, idx) => (
                <tr key={time} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="p-6 text-muted-foreground font-mono text-xs border-r border-white/5">{time}</td>
                  {days.map(day => {
                    const slot = getSlot(day, time);
                    return (
                      <td key={day} className="p-2 align-top h-32">
                        {slot ? (
                          <div className={`p-4 rounded-xl h-full shadow-lg flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-pointer ${getTopicColor(slot.topic)}`}>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold border-brand-cobalt/20 text-brand-cobalt px-1">
                                {slot.topic}
                              </Badge>
                              <h4 className="text-sm font-bold line-clamp-2">{slot.topic} Theory</h4>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 font-medium">
                              <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {slot.room}</span>
                              {slot.note && <span className="flex items-center gap-1"><Info className="w-2.5 h-2.5 text-brand-azure" /> Note</span>}
                            </div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_ROUTINE.map(slot => (
            <Card key={slot.id} className="glass-card overflow-hidden group hover:border-brand-cobalt/40 transition-all">
              <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                <div className={`w-1 md:w-2 ${getTopicColor(slot.topic).split(' ')[1]}`} />
                <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-cobalt uppercase tracking-widest">{slot.day}</p>
                    <p className="text-lg font-bold">{slot.topic}</p>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-brand-azure" />
                    <span className="font-mono">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-brand-azure" />
                    <span>{slot.room}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-brand-cobalt"><Info className="h-5 w-5" /></Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-white/10">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
