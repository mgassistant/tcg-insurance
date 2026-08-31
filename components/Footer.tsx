import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div className="foot-links">
          <Link href="/coverage">Coverage</Link>
          <Link href="/coverage/whats-covered">What&apos;s covered</Link>
          <Link href="/coverage/trading-card-insurance">Trading card insurance</Link>
          <Link href="/coverage/collectibles-memorabilia-insurance">Memorabilia insurance</Link>
          <Link href="/coverage/vs-homeowners">vs. Homeowners</Link>
          <Link href="/coverage/benefits">Coverage benefits</Link>
          <Link href="/#quote">Get a quote</Link>
          <a href="tel:8009330710">(800) 933-0710</a>
          <a href="mailto:support@tcg-insurance.com">support@tcg-insurance.com</a>
        </div>
        <div className="foot-legal">
          <span className="mono">TCG-Insurance.com is powered by Better Help Insurance Solutions Inc. · CA License #0L73418 · National Producer Number: 20676907</span>
          <span className="mono">© {year} TCG INSURANCE · COVERAGE MAY BE AVAILABLE SUBJECT TO ELIGIBILITY</span>
        </div>
      </div>
    </footer>
  );
}
