import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Admin Store | HEC Entrepreneurs",
  description: "Gestion de la boutique IHEC Store",
};

export default function AdminStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 font-sans">
      <Navbar />
      <main className="pt-20 min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}
