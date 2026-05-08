import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 }

export default function HeatmapLayer({ detections = [] }) {
  const map = useMap()

  useEffect(() => {
    const points = detections
      .filter(d => d.latitude && d.longitude)
      .map(d => [d.latitude, d.longitude, SEVERITY_WEIGHT[d.severity] || 1])

    const heatLayer = L.heatLayer(points, {
      radius:  25,
      blur:    15,
      maxZoom: 13,
      gradient: {
        0.0: '#00ff00',
        0.5: '#ffff00',
        1.0: '#ff0000',
      },
    })

    map.addLayer(heatLayer)
    return () => map.removeLayer(heatLayer)
  }, [map, detections])

  return null
}
