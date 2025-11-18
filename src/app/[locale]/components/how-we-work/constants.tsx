import React from 'react';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';
import { Slide } from './types';

/* --------------------- Shared classes (one source of truth) --------------------- */

export const TITLE_CLS =
  'font-semibold text-[40px] leading-[30px]'; // semibold, 40/30

export const BODY_CLS =
  'font-normal text-[16px] leading-[26px]';   // regular, 16/26

/* ----------------------------- Slide data (DRY) -------------------------------- */

export const SLIDES: Slide[] = [
  {
    key: 'click',
    title: 'Click',
    bg: THEME.colors.secondary,
    showMiniCard: true,
    showAvatars: true,
    mainImage: MEDIA.landing.section3.img1,
    sideImage: MEDIA.landing.section3.img2,
    text: (
      <>
        Select a skilled handyman near you for fast, reliable, and{' '}
        <span 
          className="inline-block rounded-full text-white px-2 py-[0px] text-[13px]"
          style={{ backgroundColor: THEME.colors.primary }}
        >
          Professional
        </span>{' '}
        home repairs. Whether you need minor fixes or major improvements, our trusted experts are
        ready to get the job done right. Every Tasker is vetted for{' '}
        <span 
          className="inline-block rounded-full text-white px-2 py-[0px] text-[13px]"
          style={{ backgroundColor: THEME.colors.primary }}
        >
          Quality
        </span>
        , punctuality, and experience—book with confidence and enjoy hassle-free service, transparent
        pricing, and results you can count on.
      </>
    ),
  },
  {
    key: 'book',
    title: 'Book',
    bg: '#BFD8FF',
    showMiniCard: true,
    showAvatars: true,
    mainImage: MEDIA.landing.section3.img1,
    sideImage: MEDIA.landing.section3.img2,
    text: (
      <>
        Explore a{' '}
        <span 
          className="inline-block rounded-full text-white px-2 py-[0px] text-[13px]"
          style={{ backgroundColor: THEME.colors.primary }}
        >
          wide range
        </span>{' '}
        of services tailored to your needs—from plumbing and electrical to furniture assembly and
        general home repairs. Choose your service and we&apos;ll match you with a qualified professional.
        Our goal is to make home maintenance easy and{' '}
        <span 
          className="inline-block rounded-full text-white px-2 py-[0px] text-[13px]"
          style={{ backgroundColor: THEME.colors.primary }}
        >
          efficient
        </span>
        .
      </>
    ),
  },
  {
    key: 'done',
    title: 'Done',
    bg: '#748DD7',
    textColor: 'white',
    showMiniCard: true,
    showAvatars: true,
    mainImage: MEDIA.landing.section3.img1,
    sideImage: MEDIA.landing.section3.img2,
    text: (
      <>
        Easily manage your service from start to finish: chat, share job details, and confirm before
        work begins. Enjoy a{' '}
        <span 
          className="inline-block rounded-full bg-white px-2 py-[0px] text-[13px]"
          style={{ color: THEME.colors.primary }}
        >
          secure
        </span>{' '}
        and seamless payment experience with{' '}
        <span 
          className="inline-block rounded-full bg-white px-2 py-[0px] text-[13px]"
          style={{ color: THEME.colors.primary }}
        >
          no hidden fees
        </span>
        . If you&apos;re especially pleased, you can tip right in the app—100% goes to your pro.
      </>
    ),
  },
];

