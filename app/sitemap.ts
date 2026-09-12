import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/coverage", priority: 0.9, changeFrequency: "monthly" },
    { path: "/coverage/trading-card-insurance", priority: 0.9, changeFrequency: "monthly" },
    { path: "/coverage/collectibles-memorabilia-insurance", priority: 0.8, changeFrequency: "monthly" },
    { path: "/coverage/vs-homeowners", priority: 0.8, changeFrequency: "monthly" },
    { path: "/coverage/whats-covered", priority: 0.8, changeFrequency: "monthly" },
    { path: "/coverage/benefits", priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/fraud-notice", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly",
    priority: post.cornerstone ? 0.9 : 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
