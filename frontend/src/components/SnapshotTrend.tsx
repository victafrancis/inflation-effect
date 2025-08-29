import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

type Point = { label: string; value: number };

export default function SnapshotTrend({
  points, currency = 'CAD'
}: { points: Point[]; currency?: string }) {
  const formatY = (n: number) => {
    if (n >= 1000) return `${currency === 'USD' ? '$' : ''}${(n/1000).toFixed(1)}k`;
    return `${currency === 'USD' ? '$' : ''}${n}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="snapGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="label" stroke="#999" tick={{ fill: '#999' }} />
        <YAxis tickFormatter={formatY} stroke="#999" tick={{ fill: '#999' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }}
          formatter={(v: number) => [`${currency === 'USD' ? '$' : ''}${v.toLocaleString()}`, 'CAD']}
          labelFormatter={(lab) => `Year: ${lab}`}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#D4AF37"
          strokeWidth={2}
          fill="url(#snapGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
