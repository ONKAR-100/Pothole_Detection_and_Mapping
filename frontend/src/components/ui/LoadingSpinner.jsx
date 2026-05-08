import React from 'react'

export default function LoadingSpinner({ fullscreen = false, size = 'md', message = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-4 border-red-200 border-t-red-500 rounded-full spin`} />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
