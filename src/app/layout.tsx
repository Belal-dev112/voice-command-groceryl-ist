import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Voice Grocery — Say it, don't type it",
  description: "Minimalist Apple-inspired voice grocery assistant with smart seasonal picks, substitutes, and multilingual voice recognition.",
};

export const viewport: Viewport = {
  themeColor: "#090d0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans bg-[#090d0b] text-[#f5f7f6] min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
