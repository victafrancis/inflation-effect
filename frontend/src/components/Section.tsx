import React from 'react';
interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}
export function Section({
  id,
  children,
  className = ''
}: SectionProps) {
  return <section id={id} className={`section snap-start h-screen w-full relative ${className}`}>
      {children}
    </section>;
}