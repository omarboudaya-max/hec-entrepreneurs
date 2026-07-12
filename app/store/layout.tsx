import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "IHEC Store | HEC Entrepreneurs",
  description: "Boutique officielle du club HEC Entrepreneurs",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 font-sans">
      <Navbar />
      <main className="pt-24 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}
