import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-dm-sans' });

export const viewport: Viewport = {
  themeColor: "#0A0812",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Deseos en Pareja",
  description: "Una app elegante para intercambiar deseos con tu pareja.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deseos en Pareja"
  },
  applicationName: "Deseos",
};

import Navigation from "@/components/Navigation";
import PWARegister from "@/components/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.className} ${playfair.variable} ${dmSans.variable}`}>
        <Providers>
          <PWARegister />
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
