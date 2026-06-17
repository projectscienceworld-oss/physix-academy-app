'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Atom, ArrowRight, Play, BookOpen, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect them to their portal
  useEffect(() => {
    if (!loading && userProfile) {
      router.push(userProfile.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [userProfile, loading, router]);

  if (loading) return null; // Wait for auth check

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-cobalt/10 blur-[120px]" />
        <div className="absolute top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-brand-azure/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="container mx-auto px-4 py-6 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-cobalt p-2.5 rounded-xl shadow-lg shadow-brand-cobalt/30">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight">
            Physix<span className="text-brand-cobalt">Academy</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Button asChild className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-20 pb-32 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          The New Learning Management System is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
          Master Physics with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cobalt to-brand-azure">Interactive</span> Learning
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          A complete platform for teachers and students. Interactive simulations, step-by-step numericals, live classes, and real-time quiz analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Button asChild size="lg" className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-brand-cobalt/20">
            <Link href="/auth/signup">Start Teaching / Learning <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
          {[
            { icon: Users, title: "Role-Based Portals", desc: "Dedicated interfaces tailored for both Teachers and Students.", color: "text-brand-cobalt", bg: "bg-brand-cobalt/10" },
            { icon: Play, title: "PhET Simulations", desc: "Hands-on virtual labs to experiment and understand concepts.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { icon: Trophy, title: "Real-time Quizzes", desc: "Timed assessments with automatic grading and analytics.", color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: BookOpen, title: "LaTeX Numericals", desc: "Step-by-step physics problems rendered perfectly.", color: "text-brand-azure", bg: "bg-brand-azure/10" },
          ].map((feature, i) => (
            <Card key={i} className="glass-card hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
