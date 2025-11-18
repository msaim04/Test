'use client';

import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  bgColor?: string;
  paddingY?: string;
  className?: string;
}

export function SectionContainer({
  children,
  bgColor = 'bg-white',
  paddingY = 'py-10 sm:py-14',
  className = '',
}: SectionContainerProps) {
  return (
    <section className={`w-full overflow-hidden ${bgColor} px-4 sm:px-6 md:px-8 lg:px-[76px] xl:px-[95px] ${paddingY} ${className}`}>
      <div className="w-full max-w-full overflow-hidden">
        {children}
      </div>
    </section>
  );
}

