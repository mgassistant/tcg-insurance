import type { Metadata } from "next";
import Link from "next/link";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Specialty vs. Homeowners Insurance for Collectibles | TCG Insurance",
  description:
    "Homeowners policies cap collectibles and exclude mysterious disappearance. Compare specialty collectibles coverage — agreed value up to 150%, $0 deductible, worldwide protection — against a standard homeowners policy.",
  alternates: { canonical: "https://tcg-insurance.com/coverage/vs-homeowners" },
  openGraph: {
    title: "Specialty vs. Homeowners Insurance for Collectibles",
    description:
      "Why a specialty collectibles policy beats homeowners: agreed value, $0 deductible, worldwide and mysterious-disappearance coverage.",
    url: "https://tcg-insurance.com/coverage/vs-homeowners",
    type: "article",
  },
};

const ROWS: { feature: string; wax: string; home: string; waxYes?: boolean; homeNo?: boolean }[] = [
  {
    feature: "Valuation",
    wax: "Agreed value — paid up to 150% of scheduled value on a covered total loss",
    home: "Actual cash value or sub-limited replacement cost",
  },
  {
    feature: "Items covered",
    wax: "Purpose-built for collectibles: cards, memorabilia, watches, art, coins, and more",
    home: "Collectibles typically capped at a few thousand dollars total",
  },
  {
    feature: "Deductible",
    wax: "$0 deductible",
    home: "Standard deductible applies (often $500–$2,500)",
  },
  {
    feature: "Mysterious disappearance",
    wax: "Covered — loss and mysterious disappearance included",
    home: "Usually excluded",
  },
  {
    feature: "Where you're covered",
    wax: "Worldwide — home, shows, transit, and travel",
    home: "Primarily at the insured residence",
  },
  {
    feature: "Appraisal requirement",
    wax: "Appraisal or bill of sale (within 3 yrs) generally required only above ~$25,000 per item ($50,000 for watches)",
    home: "Scheduling collectibles often requires appraisals with tighter limits",
  },
  {
    feature: "Impact on home policy",
    wax: "Standalone — a claim doesn't touch your homeowners policy or premium",
    home: "A collectibles claim counts against your home policy and can raise rates",
  },
  {
    feature: "Newly acquired items",
    wax: "Automatically covered at 25% of the class limit for 90 days",
    home: "Typically not covered until manually scheduled",
  },
];

export default function VsHomeowners() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Coverage", path: "/coverage" },
          { name: "Specialty vs. Homeowners", path: "/coverage/vs-homeowners" },
        ])}
      />
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage · Specialty vs. Homeowners
          </span>
          <h1>
            Why a homeowners policy{" "}
            <span className="holo-text">won&apos;t protect</span> your collection.
          </h1>
          <p className="lede">
            Standard homeowners and renters policies were never designed for a six-figure
            card collection or a signed jersey wall. They cap collectibles, exclude
            mysterious disappearance, and pay depreciated value. Specialty collectibles coverage
            through BetterHelp Insurance is built differently.
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap prose">
          <h2>Specialty collectibles coverage vs. a standard homeowners policy</h2>
          <div className="cmp-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Specialty collectibles coverage</th>
                  <th>Standard homeowners</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.feature}>
                    <th scope="row">{r.feature}</th>
                    <td className="wax">{r.wax}</td>
                    <td className="home">{r.home}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>What &quot;agreed value up to 150%&quot; actually means</h2>
          <p>
            With agreed value, you and the carrier agree on an item&apos;s insured value up
            front. On a covered total loss, the carrier can pay up to 150% of that scheduled
            value — recognizing that collectibles appreciate, and that a market-moving card
            may be worth more than the number on your schedule. A homeowners policy, by
            contrast, tends to pay depreciated actual cash value, if the item is covered at
            all.
          </p>

          <h2>No deductible, worldwide, and standalone</h2>
          <p>
            A $0 deductible means a covered loss is paid without you eating the first
            several hundred or thousand dollars. Coverage follows your items{" "}
            <strong>worldwide</strong> — at home, at a show, and{" "}
            <Link className="inline-link" href="/coverage/benefits#transit">
              in transit
            </Link>
            . And because the policy is standalone, a claim on your collection doesn&apos;t
            raise your home insurance premium or count against that policy.
          </p>

          <h2>Loss &amp; mysterious disappearance</h2>
          <p>
            &quot;Mysterious disappearance&quot; — an item that simply goes missing with no
            explainable cause — is one of the most common collectibles losses and one that
            homeowners policies routinely exclude. Specialty collectibles coverage includes it.
          </p>

          <CoverageCTA heading="See what your collection would cost to protect" />
          <p className="fine" style={{ marginTop: 16 }}>
            Explore next:{" "}
            <Link className="inline-link" href="/coverage/trading-card-insurance">
              Trading Card Insurance
            </Link>{" "}
            ·{" "}
            <Link className="inline-link" href="/coverage/collectibles-memorabilia-insurance">
              Collectibles &amp; Memorabilia
            </Link>{" "}
            ·{" "}
            <Link className="inline-link" href="/coverage/benefits">
              Coverage Benefits
            </Link>
          </p>
          <CoverageDisclaimer />
        </div>
      </section>
    </>
  );
}
