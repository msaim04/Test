'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA } from '@/shared/constants/media';
import { THEME } from '@/shared/constants/theme';

/* ---------- Small, reusable bits ---------- */

const AvatarStack = ({  
  size = 40,
  images = [],
  className = '',
}: {
  size?: number;
  images?: string[];
  className?: string;
}) => (
  <span className={`inline-flex gap-1 align-middle ${className}`}>
    {images.map((src, i) => (
      <span
        key={i}
        className="inline-block rounded-full border-2 bg-gray-200 overflow-hidden"
        style={{ 
          width: size, 
          height: size,
          borderColor: THEME.colors.secondary 
        }}
      >
        <Image src={src} alt={`Customer ${i + 1}`} width={size} height={size} className="h-full w-full rounded-full object-cover" />
      </span>
    ))}
  </span>
);

const PledgeItem = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="grid grid-cols-[56px_1fr] gap-4">
    <div 
      className="flex h-14 w-14 items-center justify-center rounded-xl text-white"
      style={{ backgroundColor: THEME.colors.primary }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[20px] font-semibold" style={{ color: THEME.colors.text.darkBlue }}>{title}</p>
      <p className="mt-1 text-sm leading-6" style={{ color: THEME.colors.text.darkBlue }}>
        {subtitle}
      </p>
    </div>
  </div>
);

/* ---------- Data (single source of truth) ---------- */

const PLEDGES = [
  {
    title: 'Happiness Pledge',
    subtitle: "If you're not satisfied, we'll work to make it right.",
    icon: (
      <Image 
        src={MEDIA.landing.section7.icons.img1} 
        alt="Happiness Pledge" 
        width={60}
        height={60}
        className="h-15 w-15 object-contain" 
      />
    ),
  },
  {
    title: 'Vetted Taskers',
    subtitle:
      'Taskers are always background checked before joining the platform.',
    icon: (
      <Image 
        src={MEDIA.landing.section7.icons.img2} 
        alt="Vetted Taskers" 
        width={60}
        height={60}
        className="h-15 w-15 object-contain" 
      />
    ),
  },
  {
    title: 'Dedicated Support',
    subtitle:
      'Friendly service when you need us – every day of the week.',
    icon: (
      <Image 
        src={MEDIA.landing.section7.icons.img3} 
        alt="Dedicated Support" 
        width={60}
        height={60}
        className="h-15 w-15 object-contain" 
      />
    ),
  },
];

/* ---------- Main Section ---------- */

export default function SatisfactionGuaranteedSection() {
  return (
    <section className="w-full overflow-hidden bg-white pb-8 sm:pb-12 lg:pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[76px] xl:px-[95px]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* LEFT CARD — Satisfaction */}
          <div 
            className="relative flex flex-col rounded-[26px] p-8 sm:p-10 lg:p-12"
            style={{ backgroundColor: THEME.colors.secondary }}
          >
            <h2 className="mb-5 text-[32px] leading-tight font-semibold sm:text-[40px]" style={{ color: THEME.colors.text.darkBlue }}>
              Your satisfaction, guaranteed,
              <br />
              as a (
              <AvatarStack 
                size={44} 
                images={[
                  MEDIA.landing.section7.img3,
                  MEDIA.landing.section7.img4,
                  MEDIA.landing.section7.img5,
                ]} 
                className="mx-2" 
              />
              ) customer!
            </h2>

            <p className="max-w-[520px] text-[15px] leading-[1.6]" style={{ color: THEME.colors.text.darkBlue }}>
              Discover the thrill of innovation with us.
              <br />
              Unleash your potential today!
            </p>

            <div className="mt-8 grid gap-7">
              {PLEDGES.map((p) => (
                <PledgeItem
                  key={p.title}
                  title={p.title}
                  subtitle={p.subtitle}
                  icon={p.icon}
                />
              ))}
            </div>

            <div className="mt-auto pt-6 flex items-start">
              <button 
                className="min-w-[160px] rounded-[999px] px-6 py-3 text-[16px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: THEME.colors.text.darkBlue }}
              >
                View Services
              </button>
            </div>

            {/* decorative image */}
            <Image
              src={MEDIA.landing.section7.img6}
              alt="Decorative road line"
              width={500}
              height={200}
              className="pointer-events-none absolute bottom-0 right-0 w-[60%] sm:w-[50%]"
            />
          </div>

          {/* RIGHT CARD — Superheroes */}
          <div 
            className="relative flex flex-col rounded-[26px] p-8 sm:p-10 lg:p-12"
            style={{ backgroundColor: THEME.colors.secondary }}
          >
            <h2 className="mb-4 text-[32px] leading-tight font-semibold sm:text-[40px]" style={{ color: THEME.colors.text.darkBlue }}>
              Even superheroes need help!
            </h2>
            <p className="mb-6 max-w-[520px] text-[15px] leading-[1.6]" style={{ color: THEME.colors.text.darkBlue }}>
              You focus on the project goals when we
              <br />
              find you proper taskers.
            </p>

            {/* media grid */}
            <div className="grid grid-cols-[35%_65%] items-stretch gap-6">
              {/* Left column - images */}
              <div className="flex flex-col gap-6">
                {/* portrait image */}
                <div className="relative mt-6">
                  <Image
                    src={MEDIA.landing.section7.img1}
                    alt="Tasker and customer"
                    width={300}
                    height={190}
                    className="h-[190px] w-full rounded-[20px] object-cover object-right md:object-center"
                  />
                </div>
              </div>

              {/* Right column - cards */}
              <div className="flex flex-col gap-6">
                {/* metric card */}
                <div className="flex flex-col rounded-[22px] bg-white p-5 shadow-sm">
                  <p className="text-[18px] leading-7" style={{ color: THEME.colors.text.darkBlue }}>
                    Around <span className="font-bold">/ 100,000 /</span> people
                    <br />
                    get <AvatarStack 
                      size={26} 
                      images={[
                        MEDIA.landing.section7.img3,
                        MEDIA.landing.section7.img4,
                        MEDIA.landing.section7.img5,
                      ]} 
                      className="mx-2 -translate-y-[2px]" 
                    />
                    help in
                    <br />
                    platform.
                  </p>
                  <div className="mt-auto flex justify-end pt-4">
                    <button 
                      className="rounded-[999px] px-4 py-2 text-[14px] font-medium text-white"
                      style={{ backgroundColor: THEME.colors.text.black }}
                    >
                      Quick Find
                    </button>
                  </div>
                </div>

                {/* happy people image and stat side by side */}
                <div className="flex items-center gap-4">
                  {/* happy people image */}
                  <div className="relative">
                    <Image
                      src={MEDIA.landing.section7.img2}
                      alt="Happy customers"
                      width={120}
                      height={120}
                      className="h-[120px] w-[120px] rounded-[18px] object-cover"
                    />
                  </div>

                  {/* happy customers stat */}
                  <div 
                    className="flex w-fit items-center justify-between gap-3 rounded-[22px] px-5 py-4 text-white"
                    style={{ backgroundColor: THEME.colors.primary }}
                  >
                    <div>
                      <p className="text-[12px] font-medium opacity-95">
                        Happy customers
                      </p>
                      <p className="text-[32px] font-semibold leading-none">99%</p>
                    </div>
                    <Image src={MEDIA.icons.mini_logo} alt="Logo" width={40} height={40} className="h-10 w-10 object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex items-start">
              <button 
                className="min-w-[160px] rounded-[999px] px-6 py-3 text-[16px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: THEME.colors.text.darkBlue }}
              >
                Be a Pro
              </button>
            </div>

            {/* decorative image */}
            <Image
              src={MEDIA.landing.section7.img6}
              alt="Decorative road line"
              width={500}
              height={200}
              className="pointer-events-none absolute bottom-0 right-0 w-[60%] sm:w-[50%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

