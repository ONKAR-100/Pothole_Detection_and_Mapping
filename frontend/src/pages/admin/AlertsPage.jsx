import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckSquare } from 'lucide-react'
import { getAlerts, markAlertsRead } from '../../lib/api'
import AlertCard from '../../components/ui/AlertCard'
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AlertsPage() {
  const [alerts, setAlerts_] = useState([])
  const [loading, setLoading] = useState(true)

  const { alerts: rtAlerts } = useRealtimeAlerts((newAlert) => {
    setAlerts_(prev => [{ ...newAlert, is_read: false }, ...prev])
  })

  useEffect(() => {
    getAlerts(50)
      .then(setAlerts_)
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async () => {
    await markAlertsRead()
    setAlerts_(prev => prev.map(a => ({ ...a, is_read: true })))
    toast.success('All alerts marked as read')
  }

  const unread = alerts.filter(a => !a.is_read).length

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🚨 Alert Log</h1>
          <p className="text-gray-500 mt-1">
            {alerts.length} alerts · {unread} unread
          </p>
        </div>
        <button
          onClick={handleMarkRead}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <CheckSquare className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unread first */}
          {alerts
            .slice()
            .sort((a, b) => (a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1))
            .map((a, i) => <AlertCard key={a.id || i} alert={a} />)
          }
        </div>
      )}
    </div>
  )
}
