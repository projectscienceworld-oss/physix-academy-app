"use client"

import React, { useState } from 'react';
import { 
  Gamepad2, 
  ExternalLink, 
  Maximize2, 
  Info,
  Layers,
  Zap,
  Waves,
  Glasses,
  Sun,
  Thermometer
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_SIMULATIONS } from '@/lib/mock-data';
import { PhysicsTopic } from '@/lib/types';

export default function SimulationsPage() {
  const [activeTopic, setActiveTopic] = useState<PhysicsTopic | 'All'>('All');

  const topics: { name: PhysicsTopic | 'All', icon: any }[] = [
    { name: 'All', icon: Layers },
    { name: 'Mechanics', icon: Zap },
    { name: 'Waves', icon: Waves },
    { name: 'Electromagnetism', icon: Sun },
    { name: 'Optics', icon: Glasses },
    { name: 'Thermodynamics', icon: Thermometer },
  ];

  const filteredSims = MOCK_SIMULATIONS.filter(sim => 
    activeTopic === 'All' || sim.topic === activeTopic
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold">Interactive Simulations</h1>
          <p className="text-muted-foreground mt-2">Hands-on experimentation with fundamental laws of physics.</p>
        </div>
        <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl overflow-x-auto scrollbar-hide">
          {topics.map((t) => (
            <Button
              key={t.name}
              variant={activeTopic === t.name ? 'default' : 'ghost'}
              className={`rounded-xl h-12 px-5 ${
                activeTopic === t.name 
                  ? 'bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-lg shadow-brand-cobalt/20' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTopic(t.name)}
            >
              <t.icon className="mr-2 h-4 w-4" />
              {t.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSims.map((sim) => (
          <Card key={sim.id} className="glass-card group overflow-hidden border-white/10 hover:border-brand-cobalt/50 transition-all duration-300">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 relative overflow-hidden bg-brand-navy">
                <img 
                  src={sim.thumbnail} 
                  alt={sim.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:rotate-1 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className={`${
                    sim.difficulty === 'Beginner' ? 'bg-emerald-500' : 'bg-orange-500'
                  } text-white`}>
                    {sim.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white group-hover:text-brand-cobalt transition-colors">{sim.title}</h3>
                </div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-cobalt">
                    <Info className="w-3 h-3" /> 
                    What to Observe
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{sim.observationGuide}"
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-2xl h-14 font-bold shadow-xl shadow-brand-cobalt/20"
                    asChild
                  >
                    <a href={sim.launchUrl} target="_blank" rel="noopener noreferrer">
                      <Gamepad2 className="mr-2 h-5 w-5" /> Launch Simulation
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl border-white/10 h-12" asChild>
                    <a href={sim.launchUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Fullscreen View
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Featured Resource Card */}
      <Card className="bg-brand-cobalt/5 border-dashed border-2 border-brand-cobalt/20 p-10 rounded-3xl flex flex-col md:flex-row items-center gap-10">
        <div className="bg-brand-cobalt/20 p-8 rounded-full">
           <Maximize2 className="w-16 h-16 text-brand-cobalt" />
        </div>
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-headline font-bold">Partner Resources</h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Our simulations are powered by <span className="text-brand-azure font-bold">PhET Interactive Simulations</span> and <span className="text-brand-azure font-bold">oPhysics</span>. For a wider selection, please explore their full repositories.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Button variant="secondary" className="rounded-xl px-8 h-12">Browse PhET</Button>
            <Button variant="secondary" className="rounded-xl px-8 h-12">Browse oPhysics</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
