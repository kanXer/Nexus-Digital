import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const subs = await db
      .collection("submissions")
      .find({ type: "subscribe" })
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    const subscribers = subs.map((s) => ({
      id: s._id.toString(),
      email: String((s.data as Record<string, unknown>)?.email || ""),
      name: String((s.data as Record<string, unknown>)?.name || "Newsletter Subscriber"),
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch (err) {
    console.error("Subscribers fetch error:", err);
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}
