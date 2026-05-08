import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function DetectionTimeline({ data = [] }) {
  if (!data.length) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data for selected period</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#888' }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 10, fill: '#888' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Legend
          formatter={(v) => <span style={{ fontSize: '12px', color: '#555' }}>{v}</span>}
        />
        <Bar dataKey="high"   name="High"   fill="#dc3545" radius={[3,3,0,0]} />
        <Bar dataKey="medium" name="Medium" fill="#fd7e14" radius={[3,3,0,0]} />
        <Bar dataKey="low"    name="Low"    fill="#28a745" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
