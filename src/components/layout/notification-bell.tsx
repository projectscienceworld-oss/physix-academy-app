"use client"

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToNotifications, markNotificationRead } from '@/lib/firestore-helpers'
import type { Notification } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function NotificationBell() {
  const { user, userProfile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!userProfile?.batch_ids?.length) return
    const unsub = subscribeToNotifications(userProfile.batch_ids, setNotifications)
    return unsub
  }, [userProfile?.batch_ids])

  const unread = notifications.filter(n => !n.read_by?.includes(user?.uid || ''))

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && user && unread.length > 0) {
      // Mark all as read when opening
      await Promise.all(unread.map(n => markNotificationRead(n.id, user.uid)))
    }
  }

  const typeIcon: Record<string, string> = {
    new_material: '📚',
    quiz_published: '📝',
    class_scheduled: '🎥',
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
          <Bell className="w-5 h-5" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-cobalt text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-white/10" align="end">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                !n.read_by?.includes(user?.uid || '') ? 'bg-brand-cobalt/5' : ''
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.created_at?.toDate ? new Date(n.created_at.toDate()).toLocaleString() : ''}
                    </p>
                  </div>
                  {!n.read_by?.includes(user?.uid || '') && (
                    <span className="w-2 h-2 rounded-full bg-brand-cobalt flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
