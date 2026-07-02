import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TCG Insurance — Premium Protection for Your Trading Card Collection",
  description:
    "Specialized insurance for TCG collectors and dealers. Coverage for graded cards, sealed product, convention travel, and more. $0 deductible available. Get an instant quote.",
  keywords:
    "tcg insurance, trading card insurance, pokemon card insurance, magic the gathering insurance, graded card insurance, collectible card insurance, card shop insurance",
  openGraph: {
    title: "TCG Insurance — Protect Your Grails",
    description: "Premium protection for TCG collections, conventions, and dealers",
    url: "https://tcg-insurance.com",
    siteName: "TCG Insurance",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
