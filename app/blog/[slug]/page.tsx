import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, getAllPosts } from "@/lib/blog";
import { absUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import {
  articleSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { CoverageDisclaimer } from "@/components/CoverageCTA";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = absUrl(`/blog/${post.slug}`);
  return {
    title: `${post.title} | TCG Insurance`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const schemas: Record<string, unknown>[] = [
    articleSchema(post),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];
  if (post.faqs && post.faqs.length) schemas.push(faqSchema(post.faqs));

  const dateLabel = new Date(post.dateModified).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <JsonLd data={schemas} />

      <header className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="eyebrow">
            <span className="dot" />
            <Link href="/blog" style={{ color: "inherit" }}>
              Resources
            </Link>
          </span>
          <h1>{post.title}</h1>
          <p className="blog-meta">
            {post.readMinutes} min read · Updated {dateLabel}
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 16 }}>
        <article className="wrap prose">
          {post.body}

          {post.faqs && post.faqs.length > 0 && (
            <>
              <h2 id="faq">Frequently asked questions</h2>
              <div className="blog-faq">
                {post.faqs.map((f, i) => (
                  <div className="blog-faq-item" key={i}>
                    <h3>{f.q}</h3>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="cta-band">
            <h2>Insure your collection like the asset it is</h2>
            <p>
              Build your quote in a few minutes. A licensed agent confirms eligibility and
              prepares coverage through specialty collectibles carriers — no premium quoted
              online.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center" }}>
              <Link className="btn btn-holo btn-lg" href="/#quote">
                Get a free quote
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/coverage/trading-card-insurance">
                Explore card coverage
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="blog-related">
              <h2>Keep reading</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link className="inline-link" href={`/blog/${r.slug}`}>
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CoverageDisclaimer />
        </article>
      </section>
    </>
  );
}
