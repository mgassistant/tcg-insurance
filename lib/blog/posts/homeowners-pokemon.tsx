import Link from "next/link";
import type { BlogPost } from "../types";

export const homeownersPokemon: BlogPost = {
  slug: "does-homeowners-insurance-cover-pokemon-cards",
  title: "Does Homeowners Insurance Cover Pokémon Cards?",
  description:
    "Short answer: barely. Learn why homeowners policies cap Pokémon and trading card coverage with sublimits, and what a personal articles floater does instead.",
  excerpt:
    "Homeowners technically 'covers' your Pokémon cards — but a low collectibles sublimit and depreciated payouts mean a real collection is badly underinsured.",
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
  author: "TCG Insurance Editorial",
  keywords:
    "does homeowners insurance cover pokemon cards, homeowners trading card sublimit, pokemon card insurance, collectibles coverage limit, renters insurance trading cards",
  readMinutes: 6,
  faqs: [
    {
      q: "Does homeowners insurance cover Pokémon cards at all?",
      a: "Technically yes, but usually only up to a low collectibles sublimit — often around $1,000 to $2,500 total — and frequently at depreciated actual cash value after a deductible. For a valuable Pokémon collection that is nowhere near enough.",
    },
    {
      q: "Will my homeowners policy pay market value for a rare card?",
      a: "Generally no. Contents coverage often pays actual cash value rather than current market value, which is the opposite of how cards behave since desirable cards can appreciate. A personal articles floater with agreed or stated value is designed for this.",
    },
    {
      q: "What should I use instead of homeowners for cards?",
      a: "A personal articles floater (a type of inland marine coverage) built for collectibles. It typically offers open-peril protection, a low or $0 deductible, agreed value, and worldwide plus in-transit coverage — none of which a standard homeowners endorsement reliably provides.",
    },
  ],
  body: (
    <>
      <p className="lede">
        It&apos;s the question every Pokémon collector eventually asks after their
        collection crosses a few thousand dollars: <em>am I already covered by my
        homeowners policy?</em> The honest answer is &quot;a little, and not in the way
        you think.&quot;
      </p>

      <h2 id="the-sublimit-problem">Yes — but only up to a tiny sublimit</h2>
      <p>
        Most homeowners and renters policies do include trading cards under their
        &quot;collectibles&quot; category. The catch is the <strong>sublimit</strong>: a
        cap that applies to that category no matter how large your overall policy is. It is
        common to see collectibles capped somewhere around <strong>$1,000 to $2,500
        total</strong>. If you own a single graded Base Set Charizard, you may have already
        blown through that limit with one card.
      </p>

      <h2 id="depreciation">The payout is worse than the cap</h2>
      <p>
        Even within that cap, homeowners contents coverage often pays <strong>actual cash
        value</strong> — a depreciated figure — rather than current market value. Pokémon
        cards don&apos;t work like a used TV; desirable cards can go <em>up</em>. A
        depreciation-based payout is fundamentally mismatched to a hobby priced by live
        market comps. Then a deductible comes off the top, shrinking the check further.
      </p>

      <h2 id="named-perils">Named perils leave gaps</h2>
      <p>
        Homeowners contents coverage typically responds only to specifically listed causes
        of loss. Accidental damage to a slab, or a card lost in the mail on its way to a
        buyer, can fall outside those named perils entirely. For cards — small, portable,
        and often in transit — that is a serious blind spot. We cover the full comparison on
        our{" "}
        <Link className="inline-link" href="/coverage/vs-homeowners">
          Card Insurance vs. Homeowners
        </Link>{" "}
        page.
      </p>

      <h2 id="the-fix">The fix: a personal articles floater</h2>
      <p>
        The purpose-built solution is a <strong>personal articles floater</strong> (a form
        of inland marine coverage) written for collectibles. It generally offers open-peril
        (all-risk) protection, a low or <strong>$0 deductible</strong>, agreed value so
        there are no depreciation fights, and worldwide plus in-transit coverage. You can
        schedule your grails individually and blanket the rest of the collection. Our{" "}
        <Link className="inline-link" href="/blog/insurance-for-trading-card-collections-complete-guide">
          complete guide to insuring a card collection
        </Link>{" "}
        walks through exactly how that works.
      </p>

      <h2 id="next-step">What to do next</h2>
      <p>
        Start by documenting what you own — set, grade, cert numbers, and photos. A{" "}
        <strong>Poke-Trade Smart Portfolio</strong> makes this easy and gives you a clean
        export to share with an agent (Poke-Trade is the documentation tool, not the
        carrier). Then{" "}
        <Link className="inline-link" href="/coverage/trading-card-insurance">
          explore trading card coverage
        </Link>{" "}
        and{" "}
        <Link className="inline-link" href="/#quote">
          request a free quote
        </Link>
        . It takes a few minutes and there&apos;s no obligation.
      </p>
    </>
  ),
};
