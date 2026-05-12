import HomeClient from "./home-client";
import { getPublishedPosts } from "@/lib/blog/posts";

export default async function Page() {
  const posts = await getPublishedPosts(8);

  const latestPosts = posts.slice(0, 3).map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    coverUrl:
      p.cover_image_url ??
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
  }));

  const featured = posts.slice(0, 4).map((p: any, i: number) => ({
    title: p.title,
    badge: i === 0 ? "Premium highlight" : "Featured",
    description: p.excerpt ?? "",
    href: `/posts/${p.slug}`,
    imageUrl:
      p.cover_image_url ??
      "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80"
  }));

  return <HomeClient latestPosts={latestPosts} featured={featured} />;
}