'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.replace('/auth/login');
      } else if (userProfile.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d18] text-white flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
