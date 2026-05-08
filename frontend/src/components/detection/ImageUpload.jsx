import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Upload, MapPin, Download, X, Image as ImageIcon } from 'lucide-react'
import { detectImage } from '../../lib/api'
import { formatConfidence, formatGPS } from '../../lib/utils'
import useGPS from '../../hooks/useGPS'
import SeverityBadge from '../ui/SeverityBadge'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ImageUpload() {
  const [files, setFiles]     = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(0.40)
  const [autoSave, setAutoSave]   = useState(true)
  const { lat, lng, error: gpsError, loading: gpsLoading, getLocation } = useGPS()

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted])
    setResults([])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    multiple: true,
  })

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleDetect = async () => {
    if (!files.length) return
    setLoading(true)
    setResults([])
    const newResults = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      if (lat) fd.append('latitude',  lat)
      if (lng) fd.append('longitude', lng)
      fd.append('confidence_threshold', threshold)
      fd.append('auto_save', autoSave)
      try {
        const data = await detectImage(fd)
        newResults.push({ file, ...data })
        if (data.detection_count > 0) {
          toast.success(`${data.detection_count} pothole(s) detected in ${file.name}`)
        } else {
          toast.success(`No potholes detected in ${file.name}`)
        }
      } catch (e) {
        toast.error(`Failed to process ${file.name}: ${e.message}`)
        newResults.push({ file, detections: [], detection_count: 0, error: true })
      }
    }
    setResults(newResults)
    setLoading(false)
  }

  const downloadB64 = (b64, filename) => {
    const a = document.createElement('a')
    a.href = `data:image/jpeg;base64,${b64}`
    a.download = filename
    a.click()
  }

  return (
    <div className="space-y-5">
      {/* GPS Bar */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
        {lat ? (
          <span className="text-sm text-blue-700 font-medium">
            📍 {formatGPS(lat, lng)}
          </span>
        ) : (
          <span className="text-sm text-gray-500">GPS not captured — detections won't be map-tagged</span>
        )}
        <button
          onClick={getLocation}
          disabled={gpsLoading}
          className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {gpsLoading ? 'Getting GPS…' : '📍 Get Location'}
        </button>
        {gpsError && <span className="text-xs text-red-500">{gpsError}</span>}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          {isDragActive ? 'Drop images here…' : 'Drag & drop images or click to upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, BMP — multiple files supported</p>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-24 h-24 rounded-xl object-cover border border-gray-200"
              />
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs text-gray-400 mt-1 max-w-[96px] truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Settings Row */}
      <div className="flex items-center gap-6 bg-gray-50 rounded-xl px-4 py-3">
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
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox" checked={autoSave}
            onChange={e => setAutoSave(e.target.checked)}
            className="accent-red-500 w-4 h-4"
          />
          Auto-save
        </label>
      </div>

      {/* Detect Button */}
      <button
        onClick={handleDetect}
        disabled={!files.length || loading}
        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Processing {files.length} image{files.length > 1 ? 's' : ''}…
          </>
        ) : (
          <>🔍 Analyze {files.length} Image{files.length !== 1 ? 's' : ''}</>
        )}
      </button>

      {/* Results */}
      {results.map((result, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm slide-in">
          <div className="flex flex-col lg:flex-row">
            {/* Annotated image */}
            <div className="lg:w-3/5 p-4">
              {result.annotated_image_b64 ? (
                <img
                  src={`data:image/jpeg;base64,${result.annotated_image_b64}`}
                  alt="annotated"
                  className="w-full rounded-xl border border-gray-100"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {result.annotated_image_b64 && (
                <button
                  onClick={() => downloadB64(result.annotated_image_b64, `annotated_${result.file?.name}`)}
                  className="mt-2 flex items-center gap-2 text-xs text-blue-600 hover:underline"
                >
                  <Download className="w-3 h-3" /> Download annotated image
                </button>
              )}
            </div>

            {/* Detection info */}
            <div className="lg:w-2/5 p-4 border-t lg:border-t-0 lg:border-l border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3 truncate">{result.file?.name}</p>

              {result.detection_count === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-sm font-medium text-green-700">No potholes detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="bg-red-50 rounded-xl p-3 text-center flex-1">
                      <div className="text-2xl font-bold text-red-600">{result.detection_count}</div>
                      <div className="text-xs text-gray-500">Detected</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center flex-1">
                      <div className="text-sm font-bold text-gray-700">
                        {formatConfidence(Math.max(...result.detections.map(d => d.confidence)))}
                      </div>
                      <div className="text-xs text-gray-500">Max Conf.</div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.detections.map((d, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg p-2">
                        <SeverityBadge severity={d.severity} />
                        <span className="text-gray-600">{formatConfidence(d.confidence)}</span>
                        <span className="text-gray-400 ml-auto">
                          {d.x1},{d.y1}→{d.x2},{d.y2}
                        </span>
                      </div>
                    ))}
                  </div>

                  {lat && (
                    <p className="text-xs text-blue-500">📍 GPS tagged: {formatGPS(lat, lng)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
