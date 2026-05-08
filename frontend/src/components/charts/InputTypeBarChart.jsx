import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function InputTypeBarChart({ detections = [] }) {
  const counts = { image: 0, video: 0, webcam: 0 }
  for (const d of detections) {
    if (d.input_type in counts) counts[d.input_type]++
  }
  const data = [
    { name: '📷 Image',  count: counts.image  },
    { name: '🎬 Video',  count: counts.video  },
    { name: '📹 Webcam', count: counts.webcam },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
        <YAxis tick={{ fontSize: 11, fill: '#888' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          formatter={(v) => [v, 'Detections']}
        />
        <Bar dataKey="count" name="Detections" fill="#e74c3c" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
