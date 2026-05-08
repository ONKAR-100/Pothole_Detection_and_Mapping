import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { getContacts, createContact, deleteContact } from '../../lib/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MunicipalityPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm]         = useState({ name: '', email: '', phone: '', region: '' })

  const load = () => {
    getContacts()
      .then(setContacts)
      .catch(() => toast.error('Failed to load contacts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      await createContact(form)
      toast.success('Contact added!')
      setForm({ name: '', email: '', phone: '', region: '' })
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.message || 'Failed to add contact')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      await deleteContact(id)
      toast.success('Contact removed')
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch {
      toast.error('Failed to delete contact')
    }
    setConfirmDelete(null)
  }

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🏛️ Municipality Contacts</h1>
          <p className="text-gray-500 mt-1">{contacts.length} active contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Contact
          {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 slide-in">
          <h2 className="font-bold text-gray-800">New Contact</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'name',   label: 'Full Name*', placeholder: 'Municipal Officer' },
              { key: 'email',  label: 'Email*',     placeholder: 'officer@muni.gov', type: 'email' },
              { key: 'phone',  label: 'Phone',      placeholder: '+91 9876543210' },
              { key: 'region', label: 'Region',     placeholder: 'North Zone' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="submit" disabled={saving}
              className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Save Contact'}
            </button>
            <button
              type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <p className="text-gray-500">No contacts yet. Add your first municipality contact.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {c.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">{c.email}</p>
                <div className="flex gap-3 mt-0.5">
                  {c.phone  && <span className="text-xs text-gray-400">📞 {c.phone}</span>}
                  {c.region && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{c.region}</span>}
                </div>
              </div>
              {confirmDelete === c.id ? (
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">Confirm</button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(c.id)}
                  className="text-gray-300 hover:text-red-500 transition p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
