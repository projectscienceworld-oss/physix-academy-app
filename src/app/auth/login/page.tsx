'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Atom, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { signIn, signInWithGoogle, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRedirect = (role: string) => {
    document.cookie = `user_role=${role}; path=/; max-age=86400`;
    router.push(role === 'teacher' ? '/teacher' : '/student');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // The auth state change will update userProfile; poll briefly
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const { getUserProfile } = await import('@/lib/firestore-helpers');
        const { auth } = await import('@/lib/firebase');
        const uid = auth.currentUser?.uid;
        if (uid) {
          const profile = await getUserProfile(uid);
          if (profile) {
            clearInterval(poll);
            document.cookie = `user_uid=${uid}; path=/; max-age=86400`;
            document.cookie = `user_role=${profile.role}; path=/; max-age=86400`;
            handleRedirect(profile.role);
          }
        }
        if (attempts > 10) clearInterval(poll);
      }, 300);
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message?.replace('Firebase: ', '').replace(/\(.*\)/, '') || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // After Google sign-in, check profile
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const { getUserProfile } = await import('@/lib/firestore-helpers');
        const { auth } = await import('@/lib/firebase');
        const uid = auth.currentUser?.uid;
        if (uid) {
          const profile = await getUserProfile(uid);
          if (profile) {
            clearInterval(poll);
            document.cookie = `user_uid=${uid}; path=/; max-age=86400`;
            document.cookie = `user_role=${profile.role}; path=/; max-age=86400`;
            handleRedirect(profile.role);
          }
        }
        if (attempts > 10) clearInterval(poll);
      }, 300);
    } catch (err: any) {
      toast({ title: 'Google Sign-In Failed', description: err.message, variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient */}
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
          <p className="text-muted-foreground">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-brand-cobalt"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-brand-cobalt"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-cobalt hover:bg-brand-cobalt/90 rounded-xl font-semibold text-white shadow-lg shadow-brand-cobalt/20"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Signing in...</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogle}
            className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 hover:border-brand-cobalt/30"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Connecting...</span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-brand-cobalt hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
