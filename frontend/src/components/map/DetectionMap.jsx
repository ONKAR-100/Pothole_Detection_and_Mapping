import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet'
import { getSeverityColor } from '../../lib/utils'
import HeatmapLayer from './HeatmapLayer'
import DetectionPopup from './DetectionPopup'

const RADIUS_MAP = { low: 8, medium: 12, high: 16 }

export default function DetectionMap({
  detections = [],
  showHeatmap = false,
  centerLat = 20.0,
  centerLng = 78.0,
  zoom = 5,
  userLocation = null,
}) {
  const gpsDetections = detections.filter(d => d.latitude && d.longitude)

  // Auto-center on first detection if available
  const mapCenter = gpsDetections.length > 0
    ? [gpsDetections[0].latitude, gpsDetections[0].longitude]
    : [centerLat, centerLng]

  const mapZoom = gpsDetections.length > 0 ? 12 : zoom

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="text-sm font-semibold">📍 You are here</div>
          </Popup>
        </Marker>
      )}

      {gpsDetections.map(d => (
        <CircleMarker
          key={d.id}
          center={[d.latitude, d.longitude]}
          radius={RADIUS_MAP[d.severity] || 8}
          pathOptions={{
            color:       getSeverityColor(d.severity),
            fillColor:   getSeverityColor(d.severity),
            fillOpacity: 0.8,
            weight:      2,
          }}
        >
          <Popup maxWidth={260}>
            <DetectionPopup detection={d} />
          </Popup>
        </CircleMarker>
      ))}

      {showHeatmap && gpsDetections.length > 0 && (
        <HeatmapLayer detections={gpsDetections} />
      )}
    </MapContainer>
  )
}
