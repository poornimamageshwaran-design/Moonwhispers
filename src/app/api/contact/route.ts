import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { createAdminSupabaseClient } from "@/lib/supabase/adminClient";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    // Honeypot — bots fill hidden fields, humans don't
    if (json.website || json.phone) {
      return NextResponse.json({ ok: true }); // fake success to fool bots
    }

    const body = contactSchema.parse(json);

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: body.name,
      email: body.email,
      message: body.message
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}