"use client";

import React from "react";
import { HeroSection } from "./components/hero-section";
import ServicesSection from "./components/services-section";
import HowWeWorkSlider from "./components/how-we-work-section";
import WhyChooseUsSection from "./components/why-choose-us-section";
import MeetOurPros from "./components/meet-our-pros-section";
import JoinAsTaskerSection from "./components/join-as-tasker-section";
import SatisfactionGuaranteedSection from "./components/satisfaction-guaranteed-section";

/**
 * Homepage Component
 * 
 * Features:
 * - Fully responsive design using flexbox
 * - DRY principles: Reusable components, no code duplication
 * - Overflow hidden applied to containers
 * - No static widths - all containers are fluid
 * - Mobile-first responsive approach
 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center bg-white w-full overflow-hidden">
      {/* Main Container - Max width constraint for large screens */}
      <div className="flex flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Our Services Section */}
        <ServicesSection />
        
        {/* How Do We Work Section */}
        <HowWeWorkSlider />
        
        {/* Why Choose Us Section */}
        <WhyChooseUsSection />
        
        {/* Meet Our Pros Section */}
        <MeetOurPros />
        
        {/* Join as a Tasker Section */}
        <JoinAsTaskerSection />
        
        {/* Satisfaction Guaranteed Section */}
        <SatisfactionGuaranteedSection />
      </div>
    </div>
  );
}
