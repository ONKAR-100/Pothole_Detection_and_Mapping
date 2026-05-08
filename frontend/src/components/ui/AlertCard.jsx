import React from 'react'
import { formatDate, formatConfidence, getSeverityColor } from '../../lib/utils'
import SeverityBadge from './SeverityBadge'

export default function AlertCard({ alert }) {
  const borderColor = getSeverityColor(alert.severity)
  const det = alert.detections || {}

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${!alert.is_read ? 'ring-1 ring-gray-200' : ''}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={alert.severity} />
            {!alert.is_read && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">New</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1.5 font-medium">{alert.message}</p>
          {det.source_name && (
            <p className="text-xs text-gray-400 mt-0.5">Source: {det.source_name}</p>
          )}
        </div>
        {det.image_url && (
          <img
            src={det.image_url}
            alt="alert"
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
        )}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs text-gray-400">{formatDate(alert.created_at)}</span>
        {det.latitude && (
          <span className="text-xs text-gray-400">
            📍 {det.latitude?.toFixed(4)}, {det.longitude?.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  )
}
