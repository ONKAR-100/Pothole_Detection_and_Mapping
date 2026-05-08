import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Video, MapPin, Download } from 'lucide-react'
import { detectVideo, downloadAnnotatedVideo } from '../../lib/api'
import { formatConfidence, formatGPS, formatFileSize } from '../../lib/utils'
import useGPS from '../../hooks/useGPS'
import SeverityBadge from '../ui/SeverityBadge'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function VideoUpload() {
  const [file, setFile]       = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult]   = useState(null)
  const [threshold, setThreshold] = useState(0.40)
  const { lat, lng, error: gpsError, loading: gpsLoading, getLocation } = useGPS()

  const onDrop = useCallback((accepted) => {
    if (accepted.length) {
      setFile(accepted[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.avi', '.mov', '.webm'] },
    multiple: false,
  })

  const handleDetect = async () => {
    if (!file) return
    setProcessing(true)
    setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    if (lat) fd.append('latitude', lat)
    if (lng) fd.append('longitude', lng)
    fd.append('confidence_threshold', threshold)
    try {
      const data = await detectVideo(fd)
      setResult(data)
      toast.success(`Video processed — ${data.detection_count} pothole(s) found`)
    } catch (e) {
      toast.error(`Video processing failed: ${e.message}`)
    }
    setProcessing(false)
  }

  const downloadVideo = async () => {
    if (!result?.output_video_path) return

    try {
      const blob = await downloadAnnotatedVideo(result.output_video_path)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `annotated_${file?.name || 'video'}.mp4`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(`Download failed: ${e.message}`)
    }
  }

  const highCount   = result?.detections?.filter(d => d.severity === 'high').length   || 0
  const mediumCount = result?.detections?.filter(d => d.severity === 'medium').length || 0
  const lowCount    = result?.detections?.filter(d => d.severity === 'low').length    || 0
  const maxFrame    = result?.detections?.reduce((a, d) => Math.max(a, d.frame_number || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* GPS Bar */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
        {lat ? (
          <span className="text-sm text-blue-700 font-medium">📍 {formatGPS(lat, lng)}</span>
        ) : (
          <span className="text-sm text-gray-500">No GPS — detections won't be map-tagged</span>
        )}
        <button
          onClick={getLocation}
          disabled={gpsLoading}
          className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {gpsLoading ? 'Getting GPS…' : '📍 Get Location'}
        </button>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        {file ? (
          <div>
            <p className="text-gray-700 font-semibold">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              {isDragActive ? 'Drop video here…' : 'Drag & drop a video or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">MP4, AVI, MOV, WebM</p>
          </>
        )}
      </div>

      {/* Settings */}
      <div className="flex items-center gap-6 bg-gray-50 rounded-xl px-4 py-3">
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

      {/* Detect Button */}
      <button
        onClick={handleDetect}
        disabled={!file || processing}
        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <LoadingSpinner size="sm" />
            Processing frames…
          </>
        ) : '▶ Analyze Video'}
      </button>

      {processing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-800 font-medium">🎬 Analyzing video frame by frame…</p>
          <p className="text-xs text-yellow-600 mt-1">Large videos may take 1–3 minutes on CPU. Please wait.</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm slide-in">
          <h3 className="font-bold text-gray-800 mb-4">📊 Video Detection Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total', value: result.detection_count, color: 'text-gray-800' },
              { label: '🔴 High',   value: highCount,   color: 'text-red-600' },
              { label: '🟡 Medium', value: mediumCount, color: 'text-orange-500' },
              { label: '🟢 Low',    value: lowCount,    color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-3">Frames processed: ~{maxFrame + 1}</p>

          {/* Detection list (top 30) */}
          <div className="max-h-56 overflow-y-auto space-y-1">
            {result.detections.slice(0, 30).map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 w-16 shrink-0">Frame {d.frame_number}</span>
                <SeverityBadge severity={d.severity} />
                <span className="text-gray-600">{formatConfidence(d.confidence)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={downloadVideo}
            className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Download className="w-4 h-4" /> Download Annotated Video
          </button>
        </div>
      )}
    </div>
  )
}
