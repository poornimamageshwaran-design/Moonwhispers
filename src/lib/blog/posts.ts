import { createPublicSupabaseClient } from "@/lib/supabase/publicClient";
import { createClient } from "@supabase/supabase-js";

export type PublishedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  content: string | null;
};

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedPosts(limit = 12) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,slug,excerpt,cover_image_url,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Array<PublishedPost>;
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PublishedPost | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,slug,excerpt,cover_image_url,published_at,content")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as PublishedPost | null) ?? null;
  } catch {
    return null;
  }
}