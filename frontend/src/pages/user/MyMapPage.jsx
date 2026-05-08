import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMyDetections } from '../../lib/api'
import DetectionMap from '../../components/map/DetectionMap'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useGPS from '../../hooks/useGPS'

export default function MyMapPage() {
  const [detections, setDetections] = useState([])
  const [loading, setLoading]       = useState(true)
  const { lat, lng, getLocation }   = useGPS()

  useEffect(() => {
    getMyDetections()
      .then(setDetections)
      .catch(() => toast.error('Failed to load detections'))
      .finally(() => setLoading(false))
  }, [])

  const gpsTagged = detections.filter(d => d.latitude)

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🗺️ My Pothole Map</h1>
          <p className="text-gray-500 mt-1">{gpsTagged.length} GPS-tagged detection{gpsTagged.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={getLocation}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          📍 Show My Location
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1" style={{ height: '550px' }}>
        {gpsTagged.length === 0 ? (
          <div className="flex items-center justify-center h-full flex-col gap-3 text-gray-400">
            <div className="text-5xl">🗺️</div>
            <p className="text-lg font-medium">No GPS-tagged detections yet</p>
            <p className="text-sm">Enable GPS when detecting potholes to see them on the map</p>
          </div>
        ) : (
          <DetectionMap
            detections={gpsTagged}
            userLocation={lat && lng ? { lat, lng } : null}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3 text-xs">
        <span className="font-medium text-gray-600">Severity:</span>
        {[
          { label: 'High', color: '#dc3545' },
          { label: 'Medium', color: '#fd7e14' },
          { label: 'Low', color: '#28a745' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="text-gray-600">{s.label}</span>
          </div>
        ))}
        <span className="ml-auto text-gray-400">Larger circle = higher severity</span>
      </div>
    </div>
  )
}
