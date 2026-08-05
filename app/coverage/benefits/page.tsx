import type { Metadata } from "next";
import Link from "next/link";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";

export const metadata: Metadata = {
  title: "Coverage Benefits — Agreed Value, No Deductible, Worldwide | TCG Insurance",
  description:
    "Understand the core WAX collectibles coverage benefits: agreed value up to 150%, $0 deductible, worldwide protection, transit coverage, and scheduled vs. blanket coverage.",
  alternates: { canonical: "https://tcg-insurance.com/coverage/benefits" },
  openGraph: {
    title: "Coverage Benefits — Agreed Value, No Deductible, Worldwide",
    description:
      "The core benefits of WAX collectibles coverage explained: agreed value, $0 deductible, worldwide, transit, scheduled vs. blanket.",
    url: "https://tcg-insurance.com/coverage/benefits",
    type: "article",
  },
};

export default function Benefits() {
  return (
    <>
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage · Benefits
          </span>
          <h1>
            The benefits that make <span className="holo-text">specialty coverage</span>{" "}
            worth it.
          </h1>
          <p className="lede">
            Five things a collectibles policy through WAX does that a homeowners policy
            usually doesn&apos;t. Jump to any section below.
          </p>
          <nav className="anchor-nav" aria-label="On this page">
            <a href="#agreed-value">Agreed value</a>
            <a href="#no-deductible">No deductible</a>
            <a href="#worldwide">Worldwide</a>
            <a href="#transit">Transit</a>
            <a href="#scheduled-vs-blanket">Scheduled vs. blanket</a>
          </nav>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap prose">
          <h2 id="agreed-value">Agreed value (up to 150%)</h2>
          <p>
            With agreed value, you and WAX set your item&apos;s insured value up front —
            no arguing over depreciation at claim time. On a covered total loss, WAX can pay
            up to <strong>150% of the scheduled value</strong>, recognizing that
            collectibles appreciate. That&apos;s a fundamentally different promise from the
            actual-cash-value math a homeowners policy uses.
          </p>

          <h2 id="no-deductible">No deductible ($0)</h2>
          <p>
            A <strong>$0 deductible</strong> means a covered loss is paid without you
            absorbing the first several hundred or thousand dollars. For collectors filing a
            claim on a single high-value card or piece, that&apos;s real money that stays in
            your pocket.
          </p>

          <h2 id="worldwide">Worldwide protection</h2>
          <p>
            Coverage follows your collection <strong>worldwide</strong> — at home, at a
            convention, at a signing, or on vacation. It also includes loss and{" "}
            <strong>mysterious disappearance</strong>, one of the most common collectibles
            losses and one homeowners policies typically exclude.
          </p>

          <h2 id="transit">Transit coverage</h2>
          <p>
            Collectibles are most at risk when they move. Coverage extends to items{" "}
            <strong>in transit</strong> — shipped to a grader, mailed to a buyer, or carried
            to a show. Combined with worldwide protection and a $0 deductible, your items
            stay covered door to door.
          </p>

          <h2 id="scheduled-vs-blanket">Scheduled vs. blanket coverage</h2>
          <p>
            <strong>Scheduled</strong> coverage lists items individually with agreed value —
            ideal for grails, key graded slabs, and watches, where you want a specific
            insured value per item.
          </p>
          <p>
            <strong>Blanket</strong> coverage applies one total limit across many items,
            which suits large collections and bulk. Blanket has a{" "}
            <strong>per-item limit of $50,000</strong> and is manually underwritten; for a
            blanket quote we&apos;ll ask for your total item count, full blanket value, and
            your ten most valuable pieces. Many collectors combine both approaches — schedule
            the grails, blanket the rest.
          </p>

          <h3>Newly acquired items</h3>
          <p>
            Just bought something? <strong>Newly acquired items are automatically covered at
            25% of your class limit for 90 days</strong>, so a fresh pickup isn&apos;t left
            unprotected while you update your policy.
          </p>

          <CoverageCTA />
          <p className="fine" style={{ marginTop: 16 }}>
            See it in action:{" "}
            <Link className="inline-link" href="/coverage/vs-homeowners">
              WAX vs. Homeowners
            </Link>{" "}
            ·{" "}
            <Link className="inline-link" href="/coverage/trading-card-insurance">
              Trading Card Insurance
            </Link>
          </p>
          <CoverageDisclaimer />
        </div>
      </section>
    </>
  );
}
