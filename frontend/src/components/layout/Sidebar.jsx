import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  Building2,
  History,
  LayoutDashboard,
  List,
  LogOut,
  Map,
  MapPin,
  Settings,
  Target,
  FileText,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts'

const userLinks = [
  { to: '/detect', icon: Target, label: 'Detect' },
  { to: '/my-map', icon: Map, label: 'My Map' },
  { to: '/my-history', icon: History, label: 'My History' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/map', icon: MapPin, label: 'Live Map' },
  { to: '/admin/alerts', icon: Bell, label: 'Alerts', badge: true },
  { to: '/admin/detections', icon: List, label: 'All Detections' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  { to: '/admin/municipality', icon: Building2, label: 'Municipality' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const { unreadCount } = useRealtimeAlerts()
  const navigate = useNavigate()

  const links = isAdmin ? adminLinks : userLinks

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50 shadow-2xl">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <AlertTriangle className="w-7 h-7 text-red-400" />
        <div>
          <span className="font-bold text-lg leading-none">PotholeWatch</span>
          <div className="text-xs text-slate-400 mt-0.5">v3.0</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user?.full_name || 'User'}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
        </div>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
          isAdmin ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
        }`}>
          {user?.role?.toUpperCase()}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {badge && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </aside>
  )
}
