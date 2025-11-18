import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LOGO_CONFIG } from "../constants";

/**
 * Logo component - Reusable and memoized
 * Responsive: Scales appropriately on all screen sizes
 */
export const Logo = React.memo(function Logo() {
  return (
    <div className="flex flex-col items-start w-auto sm:w-[140px] md:w-[172px] pt-[5px] px-2 sm:px-4 md:px-[17px] flex-shrink-0">
      <Link href="/" className="flex-shrink-0">
        <Image
          src={LOGO_CONFIG.src}
          alt={LOGO_CONFIG.alt}
          width={LOGO_CONFIG.width}
          height={LOGO_CONFIG.height}
          className="object-fill w-[120px] sm:w-[110px] md:w-[137px] h-auto"
          priority
        />
      </Link>
    </div>
  );
});

