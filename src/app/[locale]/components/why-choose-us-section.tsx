'use client';

import React from 'react';
import Image from 'next/image';
import { SectionContainer } from './section-container';
import { SectionHeading } from './section-heading';
import { SectionDescription } from './section-description';
import { MEDIA } from '@/shared/constants/media';

type Feature = {
  title: string;
  copy: string;
  iconAlt: string;
  iconSrc?: string; // left empty on purpose
};

const FEATURES: Feature[] = [
  {
    title: 'Professional staff',
    copy:
      'Our team of skilled professionals is committed to deliver the highest quality house maintenance services.',
    iconAlt: 'Professional staff icon',
    iconSrc: MEDIA.landing.section4.img1,
  },
  {
    title: 'Flexible solutions',
    copy:
      "We want to help you live right where you're most comfortable and can modify your home.",
    iconAlt: 'Flexible solutions icon',
    iconSrc: MEDIA.landing.section4.img2,
  },
  {
    title: 'Insured work',
    copy:
      'We believe in honest, transparent pricing, so you know exactly what to expect before any work begins.',
    iconAlt: 'Insured work icon',
    iconSrc: MEDIA.landing.section4.img3,
  },
  {
    title: 'Satisfaction',
    copy:
      'We hire only the most qualified professionals, such that your satisfaction levels are always at a 100%.',
    iconAlt: 'Satisfaction guaranteed icon',
    iconSrc: MEDIA.landing.section4.img4,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article
      className="rounded-[10px] p-7 md:p-8 text-left overflow-hidden bg-[var(--color-secondary)]"
    >
      <div className="mb-7 h-12 w-12 overflow-hidden">
        {feature.iconSrc && (
          <Image src={feature.iconSrc} alt={feature.iconAlt} width={48} height={48} className="h-12 w-12 object-contain" />
        )}
      </div>

      {/* Title: 24px / 30px / 600 */}
      <h3 className="mb-7 text-[24px] leading-[30px] font-semibold text-[var(--color-text-dark-blue)] tracking-[-0.72px]">
        {feature.title}
      </h3>

      {/* Copy: 16px / 26px */}
      <p className="text-[16px] leading-[26px] text-[var(--color-text-dark-blue)]/80 tracking-[-0.48px] m-0">
        {feature.copy}
      </p>
    </article>
  );
}

export default function WhyChooseUsSection() {
  return (
    <SectionContainer>
      {/* Heading */}
      <SectionHeading
        firstLine="WHY CHOOSE"
        secondLine="US?"
        firstLineColor="text-[var(--color-text-grey)]"
        secondLineColor=""
      />

      {/* Description */}
      <SectionDescription>
        Trusted professionals, transparent pricing, and top-rated service. We make home repairs
        simple, fast, and stress free with quality you can count on and support you can trust.
      </SectionDescription>

      {/* Features grid */}
      <div className="mt-14 grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 overflow-hidden">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </SectionContainer>
  );
}

