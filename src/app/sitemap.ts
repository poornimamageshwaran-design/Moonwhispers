import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Keep sitemap lean; blog slugs will be added via your CMS tooling later.
  return [
    { url: `${siteUrl}/`, lastModified: new Date() },
    { url: `${siteUrl}/posts`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() }
  ];
}

