"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { Button as CustomButton } from "@/shared/ui/button";
import { TestimonialCard } from "./testimonial-card";
import { MEDIA } from "@/shared/constants/media";
import { cn } from "@/shared/utils/format";

interface HeroImageCardProps {
  image: string;
  imageAlt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  categoryLabel?: string;
  sx?: Record<string, unknown>;
  centerOnMobile?: boolean;
}

/**
 * Reusable Hero Image Card Component with optional text overlay
 * Built with MUI Card and Tailwind styling
 */
const HeroImageCard = React.memo<HeroImageCardProps>(function HeroImageCard({
  image,
  imageAlt,
  width = 620,
  height = 362,
  title,
  description,
  buttonText,
  onButtonClick,
  className,
  categoryLabel,
  sx,
  centerOnMobile = false,
}) {
  return (
    <Card
      className={cn("relative w-full max-w-full overflow-hidden rounded-[20px] shadow-none", className)}
      aria-label={imageAlt}
      sx={{ 
        borderRadius: "20px",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: { xs: "280px", sm: "280px", md: "350px", lg: "362px" },
        aspectRatio: { md: `${width}/${height}`, lg: `${width}/${height}` },
        ...(sx || {})
      }}
    >
      {categoryLabel && (
        <Chip
          label={categoryLabel}
          className="absolute top-3 left-3 md:top-4 md:left-4"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "var(--color-text-dark-blue)",
            fontSize: { xs: "12px", md: "14px" },
            fontWeight: "600",
            padding: "4px 12px",
          }}
        />
      )}
      {(title || description || buttonText) && (
        <Box
          className={`absolute inset-0 flex flex-col ${centerOnMobile ? 'items-center md:items-start' : 'items-start'} justify-end gap-2 md:gap-3`}
          sx={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
            padding: { xs: "16px", sm: "20px", md: "24px", lg: "32px" }
          }}
        >
          <Box className={`flex flex-col ${centerOnMobile ? 'items-center md:items-start' : 'items-start'} gap-2 md:gap-2 w-full`}>
            {title && (
              <Typography
                variant="h2"
                className={`text-white max-w-md ${centerOnMobile ? 'text-center md:text-left' : ''}`}
                sx={{
                  fontSize: { xs: "20px", sm: "24px", md: "28px", lg: "32px" },
                  fontWeight: { xs: "600", md: "700", lg: "800" },
                  color: "white",
                  lineHeight: { xs: "1.3", md: "1.2" },
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                variant="body2"
                className={`text-white ${centerOnMobile ? 'text-center md:text-left' : ''}`}
                sx={{
                  fontSize: { xs: "12px", md: "14px" },
                  color: "white",
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          {buttonText && (
            <Box className={`flex ${centerOnMobile ? 'items-center justify-center md:items-start md:justify-start' : 'items-start'} w-full flex-shrink-0 mt-1`}>
              <CustomButton onClick={onButtonClick} variant="secondary" size="md">
                {buttonText}
              </CustomButton>
            </Box>
          )}
        </Box>
      )}
      <Box
        className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={MEDIA.icons.arrow}
          alt="Arrow"
          width={100}
          height={100}
         
        />
      </Box>
    </Card>
  );
});

interface ServiceImageCardProps {
  image: string;
  imageAlt: string;
  width?: number;
  height?: number;
  categoryLabel?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

/**
 * Reusable Service Image Card Component with category label and title
 * Built with MUI Card and Tailwind styling
 */
const ServiceImageCard = React.memo<ServiceImageCardProps>(function ServiceImageCard({
  image,
  imageAlt,
  width = 294,
  height = 187,
  categoryLabel,
  title,
  description,
  buttonText,
  onButtonClick,
  className,
}) {
  return (
    <Card
      className={cn("relative flex-1 w-full max-w-full overflow-hidden rounded-[20px] shadow-none", className)}
      aria-label={imageAlt}
      sx={{ 
        borderRadius: "20px",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: { xs: "200px", sm: "180px", md: "180px", lg: "187px" },
        aspectRatio: { sm: `${width}/${height}`, md: `${width}/${height}`, lg: `${width}/${height}` }
      }}
    >
      {categoryLabel && (
        <Chip
          label={categoryLabel}
          className="absolute top-3 left-3 md:top-4 md:left-4"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "var(--color-text-dark-blue)",
            fontSize: { xs: "12px", md: "14px" },
            fontWeight: "600",
            padding: "4px 12px",
          }}
        />
      )}
      {(title || description || buttonText) && (
        <Box
          className="absolute inset-0 flex flex-col items-start justify-end gap-2 md:gap-2"
          sx={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
            padding: { xs: "12px", sm: "16px", md: "16px" }
          }}
        >
          <Box className="flex flex-col items-start gap-1 md:gap-2 w-full">
            {title && (
              <Typography
                variant="h3"
                className="text-white"
                sx={{
                  fontSize: { xs: "14px", md: "16px", lg: "22px" },
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                variant="body2"
                className="text-white"
                sx={{
                  fontSize: { xs: "12px", md: "14px" },
                  color: "white",
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          {buttonText && (
            <Box className="flex items-start w-full flex-shrink-0 mt-1">
              <CustomButton onClick={onButtonClick} variant="secondary" size="sm">
                {buttonText}
              </CustomButton>
            </Box>
          )}
        </Box>
      )}
      <Box
        className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <Image
          src={MEDIA.icons.arrow}
          alt="Arrow"
          width={100}
          height={100}
        />
      </Box>
    </Card>
  );
});

interface BeAProCardProps {
  onButtonClick?: () => void;
}

/**
 * Be a Pro CTA Card Component
 * Built with MUI Card and Tailwind styling
 */
export const BeAProCard = React.memo<BeAProCardProps>(function BeAProCard({
  onButtonClick,
}) {
  return (
    <Card
      className="relative flex-1 w-full max-w-full overflow-hidden rounded-[20px] shadow-none"
      sx={{
        borderRadius: "20px",
        backgroundColor: "var(--color-primary)",
        position: "relative",
        minHeight: { xs: "200px", sm: "180px", md: "180px", lg: "187px" },
      }}
    >
      <CardContent
        className="flex flex-col items-start"
        sx={{ 
          padding: { xs: "16px", sm: "18px", md: "15px" },
          paddingRight: { xs: "16px", sm: "16px", md: "9px" }
        }}
      >
        <Box
          className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors z-10"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={MEDIA.icons.arrow}
            alt="Arrow"
            width={100}
            height={100}
          />
        </Box>
        <Box className="flex justify-between items-start self-stretch mb-2 md:mb-3" sx={{ marginLeft: { xs: "0px", sm: "0px", md: "20px", lg: "20px" } }}>
          <Image
            src="/images/servisca mini logo.png"
            alt="Servisca logo"
            width={37}
            height={30}
            className="w-[30px] md:w-[37px] h-[24px] md:h-[30px] rounded-[20px] object-fill"
          />
          <Image
            src="/images/join-pattern.png"
            alt="Decoration"
            width={40}
            height={40}
            className="w-8 md:w-10 h-8 md:h-10 rounded-[20px] object-fill"
          />
        </Box>
        <Box 
          className="flex flex-col items-center md:items-start flex-1 w-full gap-3 sm:gap-4 md:gap-5"
          sx={{ marginLeft: { xs: "0px", sm: "0px", md: "21px" } }}
        >
          <Typography
            variant="body1"
            className="text-white whitespace-pre-line text-center md:text-left"
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              color: "white",
              fontWeight: 400,
            }}
          >
            {"Ready to turn your skills\ninto income?"}
          </Typography>
          <CustomButton onClick={onButtonClick} variant="secondary" size="md">
            Be a pro
          </CustomButton>
        </Box>
        <Image
          src="/images/join-pattern.png"
          alt="Decoration"
          width={231}
          height={119}
          className="w-[120px] md:w-[150px] lg:w-[231px] h-auto absolute bottom-0 right-[-1px] rounded-[20px] object-fill"
          style={{ height: "auto" }}
        />
      </CardContent>
    </Card>
  );
});

/**
 * Hero Cards Section Component
 * Built with MUI components and Tailwind styling
 * Responsive: Adapts layout from vertical (mobile) to horizontal (desktop)
 * 3-column layout on desktop, stacks vertically on mobile
 */
export function HeroCardsSection() {
  const handleBeAPro = () => {
    alert("Pressed!");
  };

  const handleGetQuickMatch = () => {
    alert("Get Quick Match clicked!");
  };

  return (
    <Box 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] items-stretch self-stretch w-full max-w-full gap-4 sm:gap-5 md:gap-6 overflow-hidden"
      sx={{
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          lg: "2fr 1fr 1fr"
        },
        gap: { xs: "16px", sm: "20px", md: "24px" }
      }}
    >
      {/* Left Column - Responsive width: full on mobile/tablet, 600px on large screens */}
      <Box 
        className="flex flex-col items-stretch w-full max-w-full overflow-hidden md:col-span-2 lg:col-span-1"
        sx={{
          gap: { xs: "16px", sm: "20px", md: "24px", lg: "24px" }
        }}
      >
        {/* Main Hero Image - 620x362 */}
        <HeroImageCard
          image={MEDIA.landing.section1.img1}
          imageAlt="Service providers"
          width={620}
          height={362}
          priority
          title="A world of talent right at your fingertips. Get help now."
          buttonText="Get a Quick Match"
          onButtonClick={handleGetQuickMatch}
          categoryLabel="Service"
          centerOnMobile={true}
        />

        {/* Bottom Row Cards */}
        <Box 
          className="flex flex-col sm:flex-row items-stretch self-stretch w-full max-w-full overflow-hidden"
          sx={{
            gap: { xs: "16px", sm: "20px", md: "24px", lg: "31px" }
          }}
        >
          {/* Moving Card - 294x187 */}
          <ServiceImageCard
            image={MEDIA.landing.section1.img4}
            imageAlt="Moving service"
            width={294}
            height={187}
            categoryLabel="Shipping"
            title="Moving"
          />
          {/* Be a Pro Card - 294px width */}
          <BeAProCard onButtonClick={handleBeAPro} />
        </Box>
      </Box>

      {/* Middle Column - Responsive width: full on mobile/tablet, 280px on large screens */}
      <Box 
        className="flex flex-col items-stretch w-full max-w-full overflow-hidden md:h-auto lg:h-full"
        sx={{
          gap: { xs: "16px", sm: "20px", md: "20px", lg: "20px" }
        }}
      >
        {/* Handyman Services Card - Smaller height */}
        <ServiceImageCard
          image={MEDIA.landing.section1.img2}
          imageAlt="Handyman Services"
          width={304}
          height={180}
          categoryLabel="Wood"
          title="Handyman Services"
          className="w-full flex-shrink-0"
        />

        {/* Testimonial Card - Takes remaining space with large height on large screens */}
        <Box className="flex-1 w-full overflow-hidden min-h-[320px] sm:min-h-[340px] md:min-h-[200px] lg:min-h-[370px]">
          <TestimonialCard className="h-full" />
        </Box>
      </Box>

      {/* Right Column - Responsive width: full on mobile/tablet, 304px on large screens */}
      <Box 
        className="flex flex-col items-stretch w-full max-w-full overflow-hidden md:col-span-2 lg:col-span-1"
        sx={{
          marginTop: { md: "-20px", lg: "0px" }
        }}
      >
        <HeroImageCard
          image={MEDIA.landing.section1.img3}
          imageAlt="Makeup Artist"
          width={304}
          height={574}
          categoryLabel="Beauty"
          title="Makeup Artist"
          description="Grooming Starts Here: Elevate Your Beauty Now."
          buttonText="Get a Quick Match"
          onButtonClick={handleGetQuickMatch}
          className="w-full md:h-auto lg:h-full"
          centerOnMobile={true}
          sx={{
            minHeight: { xs: "320px", sm: "380px", md: "400px", lg: "574px" },
            aspectRatio: { md: "304/400", lg: "304/574" }
          }}
        />
      </Box>
    </Box>
  );
}
