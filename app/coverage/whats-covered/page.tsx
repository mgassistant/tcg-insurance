import type { Metadata } from "next";
import Link from "next/link";
import { ITEM_CATEGORIES } from "@/lib/intake";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";

export const metadata: Metadata = {
  title: "What's Covered — Collectibles Insurance Categories | TCG Insurance",
  description:
    "See every collectibles category WAX can insure — trading cards, sports memorabilia, autographs, watches, jewelry, fine art, comics, coins, and more — with agreed value and $0 deductible.",
  alternates: { canonical: "https://tcg-insurance.com/coverage/whats-covered" },
  openGraph: {
    title: "What's Covered — Collectibles Insurance Categories",
    description:
      "Every collectibles category WAX insures, with trading cards and memorabilia front and center.",
    url: "https://tcg-insurance.com/coverage/whats-covered",
    type: "article",
  },
};

const HOT = new Set([
  "Trading Cards",
  "Sports Memorabilia",
  "Memorabilia & Autographs",
  "Comic Books",
]);

export default function WhatsCovered() {
  return (
    <>
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Coverage · What&apos;s covered
          </span>
          <h1>
            What <span className="holo-text">WAX insures</span>.
          </h1>
          <p className="lede">
            WAX is a specialty carrier built for valuables and collectibles. If you collect
            it, there&apos;s a good chance it can be scheduled or blanket-insured — with
            trading cards and memorabilia squarely in the wheelhouse.
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap prose">
          <h2>Categories we can insure</h2>
          <p>
            Below is the full category list. Highlighted chips are where TCG Insurance
            specializes — but every category can be quoted through WAX.
          </p>
          <div className="cat-chips">
            {ITEM_CATEGORIES.filter((c) => c !== "Other").map((c) => (
              <span key={c} className={`cat-chip ${HOT.has(c) ? "hot" : ""}`}>
                {c}
              </span>
            ))}
          </div>

          <h2>Trading cards &amp; memorabilia — our focus</h2>
          <p>
            Graded slabs (PSA, BGS, CGC, SGC), raw singles, sealed booster boxes and cases,
            vintage product, and store or dealer inventory can all be covered. On the
            memorabilia side, think signed jerseys, game-worn gear, autographed
            photographs, and authenticated collectibles.
          </p>
          <ul>
            <li>
              <strong>Graded cards</strong> — insured at agreed value with grade and
              provenance recorded on the schedule.
            </li>
            <li>
              <strong>Sealed product</strong> — booster boxes, cases, and vintage sealed at
              market value.
            </li>
            <li>
              <strong>Sports &amp; entertainment memorabilia</strong> — autographs,
              game-used items, and authenticated pieces.
            </li>
            <li>
              <strong>Comics, coins, watches, art, and more</strong> — scheduled
              individually or covered under a blanket limit.
            </li>
          </ul>

          <h2>How items are covered</h2>
          <p>
            You can <strong>schedule</strong> high-value pieces individually (best for
            grails and watches) or use a <strong>blanket</strong> limit across a large
            collection. Learn the difference on our{" "}
            <Link className="inline-link" href="/coverage/benefits#scheduled-vs-blanket">
              Scheduled vs. Blanket
            </Link>{" "}
            explainer, or see the full breakdown for cards on the{" "}
            <Link className="inline-link" href="/coverage/trading-card-insurance">
              Trading Card Insurance
            </Link>{" "}
            page.
          </p>

          <CoverageCTA />
          <CoverageDisclaimer />
        </div>
      </section>
    </>
  );
}
