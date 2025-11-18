import React from "react";

interface SupportMessageProps {
  message?: string;
}

/**
 * Support message component - Memoized
 * Responsive: Text sizing and alignment adapts to screen size
 */
export const SupportMessage = React.memo<SupportMessageProps>(
  function SupportMessage() {
    return (
      <div className="flex w-full">
        <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-4">
        <div className="py-3 md:py-4 mb-4 md:mb-4 text-center text-[16px] text-[var(--color-text-dark-blue)] border-b border-[var(--color-primary)]">
        {/* Split message to emphasize the assistant part per mockup */}
            <span>For customer service, </span>
            <span className="font-semibold underline">please ask our support assistant</span>
          </div>
        </div>
      </div>
    );
  }
);

