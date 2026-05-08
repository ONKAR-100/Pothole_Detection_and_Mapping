import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'
import { getMapPins } from '../../lib/api'
import DetectionMap from '../../components/map/DetectionMap'
import SeverityBadge from '../../components/ui/SeverityBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function LiveMapPage() {
  const [all, setAll]               = useState([])
  const [loading, setLoading]       = useState(true)
  const [heatmapOn, setHeatmapOn]   = useState(false)
  const [sevFilter, setSevFilter]   = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getMapPins()
      setAll(data)
    } catch {
      toast.error('Failed to load map pins')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = all.filter(d => {
    if (sevFilter.length && !sevFilter.includes(d.severity)) return false
    if (typeFilter && d.input_type !== typeFilter) return false
    if (dateFrom && d.created_at < dateFrom) return false
    if (dateTo   && d.created_at > dateTo + 'T23:59:59') return false
    return true
  })

  const toggleSev = (sev) => {
    setSevFilter(prev =>
      prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]
    )
  }

  if (loading) return <LoadingSpinner fullscreen />

  // Severity counts for current filtered set
  const counts = { high: 0, medium: 0, low: 0 }
  filtered.forEach(d => { if (d.severity in counts) counts[d.severity]++ })

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🗺️ Live Pothole Map</h1>
          <p className="text-gray-500 mt-1">Showing {filtered.length} of {all.length} GPS-tagged detections</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-semibold text-gray-700">Severity:</span>
        {['high', 'medium', 'low'].map(s => (
          <button
            key={s}
            onClick={() => toggleSev(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              sevFilter.includes(s)
                ? s === 'high' ? 'bg-red-500 text-white border-red-500'
                : s === 'medium' ? 'bg-orange-400 text-white border-orange-400'
                : 'bg-green-500 text-white border-green-500'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="webcam">Webcam</option>
        </select>

        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />

        <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto">
          <input
            type="checkbox" checked={heatmapOn}
            onChange={e => setHeatmapOn(e.target.checked)}
            className="accent-red-500 w-4 h-4"
          />
          🔥 Heatmap
        </label>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2" style={{ height: '550px' }}>
        <DetectionMap detections={filtered} showHeatmap={heatmapOn} />
      </div>

      {/* Bottom Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">Severity Breakdown</h3>
          {['high', 'medium', 'low'].map(s => (
            <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <SeverityBadge severity={s} />
              <span className="font-bold text-gray-700">{counts[s]}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">Legend</h3>
          {[
            { label: 'High severity', color: '#dc3545', radius: 'large' },
            { label: 'Medium severity', color: '#fd7e14', radius: 'medium' },
            { label: 'Low severity', color: '#28a745', radius: 'small' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 rounded-full border-2" style={{ background: s.color + '99', borderColor: s.color }} />
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">Larger circles = higher severity. Enable heatmap for density view.</p>
        </div>
      </div>
    </div>
  )
}
