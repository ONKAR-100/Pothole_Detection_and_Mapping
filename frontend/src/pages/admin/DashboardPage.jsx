import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, Activity, CheckSquare } from 'lucide-react'
import { getDashboardStats, getAlerts, markAlertsRead, getTimeline, getAllDetections } from '../../lib/api'
import { formatDate, formatConfidence } from '../../lib/utils'
import StatCard from '../../components/ui/StatCard'
import AlertCard from '../../components/ui/AlertCard'
import SeverityBadge from '../../components/ui/SeverityBadge'
import SeverityPieChart from '../../components/charts/SeverityPieChart'
import DetectionTimeline from '../../components/charts/DetectionTimeline'
import InputTypeBarChart from '../../components/charts/InputTypeBarChart'
import ConfidenceScatter from '../../components/charts/ConfidenceScatter'
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  AlertTriangle, TrendingUp, Calendar, Shield, Zap, Crosshair
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats]           = useState(null)
  const [alerts, setAlerts_]        = useState([])
  const [timeline, setTimeline]     = useState([])
  const [recentDets, setRecentDets] = useState([])
  const [loading, setLoading]       = useState(true)

  // Real-time new alerts prepended
  const { alerts: rtAlerts } = useRealtimeAlerts((newAlert) => {
    setAlerts_(prev => [{ ...newAlert, is_read: false }, ...prev])
    toast('🔴 New high alert!', { icon: '⚠️' })
  })

  const load = useCallback(async () => {
    try {
      const [s, a, t, dets] = await Promise.all([
        getDashboardStats(),
        getAlerts(20),
        getTimeline(),
        getAllDetections({ limit: 20 }),
      ])
      setStats(s)
      setAlerts_(a)
      setTimeline(t)
      setRecentDets(Array.isArray(dets) ? dets.slice(0, 20) : [])
    } catch (e) {
      toast.error('Failed to load dashboard data')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const handleMarkRead = async () => {
    await markAlertsRead()
    setAlerts_(prev => prev.map(a => ({ ...a, is_read: true })))
    toast.success('All alerts marked as read')
  }

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📊 Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time pothole detection overview</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Row 1 — Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total"      value={stats?.total}          icon={AlertTriangle} color="#e74c3c" />
        <StatCard title="Today"      value={stats?.today}          icon={Calendar}      color="#3498db" />
        <StatCard title="This Week"  value={stats?.this_week}      icon={TrendingUp}    color="#9b59b6" />
        <StatCard title="High"       value={stats?.high}           icon={Shield}        color="#dc3545" />
        <StatCard title="Avg Conf."  value={`${((stats?.avg_confidence || 0) * 100).toFixed(1)}%`} icon={Crosshair} color="#fd7e14" />
        <StatCard title="Users"      value={stats?.total_users}    icon={Activity}      color="#28a745" />
      </div>

      {/* Row 2 — Alert Feed + Pie Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alert Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">🚨 Recent Alerts</h2>
            <button
              onClick={handleMarkRead}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <CheckSquare className="w-3 h-3" /> Mark all read
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.length === 0
              ? <p className="text-center text-gray-400 py-8 text-sm">No alerts yet</p>
              : alerts.map((a, i) => <AlertCard key={a.id || i} alert={a} />)
            }
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">🥧 Severity Distribution</h2>
          <SeverityPieChart stats={stats} />
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
            <span>🔴 High: {stats?.high || 0}</span>
            <span>🟡 Medium: {stats?.medium || 0}</span>
            <span>🟢 Low: {stats?.low || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 3 — Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📅 Detection Timeline (Last 30 Days)</h2>
        <DetectionTimeline data={timeline} />
      </div>

      {/* Row 4 — Two Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">📷 Input Types</h2>
          <InputTypeBarChart detections={recentDets} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">🎯 Confidence vs Area</h2>
          <ConfidenceScatter detections={recentDets} />
        </div>
      </div>

      {/* Row 5 — Recent Detections Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">🗂️ Recent Detections</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Time', 'User', 'Severity', 'Confidence', 'Type', 'GPS', 'Image'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentDets.map((d, i) => (
                <tr key={d.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">{formatDate(d.created_at)}</td>
                  <td className="px-4 py-2.5 text-gray-700 text-xs truncate max-w-[100px]">
                    {d.profiles?.email || '—'}
                  </td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={d.severity} /></td>
                  <td className="px-4 py-2.5 font-medium">{formatConfidence(d.confidence)}</td>
                  <td className="px-4 py-2.5 text-gray-400 uppercase text-xs">{d.input_type}</td>
                  <td className="px-4 py-2.5 text-xs text-blue-500">
                    {d.latitude ? '📍 GPS' : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.image_url
                      ? <img src={d.image_url} alt="" className="w-9 h-9 rounded object-cover" />
                      : '—'}
                  </td>
                </tr>
              ))}
              {!recentDets.length && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No detections yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
