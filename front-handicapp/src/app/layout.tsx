import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

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
  // manifest: "/manifest.json", // Comentado hasta crear el archivo
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3C2013",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <Providers>
          <div className="h-full w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
