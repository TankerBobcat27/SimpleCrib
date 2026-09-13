import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopCal · Calibration Tracker",
  description:
    "Multi-tenant gage due board for US machine shops. Faster than Excel and the clipboard, with daily hosted backups. Not ERP, ProShop, CRIBWISE, or eQMS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
