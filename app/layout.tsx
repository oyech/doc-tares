import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doc Maker — TAMAN ANGGREK RESIDENCE",
  description: "Aplikasi pembuatan dokumen Berita Acara dan Bill of Quantity (BQ) Engineering Taman Anggrek Residences.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon_16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon_64x64.png", sizes: "64x64", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#14532D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-gray-900">
        {children}
      </body>
    </html>
  );
}
