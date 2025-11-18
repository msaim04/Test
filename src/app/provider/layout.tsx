import type { ReactNode } from 'react';

/**
 * Provider layout
 * Used for pages nested under /provider
 */
export default function ProviderLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

