import { NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { saveSubmission } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`chatlead:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Save as a Contact lead so it appears in the admin dashboard.
    await saveSubmission("contact", {
      name: name || "",
      email,
      message: message ? `Chat lead: ${message}` : "Chat lead (via Friday AI assistant)",
      source: "chatbot",
    });

    // Auto-subscribe to the newsletter too (same as enquiry flow).
    await saveSubmission("subscribe", { email, source: "chatbot", auto: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Chat lead error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
