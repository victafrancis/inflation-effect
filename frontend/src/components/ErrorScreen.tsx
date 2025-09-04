import React from "react";
import { RefreshCw } from "lucide-react";

type Props = {
  err?: string | null;
  onRetry: () => void;
};

export function ErrorScreen({ err, onRetry }: Props) {
  return (
    <div className="min-h-screen grid place-items-center bg-black text-gray-200">
      <div className="text-center">
        <p className="mb-3">Failed to load item.</p>
        {err ? <code className="text-xs opacity-70">{err}</code> : null}
        <div className="mt-4">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-semibold hover:opacity-90 transition"
            onClick={onRetry}
          >
            <RefreshCw size={18} />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
