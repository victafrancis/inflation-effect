import React from "react";

interface Props {
  left: string;
  middle?: string;
  right: string;
}

export function ValueRow({ left, middle, right }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-700 bg-black/30">
      <div className="text-[clamp(1rem,4vw,1.25rem)]">{left}</div>
      {middle && (
        <div className="text-[clamp(1rem,4vw,1.25rem)] opacity-80">{middle}</div>
      )}
      <div className="text-[clamp(1rem,4.8vw,1.4rem)] font-semibold">{right}</div>
    </div>
  );
}
