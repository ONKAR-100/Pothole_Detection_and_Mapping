// ── Severity helpers ──────────────────────────────────────────────────────────
export function getSeverityColor(severity) {
  return { high: '#dc3545', medium: '#fd7e14', low: '#28a745' }[severity] || '#888'
}

export function getSeverityBg(severity) {
  return {
    high:   'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-orange-100 text-orange-800 border border-orange-200',
    low:    'bg-green-100 text-green-800 border border-green-200',
  }[severity] || 'bg-gray-100 text-gray-700'
}

export function getSeverityEmoji(severity) {
  return { high: '🔴', medium: '🟡', low: '🟢' }[severity] || '⚪'
}

// ── Formatters ────────────────────────────────────────────────────────────────
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString()
}

export function formatDateShort(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString()
}

export function formatConfidence(conf) {
  if (conf == null) return '—'
  return `${(conf * 100).toFixed(1)}%`
}

export function formatGPS(lat, lng) {
  if (!lat || !lng) return 'GPS not available'
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function generateFilename(prefix = 'detection', ext = 'jpg') {
  return `${prefix}_${Date.now()}.${ext}`
}

// ── CSV export ─────────────────────────────────────────────────────────────────
export function exportCSV(data, filename = 'detections.csv') {
  if (!data || !data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map(row =>
    keys.map(k => {
      const v = row[k] ?? ''
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    }).join(',')
  )]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Date utilities ────────────────────────────────────────────────────────────
export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
