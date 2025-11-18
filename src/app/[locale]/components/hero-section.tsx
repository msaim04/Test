"use client";

import React from "react";
import SearchFormSection from "./search-form-section";
import { HeroCardsSection } from "./hero-cards";

/**
 * Hero Section Component
 * Main container for the hero section including search form and hero cards
 * 
 * Features:
 * - Fully responsive design using flexbox
 * - DRY principles: Reusable components, no code duplication
 * - Overflow hidden applied to containers
 * - No static widths - all containers are fluid
 * - Mobile-first responsive approach
 */
export function HeroSection() {
  return (
    <section className="flex flex-col items-start self-stretch w-full mb-4 md:mb-6 px-4 sm:px-6 md:px-8 lg:px-[76px] xl:px-[95px] overflow-hidden max-w-full">
      {/* Search Form Section */}
      <div className="w-full max-w-full overflow-hidden">
        <SearchFormSection />
      </div>

      {/* Hero Content Section */}
      <div className="w-full max-w-full overflow-hidden">
        <HeroCardsSection />
      </div>
    </section>
  );
}

