import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const data = [{
  year: '2013',
  price: 135
}, {
  year: '2014',
  price: 320
}, {
  year: '2015',
  price: 430
}, {
  year: '2016',
  price: 970
}, {
  year: '2017',
  price: 14000
}, {
  year: '2018',
  price: 3800
}, {
  year: '2019',
  price: 7200
}, {
  year: '2020',
  price: 29000
}, {
  year: '2021',
  price: 47000
}, {
  year: '2022',
  price: 16500
}, {
  year: '2023',
  price: 43000
}];
const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000) {
    return `$${tickItem / 1000}k`;
  }
  return `$${tickItem}`;
};
export function BitcoinPriceChart() {
  return <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{
      top: 10,
      right: 30,
      left: 0,
      bottom: 0
    }}>
        <defs>
          <linearGradient id="bitcoinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="year" stroke="#999" tick={{
        fill: '#999'
      }} />
        <YAxis stroke="#999" tick={{
        fill: '#999'
      }} tickFormatter={formatYAxis} />
        <Tooltip contentStyle={{
        backgroundColor: '#222',
        borderColor: '#444',
        color: '#fff'
      }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']} />
        <Area type="monotone" dataKey="price" stroke="#D4AF37" strokeWidth={2} fill="url(#bitcoinGradient)" />
      </AreaChart>
    </ResponsiveContainer>;
}