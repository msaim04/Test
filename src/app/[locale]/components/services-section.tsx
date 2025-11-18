'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { THEME } from '@/shared/constants/theme';
import { SectionContainer } from './section-container';
import { SectionHeading } from './section-heading';
import { SectionDescription } from './section-description';
import { useCategories } from '@/features/services/hooks/use-categories';


function ServiceRow({
  id,
  label,
  active,
  onClick,
}: {
  id: number;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <li
      className="group flex items-center gap-5 py-4 sm:py-5 border-b last:border-b-0 border-[#DCE5F5] cursor-pointer"
      onClick={onClick}
    >
      <span
        className={`w-8 sm:w-10 text-sm tabular-nums ${
          active ? 'font-semibold' : ''
        }`}
        style={{ 
          color: active ? THEME.colors.primary : THEME.colors.text.grey 
        }}
      >
        {String(id).padStart(2, '0')}
      </span>
      <span
        className="text-2xl font-semibold"
        style={{ 
          color: active 
            ? THEME.colors.primary 
            : THEME.colors.text.grey 
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = THEME.colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = THEME.colors.text.grey;
          }
        }}
      >
        {label}
      </span>
    </li>
  );
}

export default function ServicesSection() {
  const { categories, isLoading, isError, error } = useCategories();
  const [activeServiceId, setActiveServiceId] = useState<number>(1); // Default to category id 1

  // Set default active service when categories are loaded
  // Error-safe: Handles empty arrays and invalid IDs
  React.useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0 && activeServiceId === 1) {
      const firstCategory = categories.find((cat) => cat?.id === 1);
      if (firstCategory) {
        setActiveServiceId(1);
      } else if (categories[0]?.id) {
        setActiveServiceId(categories[0].id);
      }
    }
  }, [categories, activeServiceId]);

  // Get active category data
  // Error-safe: Returns undefined if no category found
  const activeCategory = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return undefined;
    }
    return (
      categories.find((cat) => cat?.id === activeServiceId) || categories[0]
    );
  }, [categories, activeServiceId]);

  return (
    <SectionContainer>
      <SectionHeading
        firstLine="OUR"
        secondLine="SERVICES"
        firstLineColor="text-[var(--color-text-grey)]"
        secondLineColor=""
      />

      <SectionDescription>
        We provide you with a variety of at-home services that simplify your everyday living. From
        heating, plumbing, to electrical, appliance repair and many more all at your time &
        convenience.
      </SectionDescription>

      {isLoading && (
        <div className="mt-10 text-center py-20">
          <p className="text-lg text-gray-600">Loading services...</p>
        </div>
      )}

      {isError && (
        <div className="mt-10 text-center py-20">
          <p className="text-lg text-red-600">{error?.message || 'Failed to load services. Please try again later.'}</p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        Array.isArray(categories) &&
        categories.length > 0 &&
        activeCategory && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
          {/* Left image */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start overflow-hidden">
            <div className="rounded-[20px] bg-[#EAF3FF] overflow-hidden">
              <Image
                src={activeCategory.image}
                alt={activeCategory.name}
                width={330}
                height={450}
                className="w-[330px] h-[450px] object-cover"
              />
            </div>
          </div>

          {/* Middle list */}
          <div className="lg:col-span-6 overflow-hidden">
            <ul className="rounded-[18px] overflow-hidden">
              {categories.map((category) => (
                <ServiceRow
                  key={category.id}
                  id={category.id}
                  label={category.name}
                  active={category.id === activeServiceId}
                  onClick={() => setActiveServiceId(category.id)}
                />
              ))}
            </ul>

            <div className="mt-4 flex justify-end overflow-hidden">
              <button
                className="text-[#12467F] text-xl font-bold hover:underline"
                onClick={() => alert('View all')}
              >
                View all
              </button>
            </div>
          </div>

          {/* Right icon + CTA */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center lg:justify-end gap-8 overflow-hidden lg:h-full">
            <div className="w-[100px] h-[100px] flex items-center justify-center overflow-hidden">
              <Image
                src={activeCategory.icon}
                alt={`${activeCategory.name} icon`}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>

            <button
              className="inline-flex items-center justify-center gap-3 rounded-[10px] bg-[#12467F] px-6 py-4 text-white font-bold hover:opacity-90"
              onClick={() => alert('View details')}
            >
              VIEW DETAILS
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}

