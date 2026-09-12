import Link from "next/link";
import type { BlogPost } from "../types";

export const completeGuide: BlogPost = {
  slug: "insurance-for-trading-card-collections-complete-guide",
  title: "Insurance for Trading Card Collections: The Complete Guide",
  description:
    "How to insure a trading card collection: why homeowners underinsures cards, how a personal articles floater works, scheduled vs. blanket, and how to document your slabs.",
  excerpt:
    "A collector-first walkthrough of how card insurance actually works — floaters, scheduling, open-peril coverage, appraisals, and documenting your collection the right way.",
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
  author: "TCG Insurance Editorial",
  keywords:
    "trading card insurance, personal articles floater, card collection insurance, graded card insurance, scheduled vs blanket coverage, inland marine collectibles, how to insure pokemon cards",
  readMinutes: 12,
  cornerstone: true,
  faqs: [
    {
      q: "Do I really need separate insurance for my trading cards?",
      a: "If your collection is worth more than a few thousand dollars, almost certainly. Most homeowners and renters policies cap 'collectibles' or 'trading cards' at a low sublimit — often $1,000 to $2,500 total — and pay only actual cash value after a deductible. A personal articles floater (a type of inland marine coverage) removes that gap by insuring your cards specifically, usually with a $0 deductible and agreed or market value.",
    },
    {
      q: "What is a personal articles floater?",
      a: "A personal articles floater is a specialty policy or endorsement that 'floats' coverage with named valuables — jewelry, fine art, and collectibles like trading cards — wherever they go. For collectors it typically offers open-peril (all-risk) protection, low or no deductible, and worldwide coverage including transit, rather than the narrow named-peril terms of a homeowners policy.",
    },
    {
      q: "What is the difference between scheduled and blanket coverage?",
      a: "Scheduled coverage lists high-value items individually with an agreed value per item — ideal for grails and key graded slabs. Blanket coverage puts a single limit across an entire collection with a per-item cap, which is efficient for large lots of lower-value cards. Many collectors combine both: schedule the grails, blanket the rest.",
    },
    {
      q: "How do I prove what my cards were worth after a loss?",
      a: "Documentation. Keep purchase receipts, recent comparable sales, grading certificate numbers, and clear photos of each valuable card and its slab. A living inventory — like a Poke-Trade Smart Portfolio export — makes claims faster and helps set accurate limits at renewal. For very high-value singles, a dated appraisal or bill of sale is often required.",
    },
    {
      q: "Are graded slabs and sealed product covered?",
      a: "Yes, both can typically be covered. Graded slabs (PSA, BGS, CGC, SGC, CSG) are usually scheduled with the grading company and grade recorded, since a PSA 10 and PSA 9 of the same card are very different assets. Sealed product — booster boxes, cases, ETBs, and vintage sealed — is generally insured at market value.",
    },
    {
      q: "How much does trading card insurance cost?",
      a: "Collector premiums are often quoted as a small annual rate on insured value, commonly in the range of roughly 1% to 2% per year, though the exact figure depends on your state, total value, storage, security, and whether items are scheduled or blanketed. Store and dealer coverage is quoted differently. These are estimates only — a licensed agent confirms your rate.",
    },
  ],
  body: (
    <>
      <p className="lede">
        A serious trading card collection is a financial asset. A vintage Charizard,
        a run of graded rookies, or a wall of sealed booster boxes can represent tens
        of thousands of dollars — sometimes far more. Yet most collectors discover, only
        after a theft or a house fire, that their homeowners policy treats that asset like
        a stack of old baseball cards from a shoebox. This guide explains, in plain terms,
        how to actually insure a card collection the right way.
      </p>

      <h2 id="why-homeowners-falls-short">Why homeowners insurance underinsures your cards</h2>
      <p>
        Standard homeowners and renters policies are built for the house, the furniture,
        and everyday belongings. Collectibles — a category that usually includes trading
        cards, comics, coins, and memorabilia — are treated as a special risk and capped
        by a <strong>sublimit</strong>. A sublimit is a ceiling inside your policy that
        applies to a specific category regardless of your overall coverage amount. It is
        common to see collectibles capped somewhere around <strong>$1,000 to $2,500 in
        total</strong>, even on a policy with hundreds of thousands of dollars of dwelling
        coverage.
      </p>
      <p>
        Three problems stack on top of that low cap:
      </p>
      <ul>
        <li>
          <strong>Actual cash value, not replacement.</strong> Many policies pay
          depreciated value for personal property. Cards do not depreciate like a couch —
          they can appreciate — so a depreciation-based payout is meaningless for a
          hobby driven by market value.
        </li>
        <li>
          <strong>Named perils only.</strong> Homeowners contents coverage often responds
          only to specifically listed causes of loss. A slab that suffers accidental
          damage, or a card that vanishes in the mail, may fall outside the named perils.
        </li>
        <li>
          <strong>A deductible bites first.</strong> If your deductible is $1,000 and your
          collectibles cap is $2,500, a stolen collection nets you at most $1,500 — nowhere
          near what the cards were worth.
        </li>
      </ul>
      <p>
        We break the homeowners gap down in detail on our{" "}
        <Link className="inline-link" href="/coverage/vs-homeowners">
          Card Insurance vs. Homeowners
        </Link>{" "}
        page. The short version: homeowners is the wrong tool for a real collection.
      </p>

      <h2 id="personal-articles-floater">What a personal articles floater actually is</h2>
      <p>
        The right tool is usually a <strong>personal articles floater</strong>, a form of
        <strong> inland marine insurance</strong>. Despite the name, inland marine has
        nothing to do with boats — it is the branch of insurance historically used to cover
        valuable, portable property that moves around. A floater &quot;floats&quot; coverage
        with your named items wherever they are: at home, in a safe deposit box, at a card
        show, or in transit to a grader.
      </p>
      <p>
        Compared with a homeowners endorsement, a purpose-built collectibles floater
        typically offers:
      </p>
      <ul>
        <li>
          <strong>Open-peril (all-risk) coverage</strong> — it responds to any cause of
          loss that is not specifically excluded, rather than only a short list of named
          perils.
        </li>
        <li>
          <strong>Low or $0 deductible</strong> — so a covered loss pays from the first
          dollar.
        </li>
        <li>
          <strong>Agreed or stated value</strong> — you and the carrier set the insured
          value up front, avoiding depreciation fights at claim time.
        </li>
        <li>
          <strong>Worldwide and in-transit protection</strong> — cards stay covered when
          they travel to shows, buyers, and grading companies.
        </li>
      </ul>
      <p>
        You can read how these features map to a card collection on our{" "}
        <Link className="inline-link" href="/coverage/benefits">
          coverage benefits
        </Link>{" "}
        page and our{" "}
        <Link className="inline-link" href="/coverage/whats-covered">
          what&apos;s covered
        </Link>{" "}
        breakdown.
      </p>

      <h2 id="scheduled-vs-blanket">Scheduled vs. blanket: how to structure coverage</h2>
      <p>
        Once you move to a floater, the next decision is <em>how</em> to list your
        collection. There are two structures, and most large collections use both.
      </p>
      <h3>Scheduled coverage</h3>
      <p>
        Scheduling means listing individual items with an agreed value each. This is the
        right approach for <strong>grails and key graded slabs</strong> — the cards where
        a single loss would hurt. On many collector programs, a scheduled item can pay up
        to <strong>150% of its agreed value</strong> on a covered total loss, which cushions
        against a card appreciating between renewals. Scheduling also records the grading
        company and grade, so a PSA 10 is insured as a PSA 10.
      </p>
      <h3>Blanket coverage</h3>
      <p>
        Blanket coverage assigns one limit across a whole group of items — great for large
        lots of raw singles, bulk, and mid-value cards where itemizing every card is
        impractical. Blanket coverage usually carries a <strong>per-item limit</strong>
        (commonly around $50,000 on collector programs) and may involve manual underwriting
        above certain totals.
      </p>
      <p>
        The practical answer for most collectors: <strong>schedule the grails, blanket the
        rest.</strong> Our{" "}
        <Link className="inline-link" href="/coverage/trading-card-insurance">
          trading card insurance
        </Link>{" "}
        page walks through how this looks for graded and sealed collections specifically.
      </p>

      <h2 id="whats-covered">What&apos;s actually covered</h2>
      <p>
        A collectibles floater built for the hobby can cover the full range of what
        collectors own:
      </p>
      <ul>
        <li>
          <strong>Graded slabs</strong> — PSA, BGS, CGC, SGC, and CSG cards, scheduled with
          cert number, grader, and grade.
        </li>
        <li>
          <strong>Raw singles</strong> — vintage and modern, from commons to grails.
        </li>
        <li>
          <strong>Sealed product</strong> — booster boxes, cases, ETBs, and vintage sealed
          at market value.
        </li>
        <li>
          <strong>Memorabilia</strong> — signed items, game-used pieces, and related
          collectibles. See our{" "}
          <Link className="inline-link" href="/coverage/collectibles-memorabilia-insurance">
            memorabilia insurance
          </Link>{" "}
          page.
        </li>
        <li>
          <strong>Store and dealer inventory</strong> — retail stock, event stock, and
          shipments, which are underwritten differently from personal collections.
        </li>
      </ul>
      <p>
        Coverage typically extends to theft, fire, flood, accidental damage, and loss in
        transit — the risks that actually threaten cardboard — rather than the narrow list
        a homeowners policy provides.
      </p>

      <h2 id="documenting-your-collection">How to document your collection for insurance</h2>
      <p>
        Documentation is the single most important thing a collector can do, and it is the
        step most people skip. Good records do two jobs: they help you and the carrier set
        <strong> accurate limits</strong>, and they make a claim <strong>fast and
        provable</strong> if the worst happens. Aim to capture, for each meaningful item:
      </p>
      <ul>
        <li>Card name, set, and number</li>
        <li>Grading company, grade, and certification number for slabs</li>
        <li>Purchase price and date, plus any receipts or bills of sale</li>
        <li>Recent comparable sales to support current market value</li>
        <li>Clear photos of the card, the slab label, and the cert number</li>
      </ul>
      <p>
        Rebuilding this by hand across hundreds of cards is painful, which is exactly why
        we point collectors to the <strong>Poke-Trade Smart Portfolio</strong>. As a
        partner tool, Poke-Trade lets you catalog ownership, track live market value, and
        store photos and cert numbers in one place — then export a clean snapshot you can
        hand to an agent when you request a quote or file a claim. To be clear, Poke-Trade
        is a documentation and portfolio tool, <em>not</em> the insurance carrier; it makes
        the paperwork side of insuring a collection dramatically easier.
      </p>
      <p>
        For a step-by-step method, see{" "}
        <Link className="inline-link" href="/blog/how-to-appraise-document-card-collection">
          How to Appraise &amp; Document Your Card Collection for Insurance
        </Link>
        .
      </p>

      <h2 id="appraisals">When you need an appraisal</h2>
      <p>
        Most cards do not require a formal appraisal. Programs commonly ask for an appraisal
        or a recent bill of sale (often dated within the last three years) for{" "}
        <strong>individual items above roughly $25,000</strong>. Very large totals can
        trigger a brief underwriting review — for example collections over about $200,000
        (or over $100,000 in states like California and Florida). Coins, stamps, and
        currency generally must be graded before they can be scheduled. The exact thresholds
        vary by carrier and state, and a good intake form flags them for you as you build
        your list.
      </p>

      <h2 id="cost-factors">What drives the cost</h2>
      <p>
        Collector premiums are usually a small annual percentage of insured value — often in
        the neighborhood of <strong>1% to 2% per year</strong>, though your number depends on
        several factors:
      </p>
      <ul>
        <li><strong>Total insured value</strong> and how it is split between scheduled and blanket</li>
        <li><strong>Where and how you store cards</strong> — home safe, vault, safe deposit box, or store</li>
        <li><strong>Security measures</strong> such as alarms and fire protection</li>
        <li><strong>Your state</strong>, which affects both pricing and available forms</li>
        <li><strong>Loss history</strong> and how often items travel</li>
      </ul>
      <p>
        These are general estimates, not a quote — pricing and availability vary, and no
        premium is quoted online. A licensed agent confirms your rate after reviewing your
        collection.
      </p>

      <h2 id="how-to-get-coverage">How to get covered</h2>
      <p>
        Getting insured is straightforward once your records are in order:
      </p>
      <ol>
        <li>
          <strong>Build your inventory.</strong> Catalog your collection and pull current
          values — a Poke-Trade Smart Portfolio export is a clean starting point.
        </li>
        <li>
          <strong>Decide what to schedule.</strong> Identify grails and key slabs to
          schedule; the rest can typically go under a blanket limit.
        </li>
        <li>
          <strong>Request a quote.</strong> Share your details and item list. A licensed
          agent confirms eligibility and prepares a quote through specialty collectibles
          carriers.
        </li>
        <li>
          <strong>Bind and keep records current.</strong> Once covered, update your
          inventory as you buy, sell, and grade so your limits stay accurate at renewal.
        </li>
      </ol>
      <p>
        When you&apos;re ready,{" "}
        <Link className="inline-link" href="/#quote">
          request a free quote
        </Link>{" "}
        — it takes a few minutes, and there&apos;s no obligation.
      </p>
    </>
  ),
};
