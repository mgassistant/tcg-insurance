import type { ReactNode } from "react";

export interface FaqItem {
  q: string;
  /** Plain-text answer used for FAQPage JSON-LD (no markup). */
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Short SEO/meta description (~150-160 chars). */
  description: string;
  /** One-line summary shown on cards/listings. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date (YYYY-MM-DD). */
  dateModified: string;
  author: string;
  keywords: string;
  /** Rough read time in minutes. */
  readMinutes: number;
  /** True for the pillar/cornerstone guide. */
  cornerstone?: boolean;
  /** FAQ block rendered on-page and emitted as FAQPage JSON-LD. */
  faqs?: FaqItem[];
  /** The rendered article body (H2/H3, prose, internal links). */
  body: ReactNode;
}
