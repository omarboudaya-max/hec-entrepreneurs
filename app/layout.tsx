import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AiAssistant from "@/components/AiAssistant";
import LiveFeed from "@/components/LiveFeed";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hec-entrepreneurs.vercel.app"),
  title: "HEC Entrepreneurs | Bâtir le Possible",
  description: "Le premier club d'entrepreneuriat à l'IHEC Carthage. Donner aux étudiants les moyens de bâtir des startups à impact. Idéaliser, Construire, Propulser.",
  keywords: ["HEC Entrepreneurs", "IHEC Carthage", "Startup", "Entrepreneuriat", "Innovation"],
  authors: [{ name: "HEC Entrepreneurs" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "HEC Entrepreneurs",
    description: "Former la prochaine génération de fondateurs à l'IHEC Carthage.",
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
    description: "Former la prochaine génération de fondateurs à l'IHEC Carthage.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <AiAssistant />
        <LiveFeed />
        <Analytics />
      </body>
    </html>
  );
}
