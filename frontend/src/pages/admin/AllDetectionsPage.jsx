import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAllDetections } from '../../lib/api'
import { formatDate, formatConfidence, exportCSV } from '../../lib/utils'
import SeverityBadge from '../../components/ui/SeverityBadge'
import DetectionCard from '../../components/ui/DetectionCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AllDetectionsPage() {
  const [detections, setDetections] = useState([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState('table')
  const [selected, setSelected]     = useState(null)
  const [filters, setFilters]       = useState({ severity: '', input_type: '', date_from: '', date_to: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllDetections(Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      ))
      setDetections(data)
    } catch {
      toast.error('Failed to load detections')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const applyFilters = () => load()
  const resetFilters = () => {
    setFilters({ severity: '', input_type: '', date_from: '', date_to: '' })
    setTimeout(load, 0)
  }

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🗂️ All Detections</h1>
          <p className="text-gray-500 mt-1">{detections.length} records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(detections, 'all_detections.csv')}
            className="text-sm px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            ⬇️ CSV
          </button>
          <button
            onClick={() => setView(v => v === 'table' ? 'gallery' : 'table')}
            className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            {view === 'table' ? '🖼️ Gallery' : '📋 Table'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Severity</label>
          <select
            value={filters.severity}
            onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Input Type</label>
          <select
            value={filters.input_type}
            onChange={e => setFilters(f => ({ ...f, input_type: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="webcam">Webcam</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" value={filters.date_from}
            onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" value={filters.date_to}
            onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={applyFilters}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition">
          Apply
        </button>
        <button onClick={resetFilters}
          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition">
          Reset
        </button>
      </div>

      {/* Gallery */}
      {view === 'gallery' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {detections.map((d, i) => (
            <div key={d.id || i} onClick={() => setSelected(d)} className="cursor-pointer hover:scale-105 transition">
              <DetectionCard detection={d} />
            </div>
          ))}
          {!detections.length && (
            <div className="col-span-4 text-center py-12 text-gray-400">No detections found</div>
          )}
        </div>
      )}

      {/* Table */}
      {view === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['#', 'Time', 'User', 'Type', 'Severity', 'Confidence', 'GPS', 'Image'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {detections.map((d, i) => (
                <tr key={d.id || i}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected(d)}
                >
                  <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">{formatDate(d.created_at)}</td>
                  <td className="px-4 py-2.5 text-xs truncate max-w-[100px]">{d.profiles?.email || '—'}</td>
                  <td className="px-4 py-2.5 text-xs uppercase text-gray-400">{d.input_type}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={d.severity} /></td>
                  <td className="px-4 py-2.5 font-medium">{formatConfidence(d.confidence)}</td>
                  <td className="px-4 py-2.5 text-xs text-blue-500">{d.latitude ? '📍' : '—'}</td>
                  <td className="px-4 py-2.5">
                    {d.image_url ? <img src={d.image_url} alt="" className="w-9 h-9 rounded object-cover" /> : '—'}
                  </td>
                </tr>
              ))}
              {!detections.length && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No detections found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-gray-800">Detection Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            {selected.image_url && (
              <img src={selected.image_url} alt="" className="w-full rounded-xl mb-4 object-cover max-h-64" />
            )}
            <div className="space-y-2 text-sm">
              {[
                ['Severity',   <SeverityBadge severity={selected.severity} />],
                ['Confidence', formatConfidence(selected.confidence)],
                ['Date',       formatDate(selected.created_at)],
                ['Type',       selected.input_type],
                ['Source',     selected.source_name],
                ['GPS',        selected.latitude ? `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}` : '—'],
                ['User',       selected.profiles?.email || '—'],
                ['Notes',      selected.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 py-1 border-b border-gray-50">
                  <span className="text-gray-500 w-24 shrink-0">{k}:</span>
                  <span className="text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
