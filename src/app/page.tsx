import React from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Welcome back, <span className="text-brand-cobalt">Dr. Fleming</span></h1>
          <p className="text-muted-foreground mt-2">Here is what's happening in PhysixAcademy today.</p>
        </div>
        <Button className="bg-brand-cobalt hover:bg-brand-cobalt/90 h-12 px-6 rounded-xl font-medium">
          <BookOpen className="mr-2 w-5 h-5" />
          View Class Notes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Class Timer Card */}
        <Card className="lg:col-span-2 glass-card overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32 text-brand-azure" />
            </div>
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cobalt/10 text-brand-cobalt text-sm font-semibold border border-brand-cobalt/20">
                <span className="w-2 h-2 rounded-full bg-brand-cobalt animate-pulse"></span>
                LIVE IN
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-5xl font-headline font-bold">02</span>
                  <p className="text-xs text-muted-foreground uppercase mt-1">Hours</p>
                </div>
                <span className="text-4xl font-headline font-light text-muted-foreground">:</span>
                <div className="text-center">
                  <span className="text-5xl font-headline font-bold">45</span>
                  <p className="text-xs text-muted-foreground uppercase mt-1">Minutes</p>
                </div>
                <span className="text-4xl font-headline font-light text-muted-foreground">:</span>
                <div className="text-center">
                  <span className="text-5xl font-headline font-bold text-brand-azure">12</span>
                  <p className="text-xs text-muted-foreground uppercase mt-1">Seconds</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Quantum Mechanics: Wave-Particle Duality</h3>
                <p className="text-muted-foreground">Topics: Young's Double Slit, Photoelectric Effect, De Broglie Wavelength</p>
              </div>
              <Button asChild size="lg" className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl px-8 h-12 shadow-xl shadow-brand-cobalt/20">
                <Link href="/live">Join Live Session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-brand-azure/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-brand-azure" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Completion</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quiz Success Rate</p>
                <p className="text-2xl font-bold">85.4%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-brand-cobalt/10 p-3 rounded-xl">
                <HelpCircle className="w-6 h-6 text-brand-cobalt" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">142/200</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Videos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold">Recent Lectures</h2>
            <Link href="/videos" className="text-brand-cobalt flex items-center gap-1 text-sm font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="glass-card group cursor-pointer hover:border-brand-cobalt/50 transition-all overflow-hidden">
                <CardContent className="p-0 flex items-center">
                  <div className="w-32 h-24 bg-muted relative shrink-0">
                    <img src={`https://picsum.photos/seed/lect${i}/200/150`} alt="Lecture" className="object-cover w-full h-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="font-bold line-clamp-1 group-hover:text-brand-cobalt transition-colors">Maxwell's Equations Simplified</h4>
                    <p className="text-xs text-muted-foreground mt-1">Electromagnetism • 24 mins</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Study Progress */}
        <div className="space-y-4">
          <h2 className="text-2xl font-headline font-bold">Current Focus</h2>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Modern Physics Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Photoelectric Effect</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} className="h-2 bg-white/5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compton Scattering</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2 bg-white/5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>X-Ray Production</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2 bg-white/5" />
              </div>
              <Button variant="outline" className="w-full mt-4 border-white/10 hover:bg-brand-cobalt/10 hover:border-brand-cobalt/30 rounded-xl">
                Continue Last Module
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
