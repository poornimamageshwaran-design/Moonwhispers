import { getPublishedPosts } from "@/lib/blog/posts";
import PostsClient from "./posts-client";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await getPublishedPosts(12);
  return <PostsClient posts={posts} />;
}

