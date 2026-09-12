/**
 * Renders a JSON-LD structured-data script.
 * Server component — safe to embed in any page/layout.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; no user-controlled HTML is injected.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
