import React from "react";

interface Props {
  left: string;
  middle?: string;
  right: string;
}

export function ValueRowBalanced({ left, middle, right }: Props) {
  return (
    <div className="grid grid-cols-3 items-center p-4 rounded-2xl border border-gray-700 bg-black/30">
      <div className="text-[clamp(1rem,4.8vw,1.4rem)] font-semibold text-left">
        {left}
      </div>
      {middle && (
        <div className="text-[clamp(1rem,4vw,1.25rem)] opacity-80 text-center">
          {middle}
        </div>
      )}
      <div className="text-[clamp(1rem,4.8vw,1.4rem)] font-semibold text-right">
        {right}
      </div>
    </div>
  );
}

