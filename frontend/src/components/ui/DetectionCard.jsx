import React from 'react'
import { formatDate, formatConfidence, formatGPS } from '../../lib/utils'
import SeverityBadge from './SeverityBadge'

export default function DetectionCard({ detection, showImage = true }) {
  const d = detection
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {showImage && d.image_url && (
        <img src={d.image_url} alt="detection" className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <SeverityBadge severity={d.severity} />
          <span className="text-sm font-semibold text-gray-700">{formatConfidence(d.confidence)}</span>
        </div>
        <p className="text-xs text-gray-500">{formatDate(d.created_at)}</p>
        <p className="text-xs text-gray-400 mt-1">
          {d.input_type?.toUpperCase()} · {d.source_name}
        </p>
        {d.latitude && (
          <p className="text-xs text-blue-500 mt-1">📍 {formatGPS(d.latitude, d.longitude)}</p>
        )}
      </div>
    </div>
  )
}
