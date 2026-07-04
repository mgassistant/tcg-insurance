import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div className="foot-links">
          <Link href="/#who">Who we cover</Link>
          <Link href="/#coverage">Coverage</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#quote">Get a quote</Link>
          <a href="tel:8009330710">(800) 933-0710</a>
          <a href="mailto:support@tcg-insurance.com">support@tcg-insurance.com</a>
        </div>
        <span className="mono">© {year} TCG INSURANCE · COVERAGE MAY BE AVAILABLE SUBJECT TO ELIGIBILITY</span>
      </div>
    </footer>
  );
}
