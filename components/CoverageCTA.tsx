import Link from "next/link";

export default function CoverageCTA({
  heading = "Ready to protect your collection?",
  sub = "Build your quote in a few minutes. No premium quoted online — a licensed BetterHelp Insurance agent prepares your quote through our specialty collectibles carriers.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <div className="cta-band">
      <h2>{heading}</h2>
      <p>{sub}</p>
      <div className="hero-ctas" style={{ justifyContent: "center" }}>
        <Link className="btn btn-holo btn-lg" href="/#quote">
          Request a quote
        </Link>
        <a className="btn btn-ghost btn-lg" href="tel:8009330710">
          Call (800) 933-0710
        </a>
      </div>
    </div>
  );
}

export function CoverageDisclaimer() {
  return (
    <p className="disclaimer">
      Coverage is subject to policy terms, underwriting, and carrier approval; availability and
      thresholds vary by state. Nothing on this page is a bound policy or a binding quote.
      Insurance is offered through BetterHelp Insurance, a licensed agency appointed with specialty
      collectibles carriers including WAX. Figures and limits described reflect general program
      guidelines and may change.
    </p>
  );
}
