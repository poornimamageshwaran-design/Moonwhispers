import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/supabase/token";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = extractBearerToken(authHeader);
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

    const { data: authData, error: authErr } = await supabase.auth.getUser(accessToken);
    if (authErr || !authData?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const key = `${userId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadErr) throw uploadErr;

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(key);
    return NextResponse.json({ ok: true, path: key, url: publicData.publicUrl });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}