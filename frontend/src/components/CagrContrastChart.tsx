// src/components/CagrContrastChart.tsx
import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';

type Props = {
  cagr5: number;   // e.g., 0.087 for 8.7%
  cagr10: number;  // e.g., 0.064 for 6.4%
  target?: number; // default 0.02 for 2%
  label5?: string; // default "5y"
  label10?: string;// default "10y"
};

export default function CagrContrastChart({
  cagr5, cagr10, target = 0.02, label5 = '5y', label10 = '10y'
}: Props) {
  const data = [
    { period: label5, item: cagr5 * 100, target: target * 100 },
    { period: label10, item: cagr10 * 100, target: target * 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="period" stroke="#999" tick={{ fill: '#999' }} />
        <YAxis stroke="#999" tick={{ fill: '#999' }} tickFormatter={(v) => `${v}%`} />
        <Tooltip
        contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }}
        formatter={(v: number, name: string) => [`${v.toFixed(2)}%`, name]}
        />
        <Legend wrapperStyle={{ color: '#999' }} />
        {/* Bar = your item CAGR */}
        <Bar dataKey="item" name="Item actual inflation" fill="#D4AF37" radius={[4,4,0,0]} />
        {/* Line = target (2%) */}
        <Line dataKey="target" name="BoC target inflation (2%)" stroke="#aaa" strokeWidth={2} dot={{ r: 3 }} />
        {/* Optional crisp reference line at 2% across the plot */}
        <ReferenceLine y={target * 100} stroke="#667" strokeDasharray="4 4" ifOverflow="extendDomain" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
