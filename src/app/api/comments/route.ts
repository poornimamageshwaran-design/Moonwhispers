import { NextResponse } from "next/server";
import { commentSchema } from "@/lib/validators";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";
import { extractBearerToken } from "@/lib/supabase/token";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ ok: false, error: "Missing postId" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("id,status")
      .eq("id", postId)
      .maybeSingle();
    if (postErr) throw postErr;
    if (!post || post.status !== "published") {
      return NextResponse.json({ ok: true, comments: [] });
    }

    const { data: comments, error: commentsErr } = await supabase
      .from("comments")
      .select("id, content, created_at, author_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (commentsErr) throw commentsErr;

    const authorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id).filter(Boolean)));

    const { data: profiles } = authorIds.length
      ? await supabase.from("profiles").select("id, display_name").in("id", authorIds)
      : { data: [] as Array<{ id: string; display_name: string | null }> };

    const profileMap = new Map<string, string | null>((profiles ?? []).map((p) => [p.id, p.display_name]));

    const enriched = (comments ?? []).map((c) => ({
      ...c,
      display_name: profileMap.get(c.author_id) ?? null
    }));

    return NextResponse.json({ ok: true, comments: enriched });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = extractBearerToken(authHeader);
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = commentSchema.parse(json);

    const supabase = createAdminSupabaseClient();

    const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken);
    if (authErr || !authData?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("id,status")
      .eq("id", body.postId)
      .maybeSingle();
    if (postErr) throw postErr;
    if (!post || post.status !== "published") {
      return NextResponse.json({ ok: false, error: "Post not commentable" }, { status: 400 });
    }

    const { error: insertErr } = await supabase.from("comments").insert({
      post_id: body.postId,
      author_id: userId,
      content: body.content
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}


export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = extractBearerToken(authHeader);
    if (!accessToken) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const supabase = createAdminSupabaseClient();
    const { data: authData } = await supabase.auth.getUser(accessToken);
    if (!authData?.user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    // Allow delete if admin OR the comment's own author
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
    const { data: comment } = await supabase.from("comments").select("author_id").eq("id", id).single();

    if (profile?.role !== "admin" && comment?.author_id !== authData.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}