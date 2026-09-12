import {
  SITE_URL,
  SITE_NAME,
  SITE_PHONE_E164,
  AGENCY_LEGAL_NAME,
  absUrl,
} from "./site";
import type { BlogPost } from "./blog/types";

const LOGO_URL = absUrl("/icon.png");

/** Organization / InsuranceAgency schema for the site as a whole. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: AGENCY_LEGAL_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    telephone: SITE_PHONE_E164,
    description:
      "Specialized insurance for trading card collectors, game stores, and dealers — coverage for graded slabs, sealed product, and in-transit shipments.",
    areaServed: "US",
    knowsAbout: [
      "Trading card insurance",
      "Personal articles floater",
      "Collectibles insurance",
      "Graded card insurance",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Service schema for coverage pages. */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Insurance",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    areaServed: "US",
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  };
}

export function articleSchema(post: BlogPost) {
  const url = absUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    keywords: post.keywords,
    url,
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
