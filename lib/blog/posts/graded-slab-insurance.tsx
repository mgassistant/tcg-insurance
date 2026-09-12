import Link from "next/link";
import type { BlogPost } from "../types";

export const gradedSlabInsurance: BlogPost = {
  slug: "graded-slab-insurance-psa-bgs-cgc-explained",
  title: "Graded Slab Insurance: PSA / BGS / CGC Coverage Explained",
  description:
    "How to insure graded cards: scheduling slabs by grade and cert number, agreed value, coverage during grading and transit, and what happens if a slab is damaged.",
  excerpt:
    "Graded slabs are premium assets and need premium coverage. Here's how scheduling, agreed value, and transit protection work for PSA, BGS, and CGC cards.",
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
  author: "TCG Insurance Editorial",
  keywords:
    "graded card insurance, psa card insurance, bgs insurance, cgc card insurance, slab insurance, graded slab coverage, insure graded pokemon cards",
  readMinutes: 6,
  faqs: [
    {
      q: "How are graded slabs insured differently from raw cards?",
      a: "High-value graded slabs are usually scheduled individually with an agreed value, and the grading company, grade, and certification number are recorded. That precision matters because a PSA 10 and a PSA 9 of the same card are very different assets, so they must be insured at different values.",
    },
    {
      q: "Does slab insurance cover PSA, BGS, and CGC equally?",
      a: "Yes — coverage is generally available across major grading companies including PSA, BGS, CGC, SGC, and CSG. What is scheduled is the specific slab and its recorded grade, not a preference for one grader over another.",
    },
    {
      q: "Am I covered while my cards are out for grading?",
      a: "In-transit and grading-submission coverage may be available, so cards can be protected while they travel to and from a grading company. Terms are confirmed when your quote is prepared, and cards are typically covered worldwide with a $0 deductible.",
    },
    {
      q: "What if a slab cracks or is damaged?",
      a: "Open-peril collectibles coverage generally responds to accidental physical damage, not just theft and fire. For a scheduled slab, a covered loss is settled against the agreed value. Keep photos and the cert number on file so the specific card and grade are easy to substantiate.",
    },
  ],
  body: (
    <>
      <p className="lede">
        Getting a card graded turns a fragile piece of cardboard into a documented,
        market-tracked asset — and often multiplies its value. That&apos;s exactly why
        graded slabs deserve coverage built for them, not a generic line item on a
        homeowners policy.
      </p>

      <h2 id="why-slabs">Why slabs need dedicated coverage</h2>
      <p>
        A graded slab&apos;s value is precise and public. The grading company, the grade,
        and the certification number together define a specific asset with a traceable
        market. A PSA 10 might sell for several times the price of a PSA 9 of the same card.
        Insurance has to respect that precision — which a homeowners collectibles sublimit
        (often capped around $1,000 to $2,500 total) simply cannot. For the full comparison,
        see{" "}
        <Link className="inline-link" href="/coverage/vs-homeowners">
          Card Insurance vs. Homeowners
        </Link>
        .
      </p>

      <h2 id="scheduling">Scheduling a slab by grade and cert</h2>
      <p>
        High-value slabs are typically <strong>scheduled</strong> — listed individually with
        an <strong>agreed value</strong>, and with the grading company, grade, and cert
        number recorded. Scheduling does three things well:
      </p>
      <ul>
        <li>It insures the exact asset — a PSA 10 is covered as a PSA 10.</li>
        <li>
          It settles a covered total loss against the agreed value, with many collector
          programs paying up to <strong>150%</strong> to cushion appreciation between
          renewals.
        </li>
        <li>It creates a clean paper trail that makes a claim fast to substantiate.</li>
      </ul>
      <p>
        Lower-value slabs and raw cards can go under a <strong>blanket</strong> limit
        instead. Most collectors schedule the grails and blanket the rest — our{" "}
        <Link className="inline-link" href="/blog/insurance-for-trading-card-collections-complete-guide">
          complete guide
        </Link>{" "}
        breaks down scheduled vs. blanket in depth.
      </p>

      <h2 id="graders">PSA, BGS, CGC, SGC, CSG — all covered</h2>
      <p>
        Coverage isn&apos;t tied to a single grader. Slabs from <strong>PSA, BGS, CGC, SGC,
        and CSG</strong> can generally all be scheduled; what matters is the recorded grade
        and cert number, not which company&apos;s label is on the case. See our{" "}
        <Link className="inline-link" href="/coverage/trading-card-insurance">
          trading card insurance
        </Link>{" "}
        page for specifics.
      </p>

      <h2 id="transit">Coverage during grading and transit</h2>
      <p>
        Cards are most exposed when they move — and slabs move a lot: to shows, to buyers,
        and out for crossovers or regrades. Collectibles coverage typically follows your
        cards <strong>worldwide and in transit</strong>, including grading submissions, with
        a <strong>$0 deductible</strong>. That closes one of the biggest gaps left by a
        homeowners policy, which may not cover a card lost in the mail at all.
      </p>

      <h2 id="damage">What happens if a slab is damaged</h2>
      <p>
        Open-peril (all-risk) coverage responds to accidental physical damage, not just
        theft and fire — so a cracked case or a damaged card from a covered cause can be
        claimed. For a scheduled slab, settlement is measured against the agreed value.
        Keeping photos and the cert number on file (ideally in a{" "}
        <strong>Poke-Trade Smart Portfolio</strong>, which stores exactly this) makes proving
        the specific card and grade straightforward. Poke-Trade is the documentation tool,
        not the carrier.
      </p>

      <h2 id="next">Get your slabs scheduled</h2>
      <p>
        Pull your slab list together — grader, grade, cert number, and current comps — then{" "}
        <Link className="inline-link" href="/#quote">
          request a free quote
        </Link>
        . A licensed agent confirms eligibility and prepares coverage through specialty
        collectibles carriers. Also worth reading:{" "}
        <Link className="inline-link" href="/blog/how-to-appraise-document-card-collection">
          How to Appraise &amp; Document Your Card Collection
        </Link>
        .
      </p>
    </>
  ),
};
