import { useState, useCallback } from 'react'

export default function useGPS() {
  const [lat, setLat]         = useState(null)
  const [lng, setLng]         = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Unable to retrieve location')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [])

  const clearLocation = () => {
    setLat(null)
    setLng(null)
    setError(null)
  }

  return { lat, lng, error, loading, getLocation, clearLocation }
}
