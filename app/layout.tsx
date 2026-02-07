import type { Metadata } from "next";
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
  title: "HEC Entrepreneurs",
  description: "The premier entrepreneurship club at IHEC Carthage. Empowering students to build impactful startups.",
  keywords: ["HEC Entrepreneurs", "IHEC Carthage", "Startup", "Entrepreneurship", "Innovation"],
  authors: [{ name: "HEC Entrepreneurs" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "HEC Entrepreneurs",
    description: "Empowering the next generation of founders at IHEC Carthage.",
    url: "https://hec-entrepreneurs.vercel.app", // Placeholder URL
    siteName: "HEC Entrepreneurs",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "HEC Entrepreneurs Preview",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEC Entrepreneurs",
    description: "Empowering the next generation of founders at IHEC Carthage.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
