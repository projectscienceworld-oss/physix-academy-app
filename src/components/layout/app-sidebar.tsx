"use client"

import * as React from "react"
import {
  Atom,
  Video,
  Gamepad2,
  Users,
  Calendar,
  Trophy,
  Calculator,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Upload,
  BookOpen,
  ClipboardList,
  BarChart2,
  Bell,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationBell } from "@/components/layout/notification-bell"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const STUDENT_NAV = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/student" },
  { title: "Library", icon: BookOpen, url: "/student/library" },
  { title: "Simulations", icon: Gamepad2, url: "/student/simulations" },
  { title: "Live Class", icon: Users, url: "/student/live" },
  { title: "Routine", icon: Calendar, url: "/student/routine" },
  { title: "Quizzes", icon: Trophy, url: "/student/quizzes" },
  { title: "Numericals", icon: Calculator, url: "/student/numericals" },
]

const TEACHER_NAV = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/teacher" },
  { title: "Materials", icon: Upload, url: "/teacher/materials" },
  { title: "Question Bank", icon: ClipboardList, url: "/teacher/questions" },
  { title: "Quizzes", icon: Trophy, url: "/teacher/quizzes" },
  { title: "Live Classes", icon: Users, url: "/teacher/live" },
  { title: "Routine", icon: Calendar, url: "/teacher/routine" },
  { title: "Students", icon: BarChart2, url: "/teacher/students" },
]

// Auth pages — show no sidebar
const NO_SIDEBAR_PATHS = ['/auth/login', '/auth/signup']

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, signOut } = useAuth()

  // Don't render sidebar on auth pages
  if (NO_SIDEBAR_PATHS.some(p => pathname.startsWith(p))) {
    return null
  }

  const navItems = userProfile?.role === 'teacher' ? TEACHER_NAV : STUDENT_NAV

  const handleSignOut = async () => {
    await signOut()
    // Clear role cookies
    document.cookie = 'user_role=; path=/; max-age=0'
    document.cookie = 'user_uid=; path=/; max-age=0'
    router.push('/auth/login')
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-white/5 bg-brand-navy">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-brand-cobalt p-2 rounded-xl">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
            Physix<span className="text-brand-cobalt">Academy</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-6">
        {/* Role badge */}
        {userProfile && (
          <div className="px-4 mb-4 group-data-[collapsible=icon]:hidden">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              userProfile.role === 'teacher'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-brand-cobalt/10 text-brand-cobalt border border-brand-cobalt/20'
            }`}>
              {userProfile.role === 'teacher' ? <GraduationCap className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Portal
            </div>
          </div>
        )}

        <SidebarMenu className="px-3 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/teacher' && item.url !== '/student' && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={`h-12 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-brand-cobalt text-white shadow-lg shadow-brand-cobalt/20"
                      : "hover:bg-white/5 text-muted-foreground"
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-data-[collapsible=icon]:hidden" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 space-y-2">
        {/* User info */}
        {userProfile && (
          <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
            <div className="w-8 h-8 rounded-full bg-brand-cobalt/20 flex items-center justify-center text-brand-cobalt font-bold text-sm flex-shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
