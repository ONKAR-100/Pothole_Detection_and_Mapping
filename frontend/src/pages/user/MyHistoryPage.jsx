import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMyDetections } from '../../lib/api'
import { formatDate, formatConfidence, formatGPS, exportCSV } from '../../lib/utils'
import SeverityBadge from '../../components/ui/SeverityBadge'
import DetectionMap from '../../components/map/DetectionMap'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MyHistoryPage() {
  const [detections, setDetections] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState({ severity: '', date_from: '', date_to: '' })

  useEffect(() => {
    getMyDetections()
      .then(setDetections)
      .catch(() => toast.error('Failed to load detections'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = detections.filter(d => {
    if (filter.severity   && d.severity !== filter.severity) return false
    if (filter.date_from  && d.created_at < filter.date_from) return false
    if (filter.date_to    && d.created_at > filter.date_to + 'T23:59:59') return false
    return true
  })

  const high     = filtered.filter(d => d.severity === 'high').length
  const thisWeek = filtered.filter(d => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(d.created_at) >= weekAgo
  }).length
  const withGPS  = filtered.filter(d => d.latitude).length

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🗂️ My Detection History</h1>
          <p className="text-gray-500 mt-1">{filtered.length} detections</p>
        </div>
        <button
          onClick={() => exportCSV(filtered, 'my_detections.csv')}
          className="text-sm px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: filtered.length, color: 'text-gray-800' },
          { label: '🔴 High',   value: high,            color: 'text-red-600' },
          { label: 'This Week', value: thisWeek,        color: 'text-blue-600' },
          { label: 'GPS Tagged',value: withGPS,         color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-gray-100 p-4">
        <select
          value={filter.severity}
          onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="date" value={filter.date_from}
          onChange={e => setFilter(f => ({ ...f, date_from: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date" value={filter.date_to}
          onChange={e => setFilter(f => ({ ...f, date_to: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => setFilter({ severity: '', date_from: '', date_to: '' })}
          className="text-sm text-red-600 hover:underline px-2"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Time', 'Source', 'Type', 'Severity', 'Confidence', 'GPS', 'Image'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((d, i) => (
              <tr key={d.id || i} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(d.created_at)}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{d.source_name}</td>
                <td className="px-4 py-3 text-gray-500 uppercase text-xs">{d.input_type}</td>
                <td className="px-4 py-3"><SeverityBadge severity={d.severity} /></td>
                <td className="px-4 py-3 font-medium text-gray-700">{formatConfidence(d.confidence)}</td>
                <td className="px-4 py-3 text-xs text-blue-500">
                  {d.latitude ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  {d.image_url
                    ? <img src={d.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                    : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No detections found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mini Map */}
      {withGPS > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3">🗺️ My Detected Locations</h2>
          <div style={{ height: '350px' }}>
            <DetectionMap detections={filtered} />
          </div>
        </div>
      )}
    </div>
  )
}
