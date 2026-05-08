import React from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { getSeverityColor } from '../../lib/utils'

export default function ConfidenceScatter({ detections = [] }) {
  const data = detections.slice(0, 200).map(d => ({
    conf:     Math.round(d.confidence * 100),
    area:     Math.round((d.bbox_area_pct || 0) * 100 * 10) / 10,
    severity: d.severity,
  }))

  if (!data.length) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          type="number" dataKey="conf" name="Confidence"
          unit="%" domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#888' }}
          label={{ value: 'Confidence %', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#888' }}
        />
        <YAxis
          type="number" dataKey="area" name="BBox Area"
          unit="%"
          tick={{ fontSize: 10, fill: '#888' }}
          label={{ value: 'Area %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#888' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          formatter={(v, n) => [`${v}%`, n]}
        />
        <Scatter data={data}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getSeverityColor(entry.severity)} fillOpacity={0.7} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
