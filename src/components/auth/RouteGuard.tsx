'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Atom } from 'lucide-react';

const PUBLIC_PATHS = ['/auth/login', '/auth/signup', '/'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Check if the current path is public
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p) && p !== '/');
    if (pathname === '/' && isPublic) {
      setAuthorized(true);
      return;
    }

    if (!userProfile) {
      if (!isPublic) {
        setAuthorized(false);
        router.push('/auth/login');
      } else {
        setAuthorized(true);
      }
      return;
    }

    // User is logged in. Check role-based access.
    const role = userProfile.role;

    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      setAuthorized(false);
      router.push('/student');
      return;
    }

    if (pathname.startsWith('/student') && role !== 'student') {
      setAuthorized(false);
      router.push('/teacher');
      return;
    }

    // Authorized
    setAuthorized(true);
  }, [userProfile, loading, pathname, router]);

  // Show a loading screen while auth state is resolving or before redirect
  if (loading || !authorized) {
    // Only show the spinner if we aren't on a public page where we are already authorized
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p) && p !== '/');
    if (isPublic && !loading) {
      // In this specific edge case (we are on a public page but the effect hasn't run yet)
      // we can just return children to prevent flicker.
      return <>{children}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-brand-cobalt p-4 rounded-2xl shadow-lg shadow-brand-cobalt/30 animate-pulse">
            <Atom className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
