'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClass, getClassByCode, joinClass } from '@/lib/firestore-helpers';
import { Atom, Mail, Lock, User, Eye, EyeOff, GraduationCap, BookOpen, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<'details' | 'role_setup'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { toast({ title: 'Select a role', description: 'Please choose Teacher or Student', variant: 'destructive' }); return; }
    if (password.length < 6) { toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const user = await signUp(email, password, name, role);
      setCreatedUser(user);
      setStep('role_setup');
    } catch (err: any) {
      toast({ title: 'Signup Failed', description: err.message?.replace('Firebase: ', '').replace(/\(.*\)/, ''), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    setLoading(true);
    try {
      const cls = await createClass(createdUser.uid, className.trim());
      // Update user's batch_ids
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'users', createdUser.uid), { batch_ids: [cls.id] });
      document.cookie = `user_uid=${createdUser.uid}; path=/; max-age=86400`;
      document.cookie = `user_role=teacher; path=/; max-age=86400`;
      toast({ title: '🎉 Welcome, Teacher!', description: `Your class code is: ${cls.class_code}` });
      router.push('/teacher');
    } catch (err: any) {
      toast({ title: 'Setup Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    setLoading(true);
    try {
      const cls = await getClassByCode(classCode.trim());
      if (!cls) throw new Error('Invalid class code. Please check with your teacher.');
      await joinClass(cls.id, createdUser.uid);
      document.cookie = `user_uid=${createdUser.uid}; path=/; max-age=86400`;
      document.cookie = `user_role=student; path=/; max-age=86400`;
      toast({ title: '🎉 Joined!', description: `You joined ${cls.name}` });
      router.push('/student');
    } catch (err: any) {
      toast({ title: 'Join Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cobalt/10 via-background to-brand-azure/5 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-brand-cobalt p-3 rounded-2xl shadow-lg shadow-brand-cobalt/30">
              <Atom className="w-7 h-7 text-white" />
            </div>
            <span className="font-headline font-bold text-3xl tracking-tight">
              Physix<span className="text-brand-cobalt">Academy</span>
            </span>
          </div>
          <p className="text-muted-foreground">
            {step === 'details' ? 'Create your account' : role === 'teacher' ? 'Set up your class' : 'Join your class'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10">
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['teacher', 'student'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === r
                          ? 'border-brand-cobalt bg-brand-cobalt/10 text-brand-cobalt'
                          : 'border-white/10 hover:border-white/20 text-muted-foreground'
                      }`}
                    >
                      {r === 'teacher' ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      <span className="font-medium capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="Dr. Jane Smith" value={name} onChange={e => setName(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-brand-cobalt" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-brand-cobalt" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-brand-cobalt" required />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl font-semibold text-white shadow-lg shadow-brand-cobalt/20">
                {loading
                  ? <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Creating account...</span>
                  : <span className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
                }
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand-cobalt hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          )}

          {step === 'role_setup' && role === 'teacher' && (
            <form onSubmit={handleTeacherSetup} className="space-y-5">
              <div className="text-center p-4 rounded-xl bg-brand-cobalt/10 border border-brand-cobalt/20 mb-2">
                <GraduationCap className="w-8 h-8 text-brand-cobalt mx-auto mb-2" />
                <p className="font-medium">Create your first class</p>
                <p className="text-sm text-muted-foreground mt-1">Students will use the generated code to join</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="className">Class / Batch Name</Label>
                <Input id="className" placeholder='e.g., "Physics 101 — Batch A 2024"'
                  value={className} onChange={e => setClassName(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 focus:border-brand-cobalt" required />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl font-semibold">
                {loading ? 'Creating...' : 'Create Class & Enter Dashboard'}
              </Button>
            </form>
          )}

          {step === 'role_setup' && role === 'student' && (
            <form onSubmit={handleStudentSetup} className="space-y-5">
              <div className="text-center p-4 rounded-xl bg-brand-azure/10 border border-brand-azure/20 mb-2">
                <Hash className="w-8 h-8 text-brand-azure mx-auto mb-2" />
                <p className="font-medium">Enter your class code</p>
                <p className="text-sm text-muted-foreground mt-1">Ask your teacher for the 6-character code</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classCode">Class Code</Label>
                <Input id="classCode" placeholder='e.g., "ABC123"' maxLength={6}
                  value={classCode} onChange={e => setClassCode(e.target.value.toUpperCase())}
                  className="h-12 bg-white/5 border-white/10 focus:border-brand-cobalt text-center text-2xl font-mono tracking-widest uppercase" required />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl font-semibold">
                {loading ? 'Joining...' : 'Join Class'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
