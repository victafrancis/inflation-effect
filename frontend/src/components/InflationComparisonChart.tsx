import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const data = [{
  name: 'Housing',
  usdInflation: 78,
  btcDeflation: -97
}, {
  name: 'Education',
  usdInflation: 130,
  btcDeflation: -95
}, {
  name: 'Healthcare',
  usdInflation: 105,
  btcDeflation: -96
}, {
  name: 'Food',
  usdInflation: 56,
  btcDeflation: -98
}, {
  name: 'Transportation',
  usdInflation: 68,
  btcDeflation: -97
}];
export function InflationComparisonChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const handleClick = (data: any, index: number) => {
    setActiveIndex(index);
  };
  return <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{
      top: 20,
      right: 30,
      left: 20,
      bottom: 5
    }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#999" tick={{
        fill: '#999'
      }} />
        <YAxis stroke="#999" tick={{
        fill: '#999'
      }} tickFormatter={value => `${value}%`} />
        <Tooltip contentStyle={{
        backgroundColor: '#222',
        borderColor: '#444',
        color: '#fff'
      }} formatter={(value: number) => [`${value}%`, '']} />
        <Legend wrapperStyle={{
        color: '#999'
      }} />
        <Bar dataKey="usdInflation" name="USD Inflation" fill="#ff7675" radius={[4, 4, 0, 0]} onClick={handleClick} />
        <Bar dataKey="btcDeflation" name="BTC Price Change" fill="#D4AF37" radius={[4, 4, 0, 0]} onClick={handleClick} />
      </BarChart>
    </ResponsiveContainer>;
}