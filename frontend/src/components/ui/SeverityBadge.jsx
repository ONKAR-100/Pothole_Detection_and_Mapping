import React from 'react'
import { getSeverityEmoji } from '../../lib/utils'

export default function SeverityBadge({ severity }) {
  const colorMap = {
    high:   'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-orange-100 text-orange-800 border border-orange-200',
    low:    'bg-green-100 text-green-800 border border-green-200',
  }
  const classes = colorMap[severity] || 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {getSeverityEmoji(severity)}
      {severity?.toUpperCase()}
    </span>
  )
}
