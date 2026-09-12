import type { BlogPost } from "./types";
import { completeGuide } from "./posts/complete-guide";
import { homeownersPokemon } from "./posts/homeowners-pokemon";
import { appraiseDocument } from "./posts/appraise-document";
import { gradedSlabInsurance } from "./posts/graded-slab-insurance";

// Ordered for the index page: cornerstone first, then supporting posts.
export const POSTS: BlogPost[] = [
  completeGuide,
  homeownersPokemon,
  appraiseDocument,
  gradedSlabInsurance,
];

export function getAllPosts(): BlogPost[] {
  return POSTS;
}

export function getPostSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export type { BlogPost, FaqItem } from "./types";
