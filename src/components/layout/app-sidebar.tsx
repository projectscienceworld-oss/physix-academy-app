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
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

const NAV_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Video Lectures", icon: Video, url: "/videos" },
  { title: "Simulations", icon: Gamepad2, url: "/simulations" },
  { title: "Online Class", icon: Users, url: "/live" },
  { title: "Class Routine", icon: Calendar, url: "/routine" },
  { title: "Quiz System", icon: Trophy, url: "/quizzes" },
  { title: "Numericals", icon: Calculator, url: "/numericals" },
]

export function AppSidebar() {
  const pathname = usePathname()

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
        <SidebarMenu className="px-3 gap-2">
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.url}
                tooltip={item.title}
                className={`h-12 rounded-xl transition-all duration-200 ${
                  pathname === item.url 
                    ? "bg-brand-cobalt text-white shadow-lg shadow-brand-cobalt/20" 
                    : "hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <Link href={item.url}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                  {pathname === item.url && (
                    <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-data-[collapsible=icon]:hidden" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:bg-destructive/10"
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
