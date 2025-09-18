import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NZLouis AI Games",
  description: "AI Games for my son",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
        style={{maxWidth: "2000px", margin: "0 auto"}}
      >
        <ResponsiveProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </ResponsiveProvider>
      </body>
    </html>
  );
}
