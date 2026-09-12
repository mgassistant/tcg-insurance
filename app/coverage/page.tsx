import type { Metadata } from "next";
import Link from "next/link";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";
import JsonLd from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Collectibles Insurance Coverage | TCG Insurance",
  description:
    "Explore specialized collectibles insurance through BetterHelp Insurance: agreed value up to 150%, $0 deductible, worldwide and transit protection, scheduled or blanket coverage for trading cards, memorabilia, watches, and more.",
  alternates: { canonical: "https://tcg-insurance.com/coverage" },
  openGraph: {
    title: "Collectibles Insurance Coverage | TCG Insurance",
    description:
      "Agreed value, $0 deductible, worldwide protection. Scheduled or blanket coverage for the collectibles a standard homeowners policy ignores.",
    url: "https://tcg-insurance.com/coverage",
    type: "website",
  },
};

const PAGES = [
  {
    href: "/coverage/whats-covered",
    title: "What's Covered",
    desc: "The full list of collectibles categories — trading cards and memorabilia front and center.",
  },
  {
    href: "/coverage/vs-homeowners",
    title: "Specialty vs. Homeowners Insurance",
    desc: "A side-by-side comparison of specialty collectibles coverage against a standard homeowners policy.",
  },
  {
    href: "/coverage/trading-card-insurance",
    title: "Trading Card Insurance",
    desc: "Graded slabs, sealed product, PSA/BGS/CGC, agreed value, and scheduled vs. blanket for cards.",
  },
  {
    href: "/coverage/collectibles-memorabilia-insurance",
    title: "Collectibles & Memorabilia Insurance",
    desc: "Sports memorabilia, autographs, game-worn items, and signed pieces — insured at agreed value.",
  },
  {
    href: "/coverage/benefits",
    title: "Coverage Benefits Explained",
    desc: "Agreed value, no deductible, worldwide protection, transit coverage, and scheduled vs. blanket.",
  },
];

export default function CoverageHub() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "Collectibles Insurance Coverage",
            description:
              "Specialized collectibles insurance: agreed value up to 150%, $0 deductible, worldwide and transit protection, scheduled or blanket coverage.",
            url: absUrl("/coverage"),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Coverage", path: "/coverage" },
          ]),
        ]}
      />
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage
          </span>
          <h1>
            Insurance built for <span className="holo-text">collectibles</span>, not
            afterthoughts.
          </h1>
          <p className="lede">
            Through BetterHelp Insurance and our specialty collectibles carriers, coverage may be available for
            trading cards, memorabilia, watches, art, and more — with agreed value, a $0
            deductible, and worldwide protection a homeowners policy simply doesn&apos;t
            offer.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-holo btn-lg" href="/#quote">
              Request a quote
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/coverage/vs-homeowners">
              Why not homeowners?
            </Link>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tiers" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {PAGES.map((p) => (
              <Link key={p.href} href={p.href} className="tier" style={{ textDecoration: "none" }}>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="from">
                  <b>Read more →</b>
                </div>
              </Link>
            ))}
          </div>

          <div className="prose" style={{ marginTop: 48 }}>
            <CoverageCTA />
            <CoverageDisclaimer />
          </div>
        </div>
      </section>
    </>
  );
}
