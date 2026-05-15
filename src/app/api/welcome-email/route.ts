import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Moon Whispers <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Moon Whispers ✦",
        html: `
          <div style="background:#0a0e1a;color:#d0e8f8;font-family:sans-serif;padding:40px;border-radius:16px;max-width:480px;margin:auto">
            <h1 style="color:#f0e6c8;font-style:italic;font-weight:300">Moon Whispers</h1>
            <p style="color:#8a9aaa">Hi ${name ?? "there"},</p>
            <p style="color:#8a9aaa">Welcome! Your account has been created successfully.</p>
            <p style="color:#8a9aaa">Start exploring and writing your thoughts.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
               style="display:inline-block;margin-top:24px;background:#2255cc;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">
              Visit Moon Whispers
            </a>
            <p style="margin-top:32px;color:#2a3a4a;font-size:12px">Moon Whispers · You're receiving this because you signed up.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[welcome-email] Resend error:", err);
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[welcome-email] Error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
