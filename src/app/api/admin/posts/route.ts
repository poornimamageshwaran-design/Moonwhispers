import { NextResponse } from "next/server";
import { adminPostSchema } from "@/lib/validators";
import { extractBearerToken } from "@/lib/supabase/token";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";
import { getUserRoleFromAccessToken } from "@/lib/supabase/adminAuth";

// ── shared auth helper ─────────────────────────────────────────────────────
async function requireAdmin(req: Request) {
  const accessToken = extractBearerToken(req.headers.get("authorization"));
  if (!accessToken) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  try {
    const role = await getUserRoleFromAccessToken(accessToken);
    if (role !== "admin") {
      console.warn("[admin/posts] Forbidden — user role:", role);
      return { error: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
    }
    return { token: accessToken };
  } catch (err) {
    console.error("[admin/posts] Auth error:", err);
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
}

// ── GET /api/admin/posts ───────────────────────────────────────────────────
// Returns ALL posts (any status). Uses service role → bypasses RLS entirely.
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,slug,excerpt,status,cover_image_url,published_at,author_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/posts] GET db error:", error);
      throw error;
    }

    console.log(`[admin/posts] GET — returned ${data?.length ?? 0} posts`);
    return NextResponse.json({ ok: true, posts: data ?? [] });
  } catch (err) {
    console.error("[admin/posts] GET unhandled:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// ── POST /api/admin/posts ──────────────────────────────────────────────────
// Creates a new post. Resolves author_id safely — upserts profile if missing.
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const json = await req.json();
    const body = adminPostSchema.parse(json);

    const supabase = createAdminSupabaseClient();

    // Resolve the user from the token
    const { data: authData, error: authErr } = await supabase.auth.getUser(auth.token!);
    if (authErr || !authData?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    // Ensure a profile row exists for this user (handles race condition
    // where the trigger hasn't run yet, or failed silently on first signup)
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, role: "admin" },
        { onConflict: "id", ignoreDuplicates: true }
      );
    if (profileErr) {
      // Non-fatal — log but continue. The insert will still work via
      // service role even if author_id FK resolution is imperfect.
      console.warn("[admin/posts] Profile upsert warning:", profileErr.message);
    }

    const { error: insertErr } = await supabase.from("posts").insert({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? null,
      content: body.content,
      cover_image_url: body.coverImageUrl ?? null,
      status: body.status ?? "draft",
      published_at: body.status === "published" ? new Date().toISOString() : null,
      author_id: userId,
    });

    if (insertErr) {
      console.error("[admin/posts] POST insert error:", insertErr);
      throw insertErr;
    }

    console.log(`[admin/posts] POST — created post slug=${body.slug}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/posts] POST unhandled:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// ── DELETE /api/admin/posts?id=<uuid> ─────────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[admin/posts] DELETE db error:", error);
      throw error;
    }

    console.log(`[admin/posts] DELETE — removed post id=${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/posts] DELETE unhandled:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// ── PATCH /api/admin/posts?id=<uuid> ──────────────────────────────────────
// Update title/content/status/etc. on an existing post.
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const json = await req.json();
    // Partial update — only pick known safe fields
    const allowed = ["title", "slug", "excerpt", "content", "cover_image_url", "status", "published_at"];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in json) patch[key] = json[key];
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 });
    }
    // Auto-set published_at when publishing
    if (patch.status === "published" && !patch.published_at) {
      patch.published_at = new Date().toISOString();
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("posts").update(patch).eq("id", id);
    if (error) {
      console.error("[admin/posts] PATCH db error:", error);
      throw error;
    }

    console.log(`[admin/posts] PATCH — updated post id=${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/posts] PATCH unhandled:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}