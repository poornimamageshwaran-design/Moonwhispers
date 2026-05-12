import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validators";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = newsletterSchema.parse(json);

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email: body.email
      },
      { onConflict: "email" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

