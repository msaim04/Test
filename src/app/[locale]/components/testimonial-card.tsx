"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/format";
import { MEDIA } from "@/shared/constants/media";

interface NameTagProps {
  name: string;
  profileImage: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * Name Tag Component with pointer and profile image
 * Displays name with profile picture in a rounded tag with gradient background and pointer arrow
 */
const NameTag = React.memo<NameTagProps>(function NameTag({
  name,
  position,
  className,
}) {
  // Pointer triangles pointing towards the circles
  // Based on mockup: pointers point from tag edges toward circle centers
  const pointerClasses: Record<string, string> = {
    "top-left": "after:content-[''] after:absolute after:w-0 after:h-0 after:border-t-[6px] after:border-t-transparent after:border-r-[8px] after:border-r-[#DE75D4] after:border-b-[6px] after:border-b-transparent after:bottom-[-6px] after:right-[4px]",
    "top-right": "after:content-[''] after:absolute after:w-0 after:h-0 after:border-t-[6px] after:border-t-transparent after:border-l-[8px] after:border-l-[#DE75D4] after:border-b-[6px] after:border-b-transparent after:bottom-[-6px] after:left-[4px]",
    "bottom-left": "before:content-[''] before:absolute before:w-0 before:h-0 before:border-b-[6px] before:border-b-transparent before:border-r-[8px] before:border-r-[#DE75D4] before:border-t-[6px] before:border-t-transparent before:top-[-6px] before:right-[4px]",
    "bottom-right": "before:content-[''] before:absolute before:w-0 before:h-0 before:border-b-[6px] before:border-b-transparent before:border-l-[8px] before:border-l-[#DE75D4] before:border-t-[6px] before:border-t-transparent before:top-[-6px] before:left-[4px]",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg text-white font-medium whitespace-nowrap",
        "px-2 py-1 text-[8px] sm:text-[9px] md:text-[10px]",
        pointerClasses[position],
        className
      )}
      style={{
        background: "linear-gradient(316.35deg, #4541F1 13.36%, #DE75D4 84.79%)"
      }}
    >
      {name}
    </div>
  );
});

interface TestimonialCardProps {
  className?: string;
}

/**
 * Testimonial Card Component
 * DRY: Reusable testimonial display component with reusable AvatarBadge
 * Responsive: Adapts layout for different screen sizes
 */
export const TestimonialCard = React.memo<TestimonialCardProps>(function TestimonialCard({
  className,
}) {
  const handleBeAPro = () => {
    alert("Pressed!");
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center xl:items-start self-stretch w-full max-w-full bg-[var(--color-secondary)] rounded-[20px] overflow-hidden",
        "py-4 px-4 sm:py-5 sm:px-5 md:py-5 md:px-5 lg:py-[18px] lg:px-[18px]",
        "min-h-[320px] sm:min-h-[340px] md:min-h-0 lg:min-h-0",
        className
      )}
    >
      {/* Arrow icon in top right */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors z-10">
        <Image
          src={MEDIA.icons.arrow}
          alt="Arrow"
          width={100}
          height={100}
        />
      </div>
      {/* Avatars Section - Single line stack with name tags positioned clearly */}
      <div className="relative flex items-center justify-center w-full mb-4 sm:mb-5 md:mb-6 lg:mb-[49px] gap-0 flex-shrink-0 min-h-[100px] sm:min-h-[110px] md:min-h-[120px] lg:min-h-[140px]">
        {/* Circles row - single line, centered */}
        <div className="flex items-center justify-center gap-0 relative z-10 mx-auto">
          {/* Mubashar circle (leftmost) - First profile */}
          <div id="profile-1" className="relative z-[4]">
            <div 
              className="w-[35px] md:w-[43px] aspect-square rounded-full p-[2px]"
              style={{
                background: "linear-gradient(316.35deg, #4541F1 13.36%, #DE75D4 84.79%)"
              }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src={MEDIA.landing.section7.img3}
                  alt="Mubashar"
                  width={43}
                  height={43}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Muabashar tag - below, pointing up to first circle */}
            <div className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 z-20">
              <NameTag name="Muabashar" profileImage={MEDIA.landing.section7.img3} position="bottom-left" />
            </div>
          </div>
          
          {/* Maria circle (middle) - Second profile */}
          <div id="profile-2" className="relative z-[3] -ml-2 md:-ml-3">
            <div 
              className="w-[30px] md:w-[37px] aspect-square rounded-full p-[2px]"
              style={{
                background: "linear-gradient(316.35deg, #4541F1 13.36%, #DE75D4 84.79%)"
              }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src={MEDIA.landing.section7.img4}
                  alt="Maria"
                  width={37}
                  height={37}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Maria tag - top-center, pointing down to second circle */}
            <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 z-20">
              <NameTag name="Maria" profileImage={MEDIA.landing.section7.img4} position="top-right" />
            </div>
          </div>
          
          {/* Sara circle (rightmost) - Third profile */}
          <div id="profile-3" className="relative z-[2] -ml-2 md:-ml-3">
            <div 
              className="w-[28px] md:w-[35px] aspect-square rounded-full p-[2px]"
              style={{
                background: "linear-gradient(316.35deg, #4541F1 13.36%, #DE75D4 84.79%)"
              }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src={MEDIA.landing.section7.img5}
                  alt="Sara"
                  width={35}
                  height={35}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Sara tag - bottom-right, pointing up-left to third circle */}
            <div className="absolute -bottom-8 md:-bottom-10 -right-4 md:-right-6 z-20">
              <NameTag name="Sara" profileImage={MEDIA.landing.section7.img5} position="bottom-right" />
            </div>
          </div>
          
          {/* Additional indicator circle with gradient border - shows three dots */}
          <div className="relative z-[1] -ml-2 md:-ml-3">
            <div 
              className="w-[28px] md:w-[35px] h-[28px] md:h-[35px] rounded-full p-[2px]"
              style={{
                background: "linear-gradient(316.35deg, #4541F1 13.36%, #DE75D4 84.79%)"
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <div className="flex gap-[2px] md:gap-[3px]">
                  <div className="w-[2px] h-[2px] md:w-[3px] md:h-[3px] rounded-full bg-gray-400"></div>
                  <div className="w-[2px] h-[2px] md:w-[3px] md:h-[3px] rounded-full bg-gray-400"></div>
                  <div className="w-[2px] h-[2px] md:w-[3px] md:h-[3px] rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Flex layout for title, description and CTA */}
      <div className="flex flex-col items-center xl:items-start ml-0 md:ml-0 xl:ml-[19px] w-full flex-1 justify-between gap-3 sm:gap-4 md:gap-4">
        <div className="flex flex-col items-center xl:items-start gap-2 w-full flex-shrink-0">
          <h3 className="text-black text-lg sm:text-xl md:text-[25px] font-semibold text-center xl:text-left">
            Hiring top taskers
          </h3>
          <p className="text-[var(--color-text-dark-blue)] text-xs sm:text-xs md:text-[13px] whitespace-pre-line text-center xl:text-left">
            {"Hire the Best Taskers\nfor Your Needs."}
          </p>
        </div>
        <div className="flex items-center xl:items-start w-full justify-center xl:justify-start flex-shrink-0">
          <Button
            onClick={handleBeAPro}
            variant="primary"
            size="md"
            className="bg-black hover:bg-black/90 ml-0 md:ml-0 xl:ml-[-4px]"
          >
            Be a pro
          </Button>
        </div>
      </div>
    </div>
  );
});
