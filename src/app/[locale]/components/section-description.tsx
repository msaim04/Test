'use client';

import React from 'react';
import { THEME } from '@/shared/constants/theme';

interface SectionDescriptionProps {
  children: React.ReactNode;
  maxWidth?: string;
  textColor?: string;
  className?: string;
}

export function SectionDescription({
  children,
  maxWidth = 'max-w-4xl',
  textColor,
  className = '',
}: SectionDescriptionProps) {
  return (
    <p 
      className={`mx-auto ${maxWidth} text-center ${textColor || ''} text-[17px] overflow-hidden ${className}`}
      style={!textColor ? { color: `${THEME.colors.text.darkBlue}CC` } : undefined}
    >
      {children}
    </p>
  );
}

