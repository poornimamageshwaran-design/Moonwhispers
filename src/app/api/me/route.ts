import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/supabase/token";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";

export async function GET(req: Request) {
  try {
    const accessToken = extractBearerToken(req.headers.get("authorization"));
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken);
    if (authErr || !authData?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", userId)
      .maybeSingle();
    if (profileErr) throw profileErr;

    return NextResponse.json({
      ok: true,
      user: {
        id: userId,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? "user"
      }
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

