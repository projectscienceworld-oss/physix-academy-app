"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Trophy, 
  Calculator 
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { icon: LayoutDashboard, label: 'Home', url: '/' },
    { icon: Video, label: 'Videos', url: '/videos' },
    { icon: Calendar, label: 'Routine', url: '/routine' },
    { icon: Trophy, label: 'Quiz', url: '/quizzes' },
    { icon: Calculator, label: 'Problem', url: '/numericals' },
  ];

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
    </nav>
  );
}
