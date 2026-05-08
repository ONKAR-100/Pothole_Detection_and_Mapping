import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = { high: '#dc3545', medium: '#fd7e14', low: '#28a745' }

export default function SeverityPieChart({ stats }) {
  const data = [
    { name: 'High',   value: stats?.high   || 0, color: COLORS.high   },
    { name: 'Medium', value: stats?.medium || 0, color: COLORS.medium },
    { name: 'Low',    value: stats?.low    || 0, color: COLORS.low    },
  ].filter(d => d.value > 0)

  if (!data.length) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} detections`, name]}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: '12px', color: '#555' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
