import React from "react";

interface NavigationDotsProps {
  totalSections: number;
  activeSection: number;
  onDotClick: (index: number) => void;
  visible: boolean;
}

export function NavigationDots({
  totalSections,
  activeSection,
  onDotClick,
  visible
}: NavigationDotsProps) {
  return (
    <div
      className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <button
          key={index}
          aria-label={`Go to section ${index + 1}`}
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full block mb-3 border ${
            activeSection === index
              ? "bg-[#D4AF37] border-[#D4AF37]"
              : "border-gray-600 hover:border-[#D4AF37]"
          }`}
          onClick={() => onDotClick(index)}
        />
      ))}
    </div>
  );
}
