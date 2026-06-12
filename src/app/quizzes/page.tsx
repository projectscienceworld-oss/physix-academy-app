"use client"

import React, { useState } from 'react';
import { 
  Trophy, 
  Timer, 
  BrainCircuit, 
  ChevronRight, 
  Plus, 
  History,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_QUIZZES } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';

export default function QuizzesPage() {
  const [difficulty, setDifficulty] = useState<number>(0); // 0 for all

  const tiers = [
    { level: 1, name: 'Conceptual', desc: 'Definitions & core concepts', color: 'bg-emerald-500' },
    { level: 2, name: 'Applied', desc: 'Reasoning & logical flows', color: 'bg-brand-cobalt' },
    { level: 3, name: 'Intermediate', desc: 'Multi-step mathematical logic', color: 'bg-orange-500' },
    { level: 4, name: 'Advanced', desc: 'Competitive edge cases', color: 'bg-destructive' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold">Quiz System</h1>
          <p className="text-muted-foreground">Master physics through tiered challenges and instant feedback.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 rounded-xl h-12">
            <History className="mr-2 h-5 w-5" /> Quiz History
          </Button>
          <Button className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl h-12 px-6">
            <Plus className="mr-2 h-5 w-5" /> Create Quiz
          </Button>
        </div>
      </div>

      {/* Level Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <button
            key={tier.level}
            onClick={() => setDifficulty(tier.level)}
            className={`text-left p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group ${
              difficulty === tier.level 
                ? 'border-brand-cobalt bg-brand-cobalt/10' 
                : 'border-white/5 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-20 ${tier.color}`} />
            <div className="space-y-4 relative z-10">
              <Badge className={`${tier.color} text-white`}>Level {tier.level}</Badge>
              <div>
                <h3 className="text-lg font-bold group-hover:translate-x-1 transition-transform">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-headline font-bold">Available Quizzes</h2>
            <span className="text-sm text-muted-foreground">{MOCK_QUIZZES.length} Total Found</span>
          </div>
          <div className="space-y-4">
            {MOCK_QUIZZES.map((quiz) => (
              <Card key={quiz.id} className="glass-card overflow-hidden group hover:border-brand-cobalt/40 transition-all border-white/5">
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="bg-brand-cobalt/10 p-5 rounded-3xl group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-10 h-10 text-brand-cobalt" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-brand-azure/30 text-brand-azure">{quiz.topic}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {quiz.timeLimitMinutes} Mins
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">{quiz.questions.length} Multiple Choice Questions</p>
                  </div>
                  <div className="w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-2xl h-14 px-10 group shadow-xl shadow-brand-cobalt/20">
                      Start Quiz <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Stats/Performance Sidebar */}
        <div className="space-y-6">
          <Card className="glass-card border-brand-azure/20 shadow-brand-azure/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Trophy className="w-24 h-24 text-brand-azure" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand-azure" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center space-y-2">
                <span className="text-5xl font-headline font-bold text-brand-cobalt">A+</span>
                <p className="text-sm text-muted-foreground">Highest Badge Earned</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Accuracy</span>
                    <span className="font-bold text-brand-azure">88%</span>
                  </div>
                  <Progress value={88} className="h-2 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Speed Factor</span>
                    <span className="font-bold text-brand-cobalt">Fast Learner</span>
                  </div>
                  <Progress value={72} className="h-2 bg-white/5" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-brand-azure/5 p-4 border-t border-brand-azure/10">
              <p className="text-xs text-center w-full text-brand-azure font-medium">Top 5% in your class this week!</p>
            </CardFooter>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Instructor's Tip</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <AlertCircle className="w-10 h-10 text-brand-cobalt shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Focused on Conceptual level (Level 1) before jumping to Advanced calculations. Quantum physics results improved by 40% with this approach."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
