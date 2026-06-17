'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2, ExternalLink, Search } from 'lucide-react';
import type { Simulation } from '@/lib/types';

const SIMULATIONS: Simulation[] = [
  { id: '1', title: 'Projectile Motion', topic: 'Mechanics', difficulty: 'Beginner', launchUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html', observationGuide: 'Vary the launch angle and observe how the horizontal range changes. Find the angle for maximum range.', thumbnail: 'https://picsum.photos/seed/sim1/600/400' },
  { id: '2', title: 'Bending Light', topic: 'Optics', difficulty: 'Intermediate', launchUrl: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html', observationGuide: "Observe refraction at the boundary of two media. Verify Snell's Law using the protractor tool.", thumbnail: 'https://picsum.photos/seed/sim2/600/400' },
  { id: '3', title: 'Wave Interference', topic: 'Waves', difficulty: 'Intermediate', launchUrl: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html', observationGuide: 'Set up two coherent wave sources and observe constructive and destructive interference patterns.', thumbnail: 'https://picsum.photos/seed/sim3/600/400' },
  { id: '4', title: 'Electric Field Hockey', topic: 'Electromagnetism', difficulty: 'Beginner', launchUrl: 'https://phet.colorado.edu/sims/html/electric-field-hockey/latest/electric-field-hockey_en.html', observationGuide: 'Guide the puck using electric charges and observe how field lines determine the force on charges.', thumbnail: 'https://picsum.photos/seed/sim4/600/400' },
  { id: '5', title: 'Quantum Wave Interference', topic: 'Quantum', difficulty: 'Advanced', launchUrl: 'https://phet.colorado.edu/sims/html/quantum-wave-interference/latest/quantum-wave-interference_en.html', observationGuide: 'Observe wave-particle duality. Compare behaviour of photons, electrons and other particles through double slit.', thumbnail: 'https://picsum.photos/seed/sim5/600/400' },
  { id: '6', title: 'Gas Properties', topic: 'Thermodynamics', difficulty: 'Beginner', launchUrl: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html', observationGuide: 'Investigate the ideal gas law. Observe how temperature, pressure, and volume are related for a gas.', thumbnail: 'https://picsum.photos/seed/sim6/600/400' },
  { id: '7', title: 'Gravity and Orbits', topic: 'Mechanics', difficulty: 'Intermediate', launchUrl: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html', observationGuide: 'Explore how changing mass and velocity affects orbital paths. Verify Kepler\'s laws.', thumbnail: 'https://picsum.photos/seed/sim7/600/400' },
  { id: '8', title: 'Faraday\'s Law', topic: 'Electromagnetism', difficulty: 'Intermediate', launchUrl: 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_en.html', observationGuide: 'Move a magnet through a coil and observe the induced EMF. Verify Lenz\'s law by checking the current direction.', thumbnail: 'https://picsum.photos/seed/sim8/600/400' },
  { id: '9', title: 'Photoelectric Effect', topic: 'Modern Physics', difficulty: 'Advanced', launchUrl: 'https://phet.colorado.edu/sims/html/photoelectric-effect/latest/photoelectric-effect_en.html', observationGuide: 'Shine light of different frequencies and intensities on a metal. Observe the photoelectric current and stopping voltage.', thumbnail: 'https://picsum.photos/seed/sim9/600/400' },
];

const DIFF_COLORS = { Beginner: 'text-emerald-400 bg-emerald-400/10', Intermediate: 'text-amber-400 bg-amber-400/10', Advanced: 'text-rose-400 bg-rose-400/10' };

export default function SimulationsPage() {
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [active, setActive] = useState<Simulation | null>(null);

  const topics = Array.from(new Set(SIMULATIONS.map(s => s.topic)));
  const filtered = SIMULATIONS.filter(s =>
    (filterTopic === 'all' || s.topic === filterTopic) &&
    (!search || s.title.toLowerCase().includes(search.toLowerCase()) || s.topic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sim modal */}
      {active && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={() => setActive(null)}>
          <div className="flex items-center justify-between p-4 bg-card" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="font-bold">{active.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">💡 {active.observationGuide}</p>
            </div>
            <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground ml-4 flex-shrink-0 text-xl">✕</button>
          </div>
          <iframe src={active.launchUrl} className="flex-1 w-full border-0" onClick={e => e.stopPropagation()} title={active.title} allowFullScreen />
        </div>
      )}

      <div>
        <h1 className="text-3xl font-headline font-bold">Physics Simulations</h1>
        <p className="text-muted-foreground mt-1">Interactive PhET simulations — learn by experimenting.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search simulations..."
            className="pl-10 bg-white/5 border-white/10 h-10" />
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none">
          <option value="all">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(sim => (
          <Card key={sim.id} className="glass-card hover:border-brand-cobalt/40 transition-all group overflow-hidden cursor-pointer" onClick={() => setActive(sim)}>
            <div className="relative h-40 overflow-hidden bg-muted">
              <img src={sim.thumbnail} alt={sim.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-cobalt/80 flex items-center justify-center shadow-xl shadow-brand-cobalt/30 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${DIFF_COLORS[sim.difficulty]}`}>{sim.difficulty}</span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold group-hover:text-brand-cobalt transition-colors">{sim.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">{sim.topic}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{sim.observationGuide}</p>
              <Button size="sm" className="mt-4 w-full bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-lg h-8 text-xs">
                Launch Simulation
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
