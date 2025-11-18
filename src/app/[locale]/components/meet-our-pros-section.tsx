'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { SectionContainer } from './section-container';
import { SectionHeading } from './section-heading';
import { SectionDescription } from './section-description';
import { MEDIA } from '@/shared/constants/media';
import { useProviders } from '@/features/taskers/hooks/use-providers';

type Pro = {
  id: number;
  name: string;
  role: string;
  years: string;
  price: string;
  rating: number;       // 0–5
  imageAlt: string;
  imageSrc?: string;    // keep empty if you prefer
};


// tiny star
function Star({ filled }: { filled: boolean }) {
  return (
    <Image 
      src={filled ? MEDIA.landing.section5.img2 : MEDIA.landing.section5.img1} 
      alt={filled ? 'Filled star' : 'Empty star'} 
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
    />
  );
}
const Stars = ({ value }: { value: number }) => <div className="flex gap-1">{[0,1,2,3,4].map(i => <Star key={i} filled={i < value} />)}</div>;

function ProCard({ pro }: { pro: Pro }) {
  const isFeatured = pro.rating === 5; // <-- single source of truth

  if (isFeatured) {
    // Featured card: full image with overlay text
    return (
      <article className="relative overflow-hidden rounded-[20px] shadow-[0_16px_35px_rgba(0,0,0,0.04)] h-[455px]">
        {/* Full image background */}
        <div className="relative h-full">
          <Image src={pro.imageSrc || MEDIA.landing.section5.img3} alt={pro.imageAlt} width={400} height={455} className="h-full w-full object-cover" />
          {/* Years badge */}
          <div className="absolute right-2 top-2 z-[3] rounded-[20px] px-4 py-2 text-[12px] text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            {pro.years}
          </div>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(31,37,39,0.95)] z-[1]" />
          
          {/* Content overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-[2] p-5">
            {/* Name + badge */}
            <div className="mb-1 flex items-center gap-2 text-[22px] text-white">
              <span>{pro.name}</span>
              <Image 
                src={MEDIA.landing.section5.img5} 
                alt="Verified" 
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            </div>

            {/* Role */}
            <div className="mb-3 text-[15px] text-white/90">{pro.role}</div>

            {/* Rating */}
            <div className="mb-4"><Stars value={pro.rating} /></div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[18px] md:text-[20px] font-bold text-white">
                {pro.price}
              </span>
              <button
                type="button"
                className="rounded-[999px] px-7 py-2 text-[15px] bg-white text-[var(--color-primary)]"
              >
                Book Me
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Regular card: image section + body section
  // All cards with rating < 5 must show the same UI
  return (
    <article
      className="relative overflow-hidden rounded-[20px] shadow-[0_16px_35px_rgba(0,0,0,0.04)] h-[450px] flex flex-col w-full"
      style={{ backgroundColor: 'var(--color-secondary)' }}
    >
      {/* Image */}
      <div className="relative h-[280px] flex-shrink-0">
        <Image src={pro.imageSrc || MEDIA.landing.section5.img3} alt={pro.imageAlt} width={400} height={280} className="h-full w-full object-cover" />
        {/* Years badge */}
        <div className="absolute right-2 top-2 z-[2] rounded-[20px] px-4 py-2 text-[12px] text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
          {pro.years}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-[2] flex-1 flex flex-col px-5 pt-5 pb-5 min-h-0">
        {/* Name + badge */}
        <div className="mb-1 flex items-center gap-2 text-[22px] text-[var(--color-text-dark-blue)] min-h-[28px]">
          <span className="truncate">{pro.name}</span>
          <Image 
            src={MEDIA.landing.section5.img5} 
            alt="Verified"  
            width={16}
            height={16}
            className="h-4 w-4 object-contain flex-shrink-0"
          />
        </div>

        {/* Role */}
        <div className="mb-3 text-[15px] text-[var(--color-text-dark-blue)]/80 min-h-[20px] truncate">{pro.role}</div>

        {/* Rating */}
        <div className="mb-4 flex-shrink-0"><Stars value={pro.rating} /></div>

        {/* Footer - always at bottom */}
        <div className="flex items-center justify-between mt-auto gap-2 flex-shrink-0">
          <span className="text-[18px] md:text-[20px] font-bold truncate" style={{ color: 'var(--color-primary)' }}>
            {pro.price}
          </span>
          <button
            type="button"
            className="rounded-[999px] px-7 py-2 text-[15px] bg-[var(--color-text-black)] text-white whitespace-nowrap flex-shrink-0"
          >
            Book Me
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MeetOurPros() {
  const { providers, isLoading, isError, error } = useProviders();

  // Map API data to Pro type with memoization for performance
  // Error-safe: Handles null/undefined and invalid data
  const pros = useMemo<Pro[]>(() => {
    if (!Array.isArray(providers) || providers.length === 0) {
      return [];
    }

    const mappedPros: Pro[] = [];

    for (const provider of providers) {
      if (provider == null) continue; // Skip null/undefined

      try {
        // Clamp rating between 0-5 and round to nearest integer
        const rating = Math.max(
          0,
          Math.min(5, Math.round(Number(provider.avg_rating) || 0))
        );

        // Format price with commas for large numbers
        const priceInDollars = Number(provider.price_hourly) / 100;
        const formattedPrice = isNaN(priceInDollars)
          ? '$0/ hr'
          : `$${priceInDollars.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}/ hr`;

        mappedPros.push({
          id: Number(provider.id) || 0,
          name: String(provider.name || 'Unknown'),
          role: String(provider.category || 'Service Provider'),
          years: `${Number(provider.experience_years) || 0} ${
            Number(provider.experience_years) === 1 ? 'year' : 'years'
          }`,
          price: formattedPrice,
          rating: rating,
          imageAlt: `${provider.name || 'Provider'} portrait`,
          imageSrc:
            provider.image || MEDIA.landing.section5.img3, // Fallback to default image
        });
      } catch (err) {
        // Log error but don't break the entire list
        console.error('Error mapping provider:', err, provider);
        // Continue to next provider
      }
    }

    return mappedPros;
  }, [providers]);

  return (
    <SectionContainer>
      <SectionHeading
        firstLine="MEET OUR"
        secondLine="PROS"
        firstLineColor="text-[var(--color-text-grey)]"
        secondLineColor=""
      />

      <SectionDescription>
        Skilled, vetted, and reliable — our Taskers are experienced professionals ready to handle any job with care and precision. Get to know the experts who bring your projects to life.
      </SectionDescription>

      {/* Cards */}
      {isLoading ? (
        <div className="mt-12 text-center text-[var(--color-text-grey)]">
          Loading providers...
        </div>
      ) : isError ? (
        <div className="mt-12 text-center text-red-500">
          {error?.message || 'Failed to load providers. Please try again later.'}
        </div>
      ) : pros.length === 0 ? (
        <div className="mt-12 text-center text-[var(--color-text-grey)]">
          No providers available at the moment.
        </div>
      ) : (
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-8 items-stretch">
          {pros.map((p) => <ProCard key={p.id} pro={p} />)}
      </div>
      )}

      {/* View All */}
      <div className="mt-6 text-right">
        <a href="#" className="text-[22px] font-semibold" style={{ color: 'var(--color-primary)' }}>
          View All
        </a>
      </div>
    </SectionContainer>
  );
}
