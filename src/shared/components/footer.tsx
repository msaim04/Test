"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MEDIA } from "@/shared/constants/media";
import { useCategories } from "@/features/services/hooks/use-categories";
const quickLinks = ["Home", "Contact Us", "For Pro's", "Login", "Signup"] as const;
const socials = [
  { label: "facebook", variant: "primary" as const },
  { label: "Linkdin", variant: "outline" as const },
  { label: "instagam", variant: "outline" as const },
  { label: "youtube", variant: "outline" as const },
];

function FooterComponent() {
  const { categories, isLoading } = useCategories();
  
  // Get up to 10 services
  const displayedServices = categories.slice(0, 10);
  const hasMoreThan10 = categories.length > 10;
  
  // Split services: fill first column first, then second column
  // First column gets items first, second column gets remaining items
  const itemsPerColumn = 5; // Fill first column with 5 items, then second column
  const servicesColumnA = displayedServices.slice(0, itemsPerColumn);
  const servicesColumnB = displayedServices.slice(itemsPerColumn);

  return (
    <footer className="bg-[var(--color-secondary)] text-[var(--color-text-dark-blue)] lg:px-8 xl:px-12 2xl:px-16">
      {/* Logo - At top for mobile only */}
      <div className="w-full max-w-[1440px] mx-auto px-4 pt-6 pb-4 md:hidden">
        <Image
          src={MEDIA.logos.servisca.src}
          alt="Servisca logo"
          width={137}
          height={25}
          className="w-auto h-5 sm:h-6"
        />
      </div>

      {/* Top Contact Row */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col items-start md:flex-row md:justify-between md:items-center gap-6 sm:gap-8 px-4 py-6 sm:py-8 md:py-16">
        {/* Location */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-initial">
          <Image
            src={MEDIA.icons.location}
            alt="Location icon"
            width={54}
            height={54}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-[54px] md:h-[54px]"
          />
          <div className="text-[var(--color-text-dark-blue)] text-sm sm:text-base">
            <div className="font-semibold text-[var(--color-text-black)]">UK</div>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-initial">
          <Image
            src={MEDIA.icons.clock}
            alt="Clock icon"
            width={54}
            height={54}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-[54px] md:h-[54px]"
          />
          <div className="text-[var(--color-text-dark-blue)] text-sm sm:text-base">
            <div className="font-semibold text-[var(--color-text-black)]">Mon To Sun:</div>
            <div>7:00 AM To 2:00 PM</div>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-initial">
          <Image
            src={MEDIA.icons.email}
            alt="Email icon"
            width={54}
            height={54}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-[54px] md:h-[54px]"
          />
          <div className="text-[var(--color-text-dark-blue)] text-sm sm:text-base">
            <div className="font-semibold text-[var(--color-text-dark-blue)]">Email Us:</div>
            <div className="break-all">support@servisca.com</div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-4 pb-8 sm:pb-10 lg:pb-10">
        {/* Logo - Desktop only */}
        <div className="mb-6 sm:mb-8 hidden md:block">
          <Image
            src={MEDIA.logos.servisca.src}
            alt="Servisca logo"
            width={137}
            height={25}
            className="w-auto h-[25px]"
          />
        </div>

        {/* Columns wrapper - headings aligned above their content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-6">
          {/* Services column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-[var(--color-primary)] text-base sm:text-lg font-semibold">Our Services</div>
              {hasMoreThan10 && (
                <Link 
                  href="/services" 
                  className="text-xs sm:text-sm text-[var(--color-primary)] hover:underline ml-auto"
                >
                  View All
                </Link>
              )}
            </div>
            {isLoading ? (
              <div className="text-xs sm:text-sm text-[var(--color-text-dark-blue)]">Loading services...</div>
            ) : displayedServices.length > 0 ? (
            <div className="flex flex-row gap-8 sm:gap-12 md:gap-16 flex-wrap">
            {/* Col 1 */}
            <ul className="text-xs sm:text-sm text-[var(--color-text-dark-blue)] space-y-1.5 sm:space-y-2 flex-shrink-0">
                  {servicesColumnA.map((category) => (
                    <li key={category.id}>{category.name}</li>
              ))}
            </ul>
            {/* Col 2 */}
                {servicesColumnB.length > 0 && (
            <ul className="text-xs sm:text-sm text-[var(--color-text-dark-blue)] space-y-1.5 sm:space-y-2 flex-shrink-0">
                    {servicesColumnB.map((category) => (
                      <li key={category.id}>{category.name}</li>
              ))}
            </ul>
                )}
            </div>
            ) : (
              <div className="text-xs sm:text-sm text-[var(--color-text-dark-blue)]">No services available</div>
            )}
          </div>

          {/* Quick links column */}
          <div className="flex flex-col pl-0 sm:pl-4 lg:pl-20">
            <div className="text-[var(--color-primary)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</div>
            <ul className="text-xs sm:text-sm text-[var(--color-text-dark-blue)] space-y-1.5 sm:space-y-2">
              {quickLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* App badges + Social column */}
          <div className="flex flex-col gap-6 sm:gap-8 overflow-hidden min-w-0">
            <div className="text-[10px] sm:text-xs font-bold text-[var(--color-text-grey)]">DOWNLOAD OUR APP</div>
            {/* store badges */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-2 xl:gap-4 md:flex-nowrap flex-wrap overflow-hidden min-w-0">
              <Image
                src={MEDIA.badges.googlePlay}
                alt="Get it on Google Play"
                width={178}
                height={58}
                className="h-[48px] sm:h-[52px] md:h-[42px] lg:h-[50px] xl:h-[58px] w-auto object-contain flex-shrink min-w-0 max-w-full"
              />
              <Image
                src={MEDIA.badges.appStore}
                alt="Download on the App Store"
                width={184}
                height={58}
                className="h-[48px] sm:h-[52px] md:h-[42px] lg:h-[50px] xl:h-[58px] w-auto object-contain flex-shrink min-w-0 max-w-full"
              />
            </div>

            {/* social buttons */}
            <div className="flex flex-wrap md:flex-wrap gap-2 sm:gap-3 md:gap-2 lg:gap-3 overflow-hidden min-w-0">
              {socials.map(({ label, variant }) => (
                <button
                  key={label}
                  className={
                    variant === "primary"
                      ? "bg-[var(--color-social-facebook)] text-[var(--color-text-white)] text-xs sm:text-sm rounded-[5px] py-2 px-3 sm:py-1 sm:px-3 md:px-2.5 lg:px-3 border border-[var(--color-social-facebook)] flex-shrink min-w-0"
                      : "bg-transparent text-[var(--color-text-dark-blue)] text-xs sm:text-sm rounded-[5px] py-2 px-3 sm:py-1 sm:px-3 md:px-2.5 lg:px-3 border border-[var(--color-text-dark-blue)] flex-shrink min-w-0"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Subscribe bar */}
        <div className="bg-[var(--color-primary)] text-[var(--color-text-white)] rounded-[10px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8 mt-8 sm:mt-10">
          <div className="text-[var(--color-text-white)] font-bold text-lg sm:text-xl md:text-2xl leading-snug md:flex-shrink-0">
            Get the latest
            <br />
            offers &amp; updates
          </div>
          {/* decorative divider to match mockup */}
          <div className="hidden md:block flex-1 h-px bg-[var(--color-divider-primary)]"></div>
          {/* subscribe button */}
          <div className="flex justify-end">
            <button className="bg-white text-black font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
              SUBSCRIBE
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 sm:mt-10 flex flex-row items-center gap-1 whitespace-nowrap text-xs sm:text-sm text-[var(--color-text-grey)] pb-8 sm:pb-10 md:pb-12">
          <div>Copyright © 2025</div>
          <div className="text-[var(--color-primary)] font-medium">Servisca</div>
          <div>. All rights reserved</div>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(FooterComponent);


