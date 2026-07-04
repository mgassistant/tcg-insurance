import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TCG Insurance — Insurance for Trading Card Collections",
  description:
    "Specialized insurance for TCG collectors, game stores, and dealers. Coverage may be available for graded slabs, sealed product, store inventory, and in-transit shipments. Get a free quote in minutes.",
  keywords:
    "tcg insurance, trading card insurance, pokemon card insurance, magic the gathering insurance, graded card insurance, collectible card insurance, card shop insurance, sealed product insurance",
  openGraph: {
    title: "TCG Insurance — Insure Your Collection Like the Asset It Is",
    description:
      "Specialized coverage for graded slabs, sealed product, vintage singles, and store inventory.",
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
    <html lang="en">
      <body className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable}`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
