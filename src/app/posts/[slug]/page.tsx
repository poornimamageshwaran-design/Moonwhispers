import type { Metadata } from "next";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import CommentsClient from "./comments-client";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined
    }
  };
}

// Simple inline markdown → HTML (no extra npm package needed)
function renderContent(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-serif italic text-[#f0e6c8] mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="text-2xl font-serif italic text-[#f0e6c8] mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="text-3xl font-serif italic text-[#f0e6c8] mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#d0e8f8] font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em class="text-[#a0c8ff] italic">$1</em>')
    .replace(/`(.+?)`/g,       '<code class="bg-[#1a2a3a]/60 text-[#7ec8ff] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm,     '<blockquote class="border-l-2 border-[#5a9fff]/40 pl-4 italic text-[#6a8aaa] my-4">$1</blockquote>')
    .replace(/^- (.+)$/gm,     '<li class="text-[#8a9aaa] ml-4 list-disc">$1</li>')
    .replace(/\n\n/g,          '</p><p class="text-[#8a9aaa] leading-relaxed mt-4">')
    .replace(/\n/g,            '<br/>');
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return (
      <div className="relative pt-24 pb-20 min-h-screen">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#2255cc]/5 blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center pt-20">
          <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3">Moon Whispers</p>
          <h1 className="font-serif italic text-4xl font-light text-[#f0e6c8] mb-4">Post not found</h1>
          <p className="text-sm font-sans font-light text-[#6a8aaa] mb-8">This note may have been unpublished or removed.</p>
          <a href="/posts" className="rounded-xl bg-[#2255cc] px-6 py-3 text-sm font-sans font-semibold text-white hover:bg-[#3366dd] transition-all duration-300">
            Browse all notes →
          </a>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="relative pt-24 pb-20 min-h-screen">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#2255cc]/4 blur-[130px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7ec8ff]/3 blur-[110px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden mb-10 border border-[#1a2a3a]/60 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/90 via-[#080c14]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-flex items-center rounded-full border border-[#5a9fff]/30 bg-[#2255cc]/20 px-3 py-1 text-xs font-sans text-[#7ec8ff] mb-3">
                Moon Whispers
              </span>
              <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#f0e6c8] leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-3 text-[#8a9aaa] font-sans font-light max-w-2xl leading-relaxed">{post.excerpt}</p>
              )}
            </div>
          </div>
        )}

        {/* Title (no cover image) */}
        {!post.cover_image_url && (
          <div className="mb-10">
            <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3">Moon Whispers</p>
            <h1 className="font-serif italic text-4xl sm:text-5xl font-light tracking-tight text-[#f0e6c8] leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-[#6a8aaa] font-sans font-light text-lg max-w-2xl leading-relaxed">{post.excerpt}</p>
            )}
          </div>
        )}

        {/* Meta bar */}
        {publishedDate && (
          <div className="flex items-center gap-3 mb-8 text-xs font-sans text-[#2a3a4a]">
            <span>{publishedDate}</span>
            <span className="w-1 h-1 rounded-full bg-[#2a3a4a]" />
            <span className="text-[#5a9fff]/60">Published</span>
          </div>
        )}

        {/* Article content */}
        <article className="rounded-3xl border border-[#1a2a3a]/60 bg-[#0a0e1a]/50 p-6 sm:p-10 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.4)] mb-10">
          <div
            className="text-[#8a9aaa] font-sans font-light leading-relaxed text-base"
            dangerouslySetInnerHTML={{
              __html: `<p class="text-[#8a9aaa] leading-relaxed">${renderContent(post.content ?? "No content available.")}</p>`
            }}
          />
        </article>

        {/* Back link */}
        <div className="mb-10">
          <a href="/posts" className="text-xs font-sans text-[#3a5a7a] hover:text-[#7ec8ff] transition-colors">
            ← Back to all notes
          </a>
        </div>

        {/* Comments */}
        <CommentsClient postId={post.id} />
      </div>
    </div>
  );
}