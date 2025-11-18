'use client';

import React from 'react';
import Image from 'next/image';
import { useSlider } from './how-we-work/hooks/use-slider';
import { SliderDots } from './how-we-work/components';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';

/** Small, reusable bits */
const Dot = ({
  n,
  active,
  onClick,
  activeColor,
  isThirdSlide,
}: {
  n: number;
  active: boolean;
  onClick: () => void;
  activeColor: string;
  isThirdSlide: boolean;
}) => {
  const isThirdSlideStyle = isThirdSlide;
  
  return (
    <button
      aria-label={`Go to slide ${n}`}
      onClick={onClick}
      className={[
        'h-8 w-8 rounded-full font-[650]',
        'flex items-center justify-center',
        isThirdSlideStyle 
          ? (active ? 'bg-white' : 'bg-white opacity-55')
          : 'text-white',
        active && !isThirdSlideStyle ? '' : !isThirdSlideStyle ? 'opacity-55' : '',
      ].join(' ')}
      style={
        isThirdSlideStyle 
          ? { color: THEME.colors.primary }
          : { backgroundColor: active ? activeColor : 'rgba(8,13,38,0.55)' }
      }
    >
      {n}
    </button>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute -bottom-2 -right-0 z-20 flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 shadow">
    <Image 
      src={MEDIA.landing.section5.img5} 
      alt="Verified" 
      width={16}
      height={16}
      className="h-4 w-4 object-contain"
    />
    <span className="text-[12px] font-semibold" style={{ color: THEME.colors.text.darkBlue }}>{children}</span>
  </div>
);

/** Slider data (single source of truth) */
type Slide = {
  title: string;
  subtitle?: string;
  description: string;
  bg: string;                 // container background
  roadTint?: string;          // decorative line tint (optional)
  textColor: string;          // heading color
  buttonVariant: 'dark' | 'light';
  accentColor: string;        // dot active color
};

const SLIDES: Slide[] = [
  {
    title: 'Ready to hit the road and earn?',
    subtitle: 'Join us as a Tasker today!',
    description:
      'Begin your journey to financial independence while experiencing the exhilarating freedom of the open road, and become part of a vibrant community of like-minded drivers.',
    bg: THEME.colors.secondary,
    roadTint: '#c8dcff',
    textColor: THEME.colors.text.darkBlue,
    buttonVariant: 'dark',
    accentColor: THEME.colors.primary,
  },
  {
    title: 'Start your journey, earn on your terms',
    subtitle: '— become a Tasker today!',
    description:
      'Join a growing community of skilled pros, take control of your schedule, and enjoy the freedom of earning through flexible, hands-on work that fits your lifestyle.',
    bg: '#AFC6FF',
    roadTint: '#96b6ff',
    textColor: THEME.colors.text.darkBlue,
    buttonVariant: 'dark',
    accentColor: THEME.colors.primary,
  },
  {
    title: 'Turn your skills into income —',
    subtitle: 'join our team of Taskers!',
    description:
      'Build your future with flexible work, steady opportunities, and the support of a trusted platform that connects you with customers who need your expertise.',
    bg: '#6677C5',
    roadTint: '#7d8bce',
    textColor: '#FFFFFF',
    buttonVariant: 'light',
    accentColor: '#3E51E5',
  },
];

/** Main component */
export default function JoinAsTaskerSection() {
  const { currentIndex, goToSlide } = useSlider({ 
    totalSlides: SLIDES.length,
    enableKeyboard: true 
  });
  
  const slide = SLIDES[currentIndex];
  const isDark = slide.buttonVariant === 'light';

  return (
    <section className="w-full overflow-hidden bg-white pb-8 sm:pb-12 lg:pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[76px] xl:px-[95px]">
        <div
          className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 rounded-[20px] p-6 sm:p-8 lg:grid-cols-2"
          style={{ backgroundColor: slide.bg }}
        >
          {/* LEFT: copy + actions */}
          <div className="relative z-10">
            <h2
              className="mb-3 text-[28px] leading-snug font-semibold sm:text-[32px] lg:text-[34px]"
              style={{ color: slide.textColor }}
            >
              {slide.title}
              {slide.subtitle ? <><br />{slide.subtitle}</> : null}
            </h2>

            <p
              className="mb-6 max-w-[590px] text-[15px] leading-[1.5]"
              style={{ color: isDark ? 'rgba(255,255,255,0.9)' : THEME.colors.text.darkBlue }}
            >
              {slide.description}
            </p>

            <div className="flex items-center gap-4 sm:gap-6">
              <button
                className={[
                  'rounded-[999px] px-6 py-3 text-[16px] font-medium shadow-sm',
                  isDark ? 'bg-white text-white' : 'text-white',
                ].join(' ')}
                style={
                  isDark 
                    ? { color: THEME.colors.primary }
                    : { backgroundColor: THEME.colors.text.darkBlue }
                }
              >
                Become our Pro
              </button>

              <div className="flex items-center gap-3">
                {SLIDES.map((_, i) => (
                  <Dot
                    key={i}
                    n={i + 1}
                    active={i === currentIndex}
                    onClick={() => goToSlide(i)}
                    activeColor={slide.accentColor}
                    isThirdSlide={currentIndex === 2}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: media cluster */}
          <div className="relative mx-auto h-[300px] w-full max-w-[520px] flex items-center justify-center gap-4">
            {/* main image left - group of taskers */}
            <div className="relative z-10">
              <Image
                src={MEDIA.landing.section6.img1}
                alt="Taskers team"
                width={232}
                height={180}
                className="h-[180px] w-[232px] rounded-[20px] object-cover"
              />
              {/* verified badge on left image */}
              <Badge>Verified Taskers.</Badge>
            </div>
            
            {/* second image right - single tasker */}
            <div className="relative z-10">
              <Image
                src={MEDIA.landing.section6.img2}
                alt="Tasker on job"
                width={175}
                height={175}
                className="h-[175px] w-[175px] rounded-[20px] object-cover"
              />
              {/* small logo tile on right image */}
              <div className="absolute -right-2 -top-2 z-20 h-[32px] w-[32px] rounded-[10px] bg-white shadow-sm flex items-center justify-center">
                <Image src={MEDIA.icons.mini_logo} alt="Logo" width={32} height={32} className="h-15 w-15 object-contain" />
              </div>
            </div>
          </div>

          {/* Decorative road overlay (bottom, full width) */}
          <div className="absolute bottom-0 left-0 right-0 z-0 hidden sm:block overflow-hidden rounded-b-[20px]">
            <Image 
              src={MEDIA.landing.section6.img3} 
              alt="Decorative road" 
              width={800}
              height={200}
              className="w-100 h-auto object-cover"
            />
          </div>
        </div>

        {/* Dots / secondary nav */}
        <SliderDots 
          totalSlides={SLIDES.length}
          currentIndex={currentIndex}
          onDotClick={goToSlide}
        />
      </div>
    </section>
  );
}

