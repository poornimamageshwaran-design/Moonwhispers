import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/supabase/token";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";
import { getUserRoleFromAccessToken } from "@/lib/supabase/adminAuth";

async function requireAdmin(req: Request) {
  const accessToken = extractBearerToken(req.headers.get("authorization"));
  if (!accessToken) return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  try {
    const role = await getUserRoleFromAccessToken(accessToken);
    if (role !== "admin") return { error: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
    return { token: accessToken };
  } catch {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
}

// GET — all messages with email (admin only)
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, messages: data ?? [] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE ?id=<uuid>
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}