/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { sendNewsletterMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

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
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    let targetEmails: string[] = [];

    if (Array.isArray(emails) && emails.length > 0) {
      targetEmails = [
        ...new Set(
          emails
            .map((e: string) => String(e).trim().toLowerCase())
            .filter((e: string) => e.includes("@") && e.includes("."))
        ),
      ];
      if (targetEmails.length === 0) {
        return NextResponse.json({ error: "Select at least one valid recipient" }, { status: 400 });
      }
    } else {
      // If no explicit selection, harvest from all collections
      const [allSubs, allOrders, allUsers] = await Promise.all([
        db.collection("submissions").find({}).limit(2000).toArray(),
        db.collection("orders").find({}).limit(1000).toArray(),
        db.collection("users").find({}).limit(1000).toArray(),
      ]);

      const harvested = new Set<string>();
      allSubs.forEach((s) => {
        const em = String((s.data as Record<string, any>)?.email || s.email || "").trim().toLowerCase();
        if (em.includes("@")) harvested.add(em);
      });
      allOrders.forEach((o) => {
        const em = String(o.email || o.customerEmail || "").trim().toLowerCase();
        if (em.includes("@")) harvested.add(em);
      });
      allUsers.forEach((u) => {
        const em = String(u.email || "").trim().toLowerCase();
        if (em.includes("@")) harvested.add(em);
      });
      targetEmails = Array.from(harvested);
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: "No audience recipients found" }, { status: 400 });
    }

    // Build recipient records with best available customer name
    const [matchingSubs, matchingOrders, matchingUsers] = await Promise.all([
      db.collection("submissions").find({ "data.email": { $in: targetEmails } }).toArray(),
      db.collection("orders").find({ email: { $in: targetEmails } }).toArray(),
      db.collection("users").find({ email: { $in: targetEmails } }).toArray(),
    ]);

    const nameMap = new Map<string, string>();

    // Priority 1: Users collection
    matchingUsers.forEach((u) => {
      const em = String(u.email || "").toLowerCase();
      if (em && u.name) nameMap.set(em, String(u.name));
    });

    // Priority 2: Orders
    matchingOrders.forEach((o) => {
      const em = String(o.email || o.customerEmail || "").toLowerCase();
      if (em && (o.name || o.customerName) && !nameMap.has(em)) {
        nameMap.set(em, String(o.name || o.customerName));
      }
    });

    // Priority 3: Submissions
    matchingSubs.forEach((s) => {
      const em = String((s.data as Record<string, any>)?.email || "").toLowerCase();
      const n = (s.data as Record<string, any>)?.name;
      if (em && n && !nameMap.has(em)) {
        nameMap.set(em, String(n));
      }
    });

    const subscribers = targetEmails.map((email) => {
      const foundName = nameMap.get(email);
      let name = foundName;
      if (!name) {
        const local = email.split("@")[0].split(/[._\-+]+/)[0];
        name = local ? local.charAt(0).toUpperCase() + local.slice(1) : "Valued Client";
      }
      return { email, name };
    });

    await sendNewsletterMail(subscribers, subject, content);

    return NextResponse.json({ success: true, sent: subscribers.length });
  } catch (err: any) {
    console.error("Newsletter send error:", err);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
