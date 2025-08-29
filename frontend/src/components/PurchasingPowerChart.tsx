import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const data = [{
  year: '2010',
  bitcoin: 100,
  usd: 100,
  euro: 100
}, {
  year: '2012',
  bitcoin: 580,
  usd: 94,
  euro: 93
}, {
  year: '2014',
  bitcoin: 2200,
  usd: 90,
  euro: 88
}, {
  year: '2016',
  bitcoin: 8500,
  usd: 87,
  euro: 84
}, {
  year: '2018',
  bitcoin: 25000,
  usd: 83,
  euro: 80
}, {
  year: '2020',
  bitcoin: 150000,
  usd: 78,
  euro: 76
}, {
  year: '2022',
  bitcoin: 380000,
  usd: 65,
  euro: 62
}];
export function PurchasingPowerChart() {
  return <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{
      top: 5,
      right: 30,
      left: 20,
      bottom: 5
    }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="year" stroke="#999" tick={{
        fill: '#999'
      }} />
        <YAxis stroke="#999" tick={{
        fill: '#999'
      }} domain={[0, 'dataMax']} scale="log" tickFormatter={value => {
        if (value === 1) return '1';
        if (value === 10) return '10';
        if (value === 100) return '100';
        if (value === 1000) return '1k';
        if (value === 10000) return '10k';
        if (value === 100000) return '100k';
        if (value === 1000000) return '1M';
        return '';
      }} />
        <Tooltip contentStyle={{
        backgroundColor: '#222',
        borderColor: '#444',
        color: '#fff'
      }} formatter={(value: number, name: string) => {
        const formattedValue = name === 'bitcoin' && value > 1000 ? `${(value / 1000).toFixed(1)}k` : value;
        return [formattedValue, name.charAt(0).toUpperCase() + name.slice(1)];
      }} />
        <Legend wrapperStyle={{
        color: '#999'
      }} />
        <Line type="monotone" dataKey="bitcoin" stroke="#D4AF37" strokeWidth={3} dot={{
        r: 4
      }} activeDot={{
        r: 6
      }} name="Bitcoin" />
        <Line type="monotone" dataKey="usd" stroke="#74b9ff" strokeWidth={2} dot={{
        r: 3
      }} name="USD" />
        <Line type="monotone" dataKey="euro" stroke="#55efc4" strokeWidth={2} dot={{
        r: 3
      }} name="Euro" />
      </LineChart>
    </ResponsiveContainer>;
}