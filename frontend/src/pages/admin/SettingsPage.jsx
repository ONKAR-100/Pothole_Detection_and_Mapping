import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../../lib/api'

export default function SettingsPage() {
  const [health, setHealth] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    api.get('/health')
      .then((r) => setHealth(r.data))
      .catch(() => setHealth({ status: 'error' }))
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">API Health</span>
            {health ? (
              health.status === 'ok'
                ? <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Online</span>
                : <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium"><XCircle className="w-4 h-4" /> Offline</span>
            ) : (
              <span className="text-gray-400 text-sm">Checking...</span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Backend</span>
            <span className="text-sm text-gray-500">{health?.backend || 'flask'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Model Path</span>
            <span className="text-sm font-mono text-gray-500">{health?.model_path || 'models/best.pt'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Model Status</span>
            {health?.model_ok
              ? <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Loaded</span>
              : <span className="text-red-600 text-sm font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Not found</span>}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">API Version</span>
            <span className="text-sm text-gray-500">{health?.version || '3.0'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800">Detection Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Default Confidence Threshold
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Configured via <code className="bg-gray-100 px-1 rounded">backend/.env</code>: <code className="bg-gray-100 px-1 rounded">CONFIDENCE_THRESHOLD=0.40</code>
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
              Current: 0.40 (40%). Change <code className="bg-gray-100 px-1 rounded">backend/.env</code> and restart the backend.
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Alert Trigger</label>
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full">
              <option>All detections</option>
              <option>Medium and above</option>
              <option>High severity only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800">Email Alerts</h2>
        <p className="text-xs text-gray-400">
          Configure via <code className="bg-gray-100 px-1 rounded">backend/.env</code>: <code className="bg-gray-100 px-1 rounded">SENDGRID_API_KEY</code>, <code className="bg-gray-100 px-1 rounded">ALERT_FROM_EMAIL</code>
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="accent-red-500 w-4 h-4" />
          <span className="text-sm text-gray-700">Send email alert on high severity detection</span>
        </label>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Additional alert recipients (comma separated)</label>
          <input
            type="text"
            placeholder="extra@email.com, another@email.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-red-700">Danger Zone</h2>
        <p className="text-sm text-gray-600">
          Destructive actions. These cannot be undone.
        </p>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">Clear All Detections</p>
          <p className="text-xs text-gray-500 mb-3">
            Permanently deletes all detection records from the local data store.
            Type <strong>DELETE</strong> to confirm.
          </p>
          <input
            type="text"
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            disabled={deleteConfirm !== 'DELETE'}
            onClick={() => toast.error('Not implemented. Clear backend/data/local_db.json manually if needed.')}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear All Detections
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">Quick Links</h2>
        <div className="space-y-2">
          {[
            { label: 'Frontend App', url: 'http://localhost:5173' },
            { label: 'Backend Health', url: 'http://localhost:8000/health' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
