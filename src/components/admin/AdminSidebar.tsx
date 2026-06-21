'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, FileText, HelpCircle, ClipboardList,
  LogOut, Atom, ShieldCheck, GraduationCap,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/classes', label: 'Classes', icon: GraduationCap },
  { href: '/admin/materials', label: 'Materials', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin/quizzes', label: 'Quizzes', icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, userProfile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a12] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-rose-600 p-2.5 rounded-xl shadow-lg shadow-rose-600/30">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Physix<span className="text-rose-400">Academy</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-rose-300">
              {userProfile?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userProfile?.name || 'Admin'}</p>
            <p className="text-xs text-white/30 truncate">{userProfile?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
