'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';
import { SLIDES, TITLE_CLS, BODY_CLS } from './how-we-work/constants';
import { Bullet, MediaCluster, SliderDots } from './how-we-work/components';
import { useSlider } from './how-we-work/hooks/use-slider';

export default function HowWeWorkSlider() {
  const { currentIndex, goToSlide } = useSlider({ 
    totalSlides: SLIDES.length,
    enableKeyboard: true 
  });
  
  const slide = SLIDES[currentIndex];

  return (
    <section className="w-full overflow-hidden bg-white py-8 sm:py-12 lg:py-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[76px] xl:px-[95px]">
        {/* Top heading */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="font-semibold text-[34px] md:text-[44px] leading-none" style={{ color: THEME.colors.text.grey }}>HOW DO</div>
          <div className="font-semibold text-[34px] md:text-[44px] leading-none" style={{ color: THEME.colors.primary }}>WE WORK?</div>
        </div>

        {/* Sub copy */}
        <p className="mx-auto max-w-3xl text-center text-[#555555] text-base mb-6 lg:mb-10 px-4 sm:px-6 md:px-8">
          Book your service, choose a trusted handyman, chat about the details, and get the job done.
          Pay securely and tip easily — fast, reliable, and hassle-free every time.
        </p>

        {/* Card container */}
        <div
          className="rounded-[20px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12 relative min-h-[400px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex flex-col"
          style={{ backgroundColor: slide.bg }}
        >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center flex-1">
          {/* Left: bullets + text */}
          <div className="md:col-span-5 order-2 md:order-1 flex flex-col items-center justify-center h-full w-full pb-16 sm:pb-20 md:pb-24 lg:pb-24">
            <h3 
              className={`${TITLE_CLS} mb-4 sm:mb-5 md:mb-6 w-full text-center text-[32px] sm:text-[34px] md:text-[36px] lg:text-[40px]`}
              style={{ color: slide.textColor || THEME.colors.text.darkBlue }}
            >
              {slide.title}
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
              <div className="flex flex-row sm:flex-col gap-3 sm:gap-4 pt-1 justify-center sm:justify-start">
                {[1, 2, 3].map((n, i) => (
                  <Bullet 
                    key={n} 
                    n={n} 
                    active={i === currentIndex} 
                    onClick={() => goToSlide(i)}
                    isSlide3={slide.key === 'done'}
                  />
                ))}
              </div>

              <div 
                className={`${BODY_CLS} flex-1 px-2 sm:px-4 md:px-6 text-justify text-sm sm:text-base`}
                style={{ color: slide.textColor || THEME.colors.text.darkBlue }}
              >
                {slide.text}
              </div>
            </div>  
          </div>
          
          {/* Right: media cluster */}
          <div className="md:col-span-7 order-1 md:order-2 px-2 sm:px-4 md:px-6 flex items-center justify-center h-full w-full">
            <MediaCluster 
              showMiniCard={slide.showMiniCard} 
              showAvatars={slide.showAvatars}
              mainImage={slide.mainImage}
              sideImage={slide.sideImage}
            />
          </div>
        </div>

        {/* Decorative wave - positioned at left bottom of container */}
          <div className="absolute bottom-0 left-0 rounded-[20px] overflow-hidden z-0 hidden sm:block">
            <Image 
              src={MEDIA.landing.section3.img11} 
              alt="Decorative wave" 
              width={400}
              height={96}
              className="h-16 sm:h-20 md:h-24 object-cover" 
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
