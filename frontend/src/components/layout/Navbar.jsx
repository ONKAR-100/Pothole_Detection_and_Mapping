import React from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { unreadCount }   = useRealtimeAlerts()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Logo — shown on mobile only (sidebar handles desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <span className="font-bold text-slate-800">PotholeWatch</span>
      </div>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">{user?.email}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
