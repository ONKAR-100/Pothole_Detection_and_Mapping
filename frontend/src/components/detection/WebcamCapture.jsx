import React, { useState, useRef, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { MapPin, Play, Square, Save } from 'lucide-react'
import { detectFrame } from '../../lib/api'
import { getSeverityColor, formatConfidence, formatGPS } from '../../lib/utils'
import useGPS from '../../hooks/useGPS'

export default function WebcamCapture() {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const intervalRef = useRef(null)

  const [streaming, setStreaming]     = useState(false)
  const [totalCount, setTotalCount]   = useState(0)
  const [highCount, setHighCount]     = useState(0)
  const [lastTime, setLastTime]       = useState(null)
  const [lastDetections, setLastDetections] = useState([])
  const [showHighAlert, setShowHighAlert]   = useState(false)
  const [threshold, setThreshold]     = useState(0.40)
  const { lat, lng, error: gpsError, loading: gpsLoading, getLocation } = useGPS()

  const drawFrame = useCallback((detections = []) => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    for (const d of detections) {
      const color = getSeverityColor(d.severity)
      const { x1, y1, x2, y2 } = d
      // Semi-transparent fill
      ctx.fillStyle = color + '40'
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
      // Border
      ctx.strokeStyle = color
      ctx.lineWidth   = 3
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
      // Label
      const label = `Pothole ${d.severity.toUpperCase()} ${formatConfidence(d.confidence)}`
      ctx.font = '13px Inter, sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = color
      ctx.fillRect(x1, Math.max(y1 - 24, 0), tw + 10, 24)
      ctx.fillStyle = 'white'
      ctx.fillText(label, x1 + 5, Math.max(y1 - 6, 18))
    }
  }, [])

  const captureAndDetect = useCallback(async () => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video || !video.videoWidth) return

    // Draw current video frame first
    const ctx = canvas.getContext('2d')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const fd = new FormData()
      fd.append('file', blob, 'frame.jpg')
      fd.append('confidence_threshold', threshold)
      try {
        const data = await detectFrame(fd)
        drawFrame(data.detections || [])
        if (data.detections?.length > 0) {
          setLastDetections(data.detections)
          setTotalCount(prev => prev + data.detections.length)
          const newHigh = data.detections.filter(d => d.severity === 'high').length
          if (newHigh > 0) {
            setHighCount(prev => prev + newHigh)
            setShowHighAlert(true)
            setTimeout(() => setShowHighAlert(false), 3000)
          }
          setLastTime(new Date().toLocaleTimeString())
        } else {
          drawFrame([])
          setLastDetections([])
        }
      } catch {
        drawFrame([])
      }
    }, 'image/jpeg', 0.85)
  }, [threshold, drawFrame])

  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setStreaming(true)
      // Start sending frames every 500ms
      intervalRef.current = setInterval(captureAndDetect, 500)
    } catch (e) {
      toast.error(`Webcam access denied: ${e.message}`)
    }
  }

  const stopDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setStreaming(false)
    setLastDetections([])
  }

  // Re-setup interval when threshold changes while streaming
  useEffect(() => {
    if (streaming) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(captureAndDetect, 500)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [threshold, streaming, captureAndDetect])

  useEffect(() => {
    return () => stopDetection()
  }, [])

  return (
    <div className="space-y-5">
      {/* GPS Bar */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
        {lat ? (
          <span className="text-sm text-blue-700 font-medium">📍 {formatGPS(lat, lng)}</span>
        ) : (
          <span className="text-sm text-gray-500">No GPS location captured</span>
        )}
        <button
          onClick={getLocation}
          disabled={gpsLoading}
          className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {gpsLoading ? 'Getting GPS…' : '📍 Get Location'}
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Confidence: <span className="text-red-600 font-bold">{(threshold * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range" min={0.2} max={0.9} step={0.05}
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            className="flex-1 accent-red-500"
          />
        </div>
        <p className="text-xs text-gray-400 shrink-0">Frame rate: ~2 fps</p>
      </div>

      {/* Camera + Controls */}
      <div className="flex gap-3">
        <button
          onClick={startDetection}
          disabled={streaming}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-40"
        >
          <Play className="w-4 h-4" /> Start Detection
        </button>
        <button
          onClick={stopDetection}
          disabled={!streaming}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-40"
        >
          <Square className="w-4 h-4" /> Stop
        </button>
      </div>

      {/* Video (hidden) + Canvas (visible) */}
      <video
        ref={videoRef}
        autoPlay muted playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl border border-gray-200 bg-gray-900"
        style={{ minHeight: '300px', maxHeight: '500px', objectFit: 'contain' }}
      />

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Detected', value: totalCount, color: 'text-gray-800' },
          { label: '🔴 High Severity', value: highCount, color: 'text-red-600' },
          { label: 'Last Detection', value: lastTime || '—', color: 'text-gray-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* High Alert Banner */}
      {showHighAlert && (
        <div className="bg-red-600 text-white rounded-xl px-4 py-3 flex items-center gap-3 pulse-alert">
          <span className="text-xl">🔴</span>
          <span className="font-semibold">HIGH SEVERITY POTHOLE DETECTED!</span>
        </div>
      )}
    </div>
  )
}
