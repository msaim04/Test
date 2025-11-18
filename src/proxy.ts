import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/request";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Never show locale prefix in URLs
  localePrefix: "never",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude auth routes and customer/provider routes from next-intl middleware
  // These routes are outside the [locale] folder structure
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-password-reset") ||
    pathname.startsWith("/new-password") ||
    pathname.startsWith("/customer") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/support")
  ) {
    return NextResponse.next();
  }

  // Apply next-intl middleware to all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except static files and API routes
  // Auth routes are excluded in the middleware function above
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

