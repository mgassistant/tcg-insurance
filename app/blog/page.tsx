import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { absUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import CoverageCTA from "@/components/CoverageCTA";

const TITLE = "Card Insurance Resources & Guides | TCG Insurance";
const DESCRIPTION =
  "Guides on insuring trading card collections: personal articles floaters, graded slab coverage, documenting your cards, and why homeowners falls short.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absUrl("/blog") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absUrl("/blog"),
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const cornerstone = posts.find((p) => p.cornerstone);
  const rest = posts.filter((p) => !p.cornerstone);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/blog" },
        ])}
      />
      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <span className="eyebrow">
            <span className="dot" />
            Resources
          </span>
          <h1>
            <span className="holo-text">Collector insurance</span> guides
          </h1>
          <p className="lede">
            Plain-English guides to insuring a trading card collection the right way —
            floaters, graded slabs, documentation, and how to avoid the homeowners trap.
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          {cornerstone && (
            <Link className="blog-feature" href={`/blog/${cornerstone.slug}`}>
              <span className="kicker">Start here · Complete guide</span>
              <h2>{cornerstone.title}</h2>
              <p>{cornerstone.excerpt}</p>
              <span className="blog-meta">
                {cornerstone.readMinutes} min read · Updated{" "}
                {new Date(cornerstone.dateModified).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </Link>
          )}

          <div className="blog-grid">
            {rest.map((post) => (
              <Link key={post.slug} className="blog-card" href={`/blog/${post.slug}`}>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="blog-meta">{post.readMinutes} min read</span>
              </Link>
            ))}
          </div>

          <div style={{ maxWidth: 780, margin: "8px auto 0" }}>
            <CoverageCTA
              heading="Ready to protect your collection?"
              sub="Build your quote in a few minutes. A licensed agent prepares your quote through specialty collectibles carriers — no premium quoted online."
            />
          </div>
        </div>
      </section>
    </>
  );
}
