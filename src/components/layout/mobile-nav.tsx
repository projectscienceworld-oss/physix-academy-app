"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Upload,
  ClipboardList,
  BookOpen,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  if (!userProfile) return null;
  if (pathname.startsWith('/auth')) return null;

  const items = userProfile.role === 'teacher' ? [
    { icon: LayoutDashboard, label: 'Home', url: '/teacher' },
    { icon: Upload, label: 'Materials', url: '/teacher/materials' },
    { icon: ClipboardList, label: 'Bank', url: '/teacher/questions' },
    { icon: Calendar, label: 'Routine', url: '/teacher/routine' },
  ] : [
    { icon: LayoutDashboard, label: 'Home', url: '/student' },
    { icon: BookOpen, label: 'Library', url: '/student/library' },
    { icon: Calendar, label: 'Routine', url: '/student/routine' },
    { icon: Trophy, label: 'Quizzes', url: '/student/quizzes' },
  ];

  const handleLogout = async () => {
    await signOut();
    document.cookie = 'user_role=; path=/; max-age=0';
    document.cookie = 'user_uid=; path=/; max-age=0';
    router.push('/auth/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-navy/80 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex justify-between items-center shadow-2xl">
      {items.map((item) => {
        const isActive = pathname === item.url;
        return (
          <Link 
            key={item.url} 
            href={item.url}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              isActive ? 'text-brand-cobalt' : 'text-muted-foreground'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      <button 
        onClick={handleLogout}
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Log out</span>
      </button>
    </nav>
  );
}
