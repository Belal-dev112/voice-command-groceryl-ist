import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Voice Grocery — Organic & Minimalist Shopping",
  description: "An editorial, voice-first organic grocery assistant with smart seasonal recommendations and multilingual support.",
};

export const viewport: Viewport = {
  themeColor: "#2c3e33",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${plusJakarta.variable} font-sans bg-[#2c3e33] text-[#f2efe9] min-h-screen antialiased selection:bg-[#5b8466]/40 selection:text-[#f2efe9]`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
