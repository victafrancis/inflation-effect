import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
const data = [{
  subject: '10-Year Return',
  bitcoin: 100,
  gold: 25,
  sp500: 13,
  bonds: 3
}, {
  subject: 'Volatility',
  bitcoin: 85,
  gold: 30,
  sp500: 25,
  bonds: 10
}, {
  subject: 'Inflation Protection',
  bitcoin: 95,
  gold: 80,
  sp500: 50,
  bonds: 15
}, {
  subject: 'Liquidity',
  bitcoin: 90,
  gold: 65,
  sp500: 95,
  bonds: 70
}, {
  subject: 'Censorship Resistance',
  bitcoin: 100,
  gold: 85,
  sp500: 30,
  bonds: 20
}];
export function InvestmentComparisonChart() {
  return <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#444" />
        <PolarAngleAxis dataKey="subject" tick={{
        fill: '#ddd',
        fontSize: 12
      }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{
        fill: '#999'
      }} stroke="#444" />
        <Radar name="Bitcoin" dataKey="bitcoin" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} />
        <Radar name="Gold" dataKey="gold" stroke="#FFD700" fill="#FFD700" fillOpacity={0.3} />
        <Radar name="S&P 500" dataKey="sp500" stroke="#0984e3" fill="#0984e3" fillOpacity={0.3} />
        <Radar name="Bonds" dataKey="bonds" stroke="#00b894" fill="#00b894" fillOpacity={0.3} />
        <Legend wrapperStyle={{
        color: '#999',
        fontSize: 12
      }} />
      </RadarChart>
    </ResponsiveContainer>;
}