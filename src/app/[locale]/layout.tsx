import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import Footer from "@/shared/components/footer";
import Header from "@/shared/components/header";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header showSearchForm={false} />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}
