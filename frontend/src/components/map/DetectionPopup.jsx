import React from 'react'
import { formatDate, formatConfidence, formatGPS } from '../../lib/utils'
import SeverityBadge from '../ui/SeverityBadge'

export default function DetectionPopup({ detection: d }) {
  return (
    <div style={{ maxWidth: '240px', fontSize: '13px' }}>
      {d.image_url && (
        <img
          src={d.image_url}
          alt="detection"
          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{
          padding: '2px 8px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '11px',
          background: d.severity === 'high' ? '#dc3545' : d.severity === 'medium' ? '#fd7e14' : '#28a745',
          color: 'white'
        }}>
          {d.severity?.toUpperCase()}
        </span>
        <span style={{ color: '#555', fontWeight: 600 }}>
          {formatConfidence(d.confidence)}
        </span>
      </div>
      <p style={{ color: '#666', margin: '3px 0' }}>📅 {formatDate(d.created_at)}</p>
      <p style={{ color: '#666', margin: '3px 0' }}>📷 {d.input_type} — {d.source_name}</p>
      <p style={{ color: '#007bff', margin: '3px 0' }}>
        📍 {formatGPS(d.latitude, d.longitude)}
      </p>
      {d.notes && <p style={{ color: '#888', marginTop: '4px', fontStyle: 'italic' }}>{d.notes}</p>}
    </div>
  )
}
