'use client';

import React from 'react';
import { THEME } from '@/shared/constants/theme';

interface SectionHeadingProps {
  firstLine: string;
  secondLine: string;
  firstLineColor?: string;
  secondLineColor?: string;
  firstLineWeight?: string;
  secondLineWeight?: string;
  className?: string;
}

export function SectionHeading({
  firstLine,
  secondLine,
  firstLineColor,
  secondLineColor,
  firstLineWeight = 'font-semibold',
  secondLineWeight = 'font-semibold',
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`text-center mb-5 sm:mb-12 overflow-hidden flex flex-col gap-1 ${className}`}>
      <h2 
        className={`${firstLineColor || ''} text-[44px] ${firstLineWeight} leading-none`}
        style={!firstLineColor ? { color: THEME.colors.text.grey } : undefined}
      >
        {firstLine}
      </h2>
      <h2 
        className={`${secondLineColor || ''} text-[44px] ${secondLineWeight} leading-none`}
        style={!secondLineColor ? { color: THEME.colors.primary } : undefined}
      >
        {secondLine}
      </h2>
    </div>
  );
}

