import type { Metadata } from "next";
import Link from "next/link";
import { ITEM_CATEGORIES } from "@/lib/intake";
import CoverageCTA, { CoverageDisclaimer } from "@/components/CoverageCTA";

export const metadata: Metadata = {
  title: "What WAX Covers (and Doesn't) — Collectibles Insurance | TCG Insurance",
  description:
    "See every collectibles category WAX can insure — trading cards, sports memorabilia, autographs, watches, jewelry, fine art, comics, coins — plus what's not eligible (iced-out jewelry, modern firearms, commercial-use items).",
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

          <h2>What WAX doesn&apos;t cover</h2>
          <p>
            WAX is a specialty <em>collectibles</em> carrier, not a general property
            policy. To set expectations before you request a quote, these are typically{" "}
            <strong>not eligible</strong>:
          </p>
          <ul>
            <li>
              <strong>Commercial-use items.</strong> Cameras or musical instruments used to
              earn more than $15,000/yr are a commercial exposure and are declined under a
              personal collectibles policy.
            </li>
            <li>
              <strong>&quot;Iced-out&quot; jewelry &amp; watches.</strong> Aftermarket
              diamonds/stones, Cuban link chains and bracelets, and custom iced-out watches
              are not accepted.
            </li>
            <li>
              <strong>Modern firearms.</strong> Firearms are eligible only if 100+ years old
              with documentation, and must be quoted under &quot;Other.&quot; Regular/modern
              firearms are treated as personal property and aren&apos;t covered.
            </li>
            <li>
              <strong>General personal property.</strong> Regularly worn clothing and shoes,
              in-use military uniforms, and non-vintage electronics or tools aren&apos;t
              covered.
            </li>
          </ul>
          <p>
            Not sure whether your piece qualifies? Start a{" "}
            <Link className="inline-link" href="/#quote">
              quote request
            </Link>{" "}
            — our form flags eligibility as you add items, and we&apos;ll follow up either
            way.
          </p>

          <h2>Grading, appraisals &amp; underwriting</h2>
          <p>
            <strong>Coins, stamps, and currency must be graded</strong> to be scheduled.
            Individual items above <strong>$25,000</strong> (watches above{" "}
            <strong>$50,000</strong>) need an appraisal or a bill of sale dated within three
            years. Larger class totals may trigger a brief underwriting review — for example
            trading cards &amp; memorabilia over <strong>$200,000</strong> (over{" "}
            <strong>$100,000 in CA &amp; FL</strong>). It&apos;s informational, not a
            rejection.
          </p>

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
