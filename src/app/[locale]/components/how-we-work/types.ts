import React from 'react';

export type SlideKey = 'click' | 'book' | 'done';

export type Slide = {
  key: SlideKey;
  title: string;
  text: React.ReactNode;
  bg: string;               // container background
  textColor?: string;       // text color override
  showMiniCard?: boolean;   // small "Vast range of services" card on big image
  showAvatars?: boolean;    // small avatar pill on tall image
  mainImage: string;        // main image source
  sideImage: string;        // side image source
};

