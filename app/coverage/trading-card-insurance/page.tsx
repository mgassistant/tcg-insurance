import type { Metadata } from "next";
import Link from "next/link";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";
import JsonLd from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trading Card Insurance — Graded Slabs & Sealed Product | TCG Insurance",
  description:
    "Insure Pokémon, Magic, Yu-Gi-Oh, and sports cards with agreed value. Coverage for PSA/BGS/CGC graded slabs, sealed booster boxes, and vintage singles — scheduled or blanket, $0 deductible, worldwide.",
  keywords:
    "trading card insurance, pokemon card insurance, graded card insurance, psa card insurance, sealed product insurance, sports card insurance, magic the gathering insurance",
  alternates: { canonical: "https://tcg-insurance.com/coverage/trading-card-insurance" },
  openGraph: {
    title: "Trading Card Insurance — Graded Slabs & Sealed Product",
    description:
      "Agreed-value coverage for PSA/BGS/CGC slabs, sealed product, and vintage singles. Scheduled or blanket, $0 deductible, worldwide.",
    url: "https://tcg-insurance.com/coverage/trading-card-insurance",
    type: "article",
  },
};

export default function TradingCardInsurance() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "Trading Card Insurance",
            description:
              "Agreed-value coverage for PSA/BGS/CGC graded slabs, sealed product, and vintage singles — scheduled or blanket, $0 deductible, worldwide.",
            url: absUrl("/coverage/trading-card-insurance"),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Coverage", path: "/coverage" },
            { name: "Trading Card Insurance", path: "/coverage/trading-card-insurance" },
          ]),
        ]}
      />
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage · Trading cards
          </span>
          <h1>
            <span className="holo-text">Trading card insurance</span> that speaks the
            hobby.
          </h1>
          <p className="lede">
            Graded slabs, sealed product, and vintage singles insured at agreed value —
            through BetterHelp Insurance and our specialty collectibles carriers. Coverage that understands the
            difference between a PSA 9 and a PSA 10, and prices your collection like the
            asset it is.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-holo btn-lg" href="/#quote">
              Request a card quote
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/coverage/vs-homeowners">
              Why not homeowners?
            </Link>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap prose">
          <h2>What we cover for card collectors</h2>
          <ul>
            <li>
              <strong>Graded slabs</strong> — PSA, BGS, CGC, SGC, and CSG cards scheduled
              with grading company and grade recorded.
            </li>
            <li>
              <strong>Raw singles</strong> — vintage and modern singles, including grails.
            </li>
            <li>
              <strong>Sealed product</strong> — booster boxes, cases, ETBs, and vintage
              sealed at market value.
            </li>
            <li>
              <strong>Store &amp; dealer inventory</strong> — retail stock, event
              inventory, and shipments.
            </li>
          </ul>

          <h2>Agreed value for graded cards</h2>
          <p>
            Card values move fast. With agreed value, you and the carrier set the insured value up
            front, and a covered total loss can pay up to 150% of that scheduled amount —
            so a card that appreciates between renewals isn&apos;t stuck at last year&apos;s
            number. Grading company and grade are recorded on your schedule, because a PSA
            10 and a PSA 9 of the same card are very different assets.
          </p>

          <h2>Scheduled vs. blanket for cards</h2>
          <p>
            <strong>Scheduled</strong> coverage lists high-value cards individually with
            agreed value — the right call for grails and key slabs. <strong>Blanket</strong>{" "}
            coverage puts one limit across a large collection (great for big raw lots and
            bulk), with a per-item limit of $50,000 and manual underwriting. Many collectors
            do both: schedule the grails, blanket the rest. See the full breakdown on our{" "}
            <Link className="inline-link" href="/coverage/benefits#scheduled-vs-blanket">
              Scheduled vs. Blanket
            </Link>{" "}
            explainer.
          </p>

          <h2>Grading submissions &amp; transit</h2>
          <p>
            Cards are most vulnerable when they move. Coverage follows your collection{" "}
            <Link className="inline-link" href="/coverage/benefits#transit">
              in transit
            </Link>{" "}
            — to a grader, to a show, or to a buyer — worldwide, with a $0 deductible.
          </p>

          <h2>When an appraisal is needed</h2>
          <p>
            For most cards no appraisal is required. Individual items valued above roughly
            $25,000 will generally need an appraisal or a bill of sale dated within the last
            three years. Very large card or memorabilia totals (over $200,000, or over
            $100,000 in California and Florida) may trigger a brief underwriting review — our
            intake form flags this for you automatically as you build your list. Coins,
            stamps, and currency must be graded to be scheduled.
          </p>

          <CoverageCTA heading="Get your cards covered the right way" />
          <p className="fine" style={{ marginTop: 16 }}>
            Related:{" "}
            <Link className="inline-link" href="/coverage/collectibles-memorabilia-insurance">
              Collectibles &amp; Memorabilia Insurance
            </Link>{" "}
            ·{" "}
            <Link className="inline-link" href="/coverage/whats-covered">
              What&apos;s Covered
            </Link>
          </p>
          <CoverageDisclaimer />
        </div>
      </section>
    </>
  );
}
