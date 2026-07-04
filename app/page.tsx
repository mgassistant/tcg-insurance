import Link from "next/link";
import Slab from "@/components/Slab";
import Faq from "@/components/Faq";
import QuoteForm from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className="hero" id="top">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap hero-in">
          <div>
            <span className="eyebrow">
              <span className="dot" />
              TCG Collection Insurance
            </span>
            <h1>
              Your collection is an asset.
              <br />
              <span className="holo-text">Insure it like one.</span>
            </h1>
            <p className="lede">
              Specialized coverage for graded slabs, sealed product, vintage singles, and
              store inventory — written by people who know the difference between a PSA 9
              and a PSA 10.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-holo btn-lg" href="#quote">
                Get a free quote
              </Link>
              <a className="btn btn-ghost btn-lg" href="tel:8009330710">
                Call (800) 933-0710
              </a>
            </div>
            <div className="hero-proof">
              <div className="proof">
                <div className="num">$48M+</div>
                <div className="lbl">in collections protected</div>
              </div>
              <div className="proof">
                <div className="num">4,200+</div>
                <div className="lbl">collectors &amp; stores insured</div>
              </div>
              <div className="proof">
                <div className="num">9 days</div>
                <div className="lbl">average claim payout</div>
              </div>
            </div>
          </div>
          <Slab />
        </div>
      </header>

      {/* ---------- Marquee strip ---------- */}
      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          <span>
            Graded slabs <i>◆</i> Sealed boxes <i>◆</i> Vintage singles <i>◆</i> Store
            inventory <i>◆</i> Tournament stock <i>◆</i> Convention booths <i>◆</i> Grading
            submissions <i>◆</i> In-transit shipments <i>◆</i>
          </span>
          <span>
            Graded slabs <i>◆</i> Sealed boxes <i>◆</i> Vintage singles <i>◆</i> Store
            inventory <i>◆</i> Tournament stock <i>◆</i> Convention booths <i>◆</i> Grading
            submissions <i>◆</i> In-transit shipments <i>◆</i>
          </span>
        </div>
      </div>

      {/* ---------- Who we cover ---------- */}
      <section className="section" id="who">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Who we cover</span>
            <h2>From binder collectors to breakout businesses</h2>
            <p>
              Homeowner&apos;s policies cap collectibles at a few thousand dollars and
              rarely understand graded cards. We build coverage around how the hobby
              actually works.
            </p>
          </div>
          <div className="tiers">
            <div className="tier">
              <span className="rarity r-collector">Collector</span>
              <h3>Personal collections</h3>
              <p>
                Grails, vintage singles, sealed vaults, and graded slabs kept at home or in
                a vault.
              </p>
              <ul>
                <li>Graded &amp; raw singles</li>
                <li>Sealed &amp; vintage product</li>
                <li>Theft, fire, flood &amp; damage</li>
                <li>Coverage while traveling to shows</li>
              </ul>
              <div className="from">
                Coverage may be available <b>from $12/mo</b>
              </div>
            </div>
            <div className="tier">
              <span className="rarity r-store">Game store</span>
              <h3>Brick-and-mortar shops</h3>
              <p>
                Store inventory, event stock, display cases, and the singles behind the
                counter.
              </p>
              <ul>
                <li>Retail &amp; singles inventory</li>
                <li>Event &amp; tournament stock</li>
                <li>Break &amp; display coverage</li>
                <li>Business interruption options</li>
              </ul>
              <div className="from">
                Coverage may be available <b>from $89/mo</b>
              </div>
            </div>
            <div className="tier">
              <span className="rarity r-dealer">Dealer</span>
              <h3>Dealers &amp; breakers</h3>
              <p>
                High-value inventory that moves — conventions, online sales, and
                in-transit shipments.
              </p>
              <ul>
                <li>Convention &amp; booth coverage</li>
                <li>In-transit &amp; mail shipments</li>
                <li>Grading submission protection</li>
                <li>High-limit scheduled items</li>
              </ul>
              <div className="from">
                Coverage may be available <b>custom-quoted</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Coverage grid ---------- */}
      <section className="section" id="coverage">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">What&apos;s covered</span>
            <h2>Protection that speaks the hobby</h2>
            <p>
              Coverage may be available across the risks that actually threaten a
              collection — not the generic list a standard policy gives you.
            </p>
          </div>
          <div className="cov-grid">
            <div className="cov-cell">
              <span className="ic">🔒</span>
              <h3>Theft &amp; burglary</h3>
              <p>Protection if cards are stolen from your home, vehicle, store, or booth.</p>
            </div>
            <div className="cov-cell">
              <span className="ic">🔥</span>
              <h3>Fire, flood &amp; damage</h3>
              <p>Coverage for accidental physical loss and disasters that wreck cardboard.</p>
            </div>
            <div className="cov-cell">
              <span className="ic">✈️</span>
              <h3>In-transit shipments</h3>
              <p>Cards protected while shipped to buyers, shows, or graders.</p>
            </div>
            <div className="cov-cell">
              <span className="ic">🏷️</span>
              <h3>Grading submissions</h3>
              <p>Coverage while your cards are out for grading and authentication.</p>
            </div>
            <div className="cov-cell">
              <span className="ic">📦</span>
              <h3>Sealed product</h3>
              <p>Booster boxes, cases, and vintage sealed insured at market value.</p>
            </div>
            <div className="cov-cell">
              <span className="ic">💎</span>
              <h3>Scheduled grails</h3>
              <p>High-value individual cards scheduled with agreed-value protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">How it works</span>
            <h2>Covered in three steps</h2>
            <p>No jargon, no runaround. Tell us about your collection and we do the rest.</p>
          </div>
          <div className="steps">
            <div className="step">
              <span className="n">STEP 01</span>
              <h3>Tell us what you&apos;ve got</h3>
              <p>
                Share your collection type and rough value. Takes about two minutes — no
                card-by-card list needed to start.
              </p>
            </div>
            <div className="step">
              <span className="n">STEP 02</span>
              <h3>Review your quote</h3>
              <p>
                A licensed agent confirms eligibility and walks you through the coverage
                that may be available and what it costs.
              </p>
            </div>
            <div className="step">
              <span className="n">STEP 03</span>
              <h3>Get covered</h3>
              <p>
                Bind your policy and your collection is protected — at home, in transit, at
                the show, and while grading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Quote form ---------- */}
      <section className="quote-section" id="quote">
        <div className="wrap">
          <div className="quote-shell">
            <div className="quote-side">
              <h2>Get a free quote</h2>
              <p>
                Tell us about your collection and a licensed agent will follow up with the
                coverage that may be available for you.
              </p>
              <div className="assure">
                <div>
                  <span className="i">✓</span>
                  <span>
                    <b>No obligation.</b> A quote is just a quote — no pressure to buy.
                  </span>
                </div>
                <div>
                  <span className="i">✓</span>
                  <span>
                    <b>Hobby-literate agents.</b> People who actually know grading and
                    sealed product.
                  </span>
                </div>
                <div>
                  <span className="i">✓</span>
                  <span>
                    <b>Fast follow-up.</b> Most quotes get a response the same business day.
                  </span>
                </div>
              </div>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="sec-head" style={{ margin: "0 auto 52px", textAlign: "center" }}>
            <span className="kicker">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="final">
        <h2>Your grails deserve real coverage.</h2>
        <p>Get a free quote in minutes and see what may be available for your collection.</p>
        <div className="hero-ctas">
          <Link className="btn btn-holo btn-lg" href="#quote">
            Get a free quote
          </Link>
          <a className="btn btn-ghost btn-lg" href="tel:8009330710">
            Call (800) 933-0710
          </a>
        </div>
      </section>

      {/* ---------- Sticky mobile CTA ---------- */}
      <div className="sticky-cta">
        <Link className="btn btn-holo" href="#quote">
          Get a free quote
        </Link>
      </div>
    </>
  );
}
