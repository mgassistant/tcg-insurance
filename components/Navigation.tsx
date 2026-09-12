import Link from "next/link";
import Image from "next/image";
import tcgShield from "@/public/tcg-shield.png";

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link className="logo" href="/" aria-label="TCG Insurance home">
          <Image className="logo-mark" src={tcgShield} alt="" width={28} height={31} priority />
          TCG Insurance
        </Link>
        <div className="nav-links">
          <Link href="/#who">Who we cover</Link>
          <Link href="/coverage">Coverage</Link>
          <Link href="/coverage/trading-card-insurance">Trading cards</Link>
          <Link href="/coverage/vs-homeowners">vs. Homeowners</Link>
          <Link href="/blog">Resources</Link>
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
