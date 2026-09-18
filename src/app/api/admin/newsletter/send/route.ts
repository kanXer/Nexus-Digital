import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { sendNewsletterMail } from "@/lib/mail";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, content, emails } = await req.json();
    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }
    if (subject.length > 120) {
      return NextResponse.json({ error: "Subject must be under 120 characters" }, { status: 400 });
    }

    const db = await getDb();
    let subscribers: { email: string; name: string }[];

    if (Array.isArray(emails) && emails.length > 0) {
      const clean = [...new Set(emails.map((e: string) => String(e).trim().toLowerCase()).filter((e: string) => e.includes("@")))];
      if (clean.length === 0) {
        return NextResponse.json({ error: "Select at least one valid subscriber" }, { status: 400 });
      }
      const subs = await db
        .collection("submissions")
        .find({ type: "subscribe", "data.email": { $in: clean } })
        .limit(2000)
        .toArray();
      subscribers = subs
        .map((s) => ({
          email: String((s.data as Record<string, unknown>)?.email || ""),
          name: String((s.data as Record<string, unknown>)?.name || "there"),
        }))
        .filter((s) => s.email.includes("@"));
    } else {
      const subs = await db
        .collection("submissions")
        .find({ type: "subscribe" })
        .limit(2000)
        .toArray();
      subscribers = subs
        .map((s) => ({
          email: String((s.data as Record<string, unknown>)?.email || ""),
          name: String((s.data as Record<string, unknown>)?.name || "there"),
        }))
        .filter((s) => s.email.includes("@"));
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No subscribers found for the selected emails" }, { status: 400 });
    }

    await sendNewsletterMail(subscribers, subject, content);

    return NextResponse.json({ success: true, sent: subscribers.length });
  } catch (err) {
    console.error("Newsletter send error:", err);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
