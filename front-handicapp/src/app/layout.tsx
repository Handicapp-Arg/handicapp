import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { RootErrorBoundary } from "@/components/error";
import { PWAInstallPrompt, PWAUpdateNotification, OfflineIndicator } from "@/components/pwa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HandicApp",
  description: "Sistema de Gestión Equina - HandicApp",
  keywords: ["handicapp", "gestión equina", "caballos", "establecimientos", "veterinaria"],
  authors: [{ name: "HandicApp Team" }],
  creator: "HandicApp",
  publisher: "HandicApp",
  icons: {
    icon: "/logos/logo-icon-brown.png",
    shortcut: "/logos/logo-icon-brown.png",
    apple: "/logos/logo-icon-brown.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HandicApp",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "HandicApp",
    title: "HandicApp - Sistema de Gestión Equina",
    description: "Sistema integral de gestión para establecimientos equinos",
  },
  twitter: {
    card: "summary",
    title: "HandicApp",
    description: "Sistema de Gestión Equina",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <RootErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <Providers>
            <div className="h-full w-full">
              {/* PWA Components */}
              <OfflineIndicator />
              <PWAUpdateNotification />
              <PWAInstallPrompt />
              
              {children}
            </div>
          </Providers>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
