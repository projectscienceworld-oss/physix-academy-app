"use client"

import React, { useState } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  PlusCircle,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MOCK_NUMERICALS } from '@/lib/mock-data';
import { LatexRenderer } from '@/components/ui/latex-renderer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function NumericalsPage() {
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [revealSolutionId, setRevealSolutionId] = useState<string | null>(null);

  const toggleSolved = (id: string) => {
    setSolvedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Physics Numericals</h1>
          <p className="text-muted-foreground">A repository of structured problems with LaTeX precision.</p>
        </div>
        <Button className="bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl px-6 h-12 shadow-xl shadow-brand-cobalt/20">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Problem
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Filter by sub-topic or formula..." className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10" />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="h-14 rounded-2xl border-white/10 text-muted-foreground hover:bg-white/5">All Topics</Button>
           <Button variant="outline" className="h-14 rounded-2xl border-white/10 text-muted-foreground hover:bg-white/5">Difficulty</Button>
        </div>
      </div>

      {/* Problem Library */}
      <div className="space-y-8 pb-20">
        {MOCK_NUMERICALS.map((problem) => {
          const isSolved = solvedIds.includes(problem.id);
          const isRevealed = revealSolutionId === problem.id;

          return (
            <Card key={problem.id} className="glass-card overflow-hidden border-white/10 hover:border-brand-cobalt/30 transition-all shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Badge className="bg-brand-cobalt/10 text-brand-cobalt hover:bg-brand-cobalt/20">
                      {problem.topic}
                    </Badge>
                    <Badge variant="outline" className="text-brand-azure border-brand-azure/30">
                      {problem.subTopic}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-azure" />
                    Problem #{problem.id}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${problem.difficulty === 'Medium' ? 'bg-orange-500' : 'bg-brand-cobalt'} text-white`}>
                    {problem.difficulty}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleSolved(problem.id)}
                    className={`rounded-full ${isSolved ? 'text-emerald-500' : 'text-muted-foreground'}`}
                  >
                    <CheckCircle2 className={`w-8 h-8 ${isSolved ? 'fill-emerald-500/10' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Statement */}
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <h4 className="text-xs uppercase tracking-widest text-brand-azure font-bold mb-4 flex items-center gap-2">
                    <Star className="w-3 h-3" /> Problem Statement
                  </h4>
                  <div className="text-lg leading-relaxed text-foreground/90">
                    <LatexRenderer content={problem.statement} displayMode={true} />
                  </div>
                </div>

                {/* Formula Highlight */}
                <div className="flex items-center gap-4 bg-brand-cobalt/5 border border-brand-cobalt/20 p-4 rounded-xl">
                  <div className="bg-brand-cobalt/20 p-2 rounded-lg">
                    <Brain className="w-5 h-5 text-brand-cobalt" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-cobalt tracking-tighter">Key Formula Used</span>
                    <div className="text-md font-mono text-brand-cobalt">
                       <LatexRenderer content={problem.keyFormula} />
                    </div>
                  </div>
                </div>

                {/* Solution Reveal Logic */}
                <div className="space-y-4">
                  {!isRevealed ? (
                    <div className="flex flex-col items-center py-8 space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
                      <HelpCircle className="w-12 h-12 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground text-sm font-medium">Attempt the problem before looking at the solution.</p>
                      <Button 
                        onClick={() => setRevealSolutionId(problem.id)}
                        className="bg-brand-azure hover:bg-brand-azure/90 text-brand-navy font-bold rounded-2xl px-10 h-14"
                      >
                        Reveal Step-by-Step Solution
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Detailed Solution
                        </h4>
                        <Button variant="ghost" className="text-muted-foreground" onClick={() => setRevealSolutionId(null)}>Hide Solution</Button>
                      </div>
                      <Accordion type="single" collapsible className="space-y-3">
                        {problem.solutionSteps.map((step, idx) => (
                          <AccordionItem key={idx} value={`item-${idx}`} className="border border-white/5 rounded-2xl bg-white/5 overflow-hidden">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline font-bold">
                              Step {idx + 1}: Methodology
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2 text-muted-foreground text-md leading-relaxed border-t border-white/5">
                              <LatexRenderer content={step} displayMode={true} />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Final Answer</span>
                          <p className="text-3xl font-headline font-black text-emerald-500">{problem.answer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-xl">Correct</Button>
                          <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl">Incorrect</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
