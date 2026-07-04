import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link className="logo" href="/" aria-label="TCG Insurance home">
          <span className="logo-mark" aria-hidden="true" />
          TCG Insurance
        </Link>
        <div className="nav-links">
          <Link href="/#who">Who we cover</Link>
          <Link href="/#coverage">Coverage</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <div className="nav-cta">
          <span className="nav-phone">
            Talk to an agent · <strong>(800) 933-0710</strong>
          </span>
          <Link className="btn btn-holo btn-sm" href="/#quote">
            Get a quote
          </Link>
        </div>
      </div>
    </nav>
  );
}
