import Link from "next/link";
import type { BlogPost } from "../types";

export const appraiseDocument: BlogPost = {
  slug: "how-to-appraise-document-card-collection",
  title: "How to Appraise & Document Your Card Collection for Insurance",
  description:
    "A practical method to value and document a trading card collection for insurance: comps, receipts, cert numbers, photos, and when a formal appraisal is required.",
  excerpt:
    "The step-by-step way to value and document your cards so limits are accurate and claims are provable — comps, receipts, cert numbers, and photos.",
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
  author: "TCG Insurance Editorial",
  keywords:
    "appraise trading card collection, document cards for insurance, card collection inventory, trading card appraisal, insurance documentation cards, cert number records",
  readMinutes: 7,
  faqs: [
    {
      q: "Do I need a professional appraisal to insure my cards?",
      a: "Usually not for the whole collection. Most programs accept your documented values for typical cards and only require a formal appraisal or recent bill of sale for individual high-value items — often those above roughly $25,000. Very large totals may trigger an underwriting review.",
    },
    {
      q: "How do I value a card for insurance?",
      a: "Use recent comparable sales for the same card in the same grade. For graded slabs, match the grading company and grade exactly, since value differs sharply between grades. Keep a dated record of the comps you used so your limits are defensible at claim time.",
    },
    {
      q: "What records should I keep for each card?",
      a: "Card name, set, and number; grading company, grade, and certification number for slabs; purchase price and date with receipts; recent comparable sales; and clear photos of the card, slab label, and cert number. A living inventory like a Poke-Trade Smart Portfolio keeps all of this in one exportable place.",
    },
  ],
  body: (
    <>
      <p className="lede">
        Insurance is only as good as your records. Whether you&apos;re setting limits for a
        new policy or proving a loss on a claim, the collector with clean documentation wins
        — and the one relying on memory and screenshots struggles. Here&apos;s a practical
        method to appraise and document a card collection for insurance.
      </p>

      <h2 id="value">Step 1: Establish current value with comps</h2>
      <p>
        Card values are set by the market, so value each item with <strong>recent
        comparable sales</strong> (&quot;comps&quot;) for the same card in the same grade.
        For graded slabs this matters enormously: a PSA 10 and a PSA 9 of the same card can
        differ by multiples, so never blend grades. Record the date and source of the comps
        you used. That dated trail is what makes your insured value <em>defensible</em> if
        you ever file a claim.
      </p>

      <h2 id="records">Step 2: Capture the right records per item</h2>
      <p>
        For every meaningful card, capture a consistent record set:
      </p>
      <ul>
        <li><strong>Identity</strong> — card name, set, and card number</li>
        <li><strong>Grading</strong> — company (PSA, BGS, CGC, SGC, CSG), grade, and certification number</li>
        <li><strong>Acquisition</strong> — purchase price and date, plus receipts or bills of sale</li>
        <li><strong>Value support</strong> — recent comps and their dates</li>
        <li><strong>Photos</strong> — the card, the slab label, and a legible shot of the cert number</li>
      </ul>
      <p>
        For sealed product, note the product, set, and condition, and photograph seals and
        any case markings. Consistency is the goal: an underwriter (and a claims adjuster)
        can move quickly through a uniform inventory.
      </p>

      <h2 id="tooling">Step 3: Keep it in a living inventory</h2>
      <p>
        Doing this in a spreadsheet works, but it goes stale the moment you buy or sell.
        This is where the <strong>Poke-Trade Smart Portfolio</strong> earns its place: it
        catalogs ownership, tracks live market value, and stores photos and cert numbers in
        one place, then lets you export a clean snapshot for your agent. That export is ideal
        both for setting accurate limits at quote time and for substantiating a claim later.
        Poke-Trade is a documentation and portfolio tool — not the insurance carrier — but it
        removes most of the tedium from the paperwork side.
      </p>

      <h2 id="appraisal">Step 4: Know when a formal appraisal is required</h2>
      <p>
        You typically don&apos;t need a professional appraisal for an entire collection.
        Programs commonly ask for a formal appraisal or a recent bill of sale (often within
        the last three years) for <strong>individual items above roughly $25,000</strong>.
        Very large totals — for instance collections over about $200,000, or over $100,000 in
        states like California and Florida — may prompt a brief underwriting review. Coins,
        stamps, and currency generally must be graded before they can be scheduled. Exact
        thresholds vary by carrier and state.
      </p>

      <h2 id="limits">Step 5: Set limits and keep them current</h2>
      <p>
        Use your documented values to decide what to <strong>schedule</strong> (grails and
        key slabs, with agreed value) versus what to cover under a <strong>blanket</strong>
        limit (bulk and mid-value cards). If you&apos;re unsure how those structures differ,
        our{" "}
        <Link className="inline-link" href="/blog/insurance-for-trading-card-collections-complete-guide">
          complete guide
        </Link>{" "}
        explains scheduled vs. blanket in depth. Then revisit your inventory at each renewal
        so limits track the market — under-scheduling leaves you exposed, and over-scheduling
        wastes premium.
      </p>

      <h2 id="next">Ready to insure it?</h2>
      <p>
        With your inventory built, you&apos;re ready to{" "}
        <Link className="inline-link" href="/coverage/trading-card-insurance">
          review trading card coverage
        </Link>{" "}
        and{" "}
        <Link className="inline-link" href="/#quote">
          request a free quote
        </Link>
        . A licensed agent will confirm eligibility and prepare a quote through specialty
        collectibles carriers.
      </p>
    </>
  ),
};
