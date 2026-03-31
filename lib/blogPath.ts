/**
 * Build a safe path segment for blog post URLs (supports Unicode slugs from Contentful).
 * Always use this instead of template `/blog/${slug}` so accents and spaces encode correctly.
 */
export function blogPostHref(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}
