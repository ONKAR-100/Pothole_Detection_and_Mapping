import React, { useState } from 'react'
import ImageUpload from '../../components/detection/ImageUpload'
import VideoUpload from '../../components/detection/VideoUpload'
import WebcamCapture from '../../components/detection/WebcamCapture'

const TABS = [
  { id: 'image',  label: '📷 Image',  component: <ImageUpload /> },
  { id: 'video',  label: '🎬 Video',  component: <VideoUpload /> },
  { id: 'webcam', label: '📹 Webcam', component: <WebcamCapture /> },
]

export default function DetectPage() {
  const [activeTab, setActiveTab] = useState('image')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">🎯 Pothole Detection</h1>
        <p className="text-gray-500 mt-1">Upload images or videos, or use your live webcam.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {TABS.find(t => t.id === activeTab)?.component}
      </div>
    </div>
  )
}
