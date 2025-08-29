import React, { forwardRef } from "react";

interface FullPageScrollerProps { children: React.ReactNode; }

export const FullPageScroller = forwardRef<HTMLDivElement, FullPageScrollerProps>(
  function FullPageScroller({ children }, ref) {
    return (
      <div
        ref={ref}
        className="h-screen w-full overflow-y-scroll overscroll-none"
      >
        {children}
      </div>
    );
  }
);
