import React from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
}
export function StatCard({ label, value, sub }: Props) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-gray-700 bg-black/30">
      <div className="text-[0.8rem] sm:text-sm opacity-70 mb-1">{label}</div>
      <div className="text-[clamp(1.4rem,6vw,2.2rem)] font-semibold break-words">{value}</div>
      {sub ? <div className="text-[0.7rem] sm:text-xs opacity-60 mt-1">{sub}</div> : null}
    </div>
  );
}
