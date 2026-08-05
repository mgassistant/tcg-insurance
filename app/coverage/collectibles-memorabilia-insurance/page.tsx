import type { Metadata } from "next";
import Link from "next/link";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";

export const metadata: Metadata = {
  title: "Collectibles & Memorabilia Insurance — Autographs, Sports & More | TCG Insurance",
  description:
    "Insure sports memorabilia, autographs, game-worn gear, and signed collectibles at agreed value through WAX. $0 deductible, worldwide coverage, and mysterious-disappearance protection.",
  keywords:
    "memorabilia insurance, sports memorabilia insurance, autograph insurance, signed collectibles insurance, game worn insurance, collectibles insurance",
  alternates: {
    canonical: "https://tcg-insurance.com/coverage/collectibles-memorabilia-insurance",
  },
  openGraph: {
    title: "Collectibles & Memorabilia Insurance",
    description:
      "Agreed-value coverage for sports memorabilia, autographs, and signed collectibles. $0 deductible, worldwide.",
    url: "https://tcg-insurance.com/coverage/collectibles-memorabilia-insurance",
    type: "article",
  },
};

export default function MemorabiliaInsurance() {
  return (
    <>
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage · Collectibles &amp; memorabilia
          </span>
          <h1>
            <span className="holo-text">Memorabilia insurance</span> for the pieces that
            can&apos;t be replaced.
          </h1>
          <p className="lede">
            Signed jerseys, game-worn gear, autographed photos, and authenticated
            collectibles insured at agreed value through WAX — with a $0 deductible and
            worldwide protection a homeowners policy won&apos;t match.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-holo btn-lg" href="/#quote">
              Request a quote
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/coverage/whats-covered">
              See all categories
            </Link>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap prose">
          <h2>What counts as memorabilia</h2>
          <ul>
            <li>
              <strong>Sports memorabilia</strong> — game-worn and game-used jerseys, balls,
              bats, and equipment.
            </li>
            <li>
              <strong>Autographs</strong> — signed cards, photos, jerseys, and
              certificates, ideally with authentication (JSA, PSA/DNA, Beckett).
            </li>
            <li>
              <strong>Entertainment &amp; music memorabilia</strong> — signed instruments,
              props, and screen-used items.
            </li>
            <li>
              <strong>Comics, figures, and related collectibles</strong> — often insured
              alongside cards and memorabilia.
            </li>
          </ul>

          <h2>Why agreed value matters for memorabilia</h2>
          <p>
            Authenticated memorabilia is unique and often irreplaceable, which makes
            &quot;actual cash value&quot; a poor fit. Agreed value locks in what your piece
            is worth and can pay up to 150% of the scheduled value on a covered total loss.
            Authentication and provenance strengthen your schedule and speed underwriting.
          </p>

          <h2>Loss, mysterious disappearance &amp; transit</h2>
          <p>
            Coverage includes loss and{" "}
            <strong>mysterious disappearance</strong> — a piece that goes missing without
            explanation — which standard homeowners policies typically exclude. And because
            memorabilia travels to shows, signings, and buyers, coverage follows it{" "}
            <Link className="inline-link" href="/coverage/benefits#transit">
              in transit
            </Link>{" "}
            worldwide.
          </p>

          <h2>Scheduling higher-value pieces</h2>
          <p>
            Individual items above roughly $25,000 generally need an appraisal or a recent
            bill of sale (within three years). Large memorabilia totals — over $250,000, or
            over $100,000 in California and Florida — may trigger a short underwriting
            review. Our{" "}
            <Link className="inline-link" href="/#quote">
              intake form
            </Link>{" "}
            flags these automatically so nothing surprises you.
          </p>

          <CoverageCTA />
          <p className="fine" style={{ marginTop: 16 }}>
            Related:{" "}
            <Link className="inline-link" href="/coverage/trading-card-insurance">
              Trading Card Insurance
            </Link>{" "}
            ·{" "}
            <Link className="inline-link" href="/coverage/vs-homeowners">
              WAX vs. Homeowners
            </Link>
          </p>
          <CoverageDisclaimer />
        </div>
      </section>
    </>
  );
}
