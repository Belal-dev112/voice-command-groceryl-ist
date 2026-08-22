import type { Metadata, Viewport } from "next";
import { Kalam, Work_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "Voice List — Say it, don't type it",
  description: "A voice-controlled shopping list assistant with smart, seasonal, and multilingual suggestions.",
};

export const viewport: Viewport = {
  themeColor: "#1b2e23",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${kalam.variable} ${workSans.variable} board-texture min-h-screen antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
