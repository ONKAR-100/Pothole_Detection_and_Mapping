import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAllDetections, generateReport, sendReport, getReports, getContacts } from '../../lib/api'
import { formatDate, daysAgo, todayISO } from '../../lib/utils'
import SeverityBadge from '../../components/ui/SeverityBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ReportsPage() {
  const [tab, setTab]           = useState('generate')
  const [dateFrom, setDateFrom] = useState(daysAgo(7))
  const [dateTo, setDateTo]     = useState(todayISO())
  const [notes, setNotes]       = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending]   = useState(false)

  // Preview
  const [preview, setPreview]   = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Contacts
  const [contacts, setContacts]           = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])

  // History
  const [reports, setReports]   = useState([])
  const [histLoading, setHistLoading] = useState(false)

  // Load contacts on mount
  useEffect(() => {
    getContacts().then(setContacts).catch(() => {})
  }, [])

  // Load preview when dates change
  useEffect(() => {
    if (!dateFrom || !dateTo) return
    setPreviewLoading(true)
    getAllDetections({ date_from: dateFrom, date_to: dateTo })
      .then(data => {
        const total  = data.length
        const high   = data.filter(d => d.severity === 'high').length
        const medium = data.filter(d => d.severity === 'medium').length
        const low    = data.filter(d => d.severity === 'low').length
        const gps    = data.filter(d => d.latitude).length
        setPreview({ total, high, medium, low, gps, sample: data.slice(0, 5) })
      })
      .catch(() => {})
      .finally(() => setPreviewLoading(false))
  }, [dateFrom, dateTo])

  const loadHistory = async () => {
    setHistLoading(true)
    getReports().then(setReports).catch(() => toast.error('Failed to load reports')).finally(() => setHistLoading(false))
  }

  useEffect(() => {
    if (tab === 'history') loadHistory()
  }, [tab])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const blob = await generateReport({ date_from: dateFrom, date_to: dateTo, notes })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `pothole_report_${dateFrom}_${dateTo}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF generated & downloaded!')
    } catch (e) {
      toast.error('Report generation failed: ' + e.message)
    }
    setGenerating(false)
  }

  const handleSend = async () => {
    if (!selectedContacts.length) {
      toast.error('Select at least one contact')
      return
    }
    setSending(true)
    try {
      const result = await sendReport({ date_from: dateFrom, date_to: dateTo, contact_ids: selectedContacts, notes })
      if (result.success) {
        toast.success(`Report sent to ${result.sent_to?.length} contact(s)!`)
        setSelectedContacts([])
      } else {
        toast.error(result.error || 'Send failed')
      }
    } catch (e) {
      toast.error('Send failed: ' + e.message)
    }
    setSending(false)
  }

  const toggleContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">📄 Report Generator</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'generate', label: '📄 Generate' },
          { id: 'history',  label: '🗂️ History' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERATE TAB ────────────────────────────────────────────────── */}
      {tab === 'generate' && (
        <div className="space-y-5">
          {/* Date Range */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Report Configuration</h2>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-500 block mb-1">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes for this report…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          {/* Preview */}
          {previewLoading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-bold text-blue-800 mb-3">📊 Period Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                  { label: 'Total', value: preview.total, color: 'text-gray-800' },
                  { label: '🔴 High', value: preview.high, color: 'text-red-600' },
                  { label: '🟡 Medium', value: preview.medium, color: 'text-orange-500' },
                  { label: '🟢 Low', value: preview.low, color: 'text-green-600' },
                  { label: '📍 GPS', value: preview.gps, color: 'text-blue-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              {preview.sample.length > 0 && (
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-2">Sample detections:</p>
                  {preview.sample.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-1.5 mb-1">
                      <SeverityBadge severity={d.severity} />
                      <span className="text-gray-500">{d.source_name}</span>
                      <span className="ml-auto text-gray-400">{d.created_at?.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? <LoadingSpinner size="sm" /> : '📄 Generate & Download PDF'}
          </button>

          {/* Send to Contacts */}
          {contacts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-800">📧 Send to Municipality Contacts</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contacts.map(c => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(c.id)}
                      onChange={() => toggleContact(c.id)}
                      className="accent-red-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email} · {c.region}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !selectedContacts.length}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <LoadingSpinner size="sm" /> : `📧 Send to ${selectedContacts.length} Contact(s)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ─────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {histLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Generated', 'Period', 'Total', 'Sent To', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{formatDate(r.generated_at)}</td>
                    <td className="px-4 py-3 text-xs">{r.date_from} → {r.date_to}</td>
                    <td className="px-4 py-3 font-medium">{r.total_detections}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.sent_to_emails?.join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'sent'  ? 'bg-green-100 text-green-700' :
                        r.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!reports.length && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No reports generated yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
