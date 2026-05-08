import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleEnter = async (role) => {
    const nextUser = await login('', '', role)
    toast.success(`Entered as ${nextUser.role}`)
    navigate(nextUser.role === 'admin' ? '/admin/dashboard' : '/detect')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-4 shadow-xl">
            <AlertTriangle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">PotholeWatch</h1>
          <p className="text-slate-400 mt-2 text-sm">Choose how you want to enter the app</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleEnter('user')}
            className="bg-white rounded-2xl shadow-2xl p-6 text-left border border-gray-100 hover:border-blue-300 hover:-translate-y-0.5 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <UserRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">User Mode</h2>
            <p className="text-sm text-gray-500 mt-2">Open detection, history, and map pages.</p>
          </button>

          <button
            type="button"
            onClick={() => handleEnter('admin')}
            className="bg-white rounded-2xl shadow-2xl p-6 text-left border border-gray-100 hover:border-red-300 hover:-translate-y-0.5 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Admin Mode</h2>
            <p className="text-sm text-gray-500 mt-2">Open dashboard, reports, alerts, and settings.</p>
          </button>
        </div>
      </div>
    </div>
  )
}
