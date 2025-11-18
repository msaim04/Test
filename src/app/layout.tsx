import { Baloo_2 } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { QueryProvider, AuthProvider } from "@/core/providers";

const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo-2",
});

/**
 * Root layout - Required by Next.js App Router
 * Must contain <html> and <body> tags
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
