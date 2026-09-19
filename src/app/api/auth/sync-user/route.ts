import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const uid = String(body?.uid || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          email,
          name: name || email.split("@")[0],
          phone: phone || "",
          uid: uid || "",
          lastLoginAt: new Date(),
          source: "Logged-in User",
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.warn("User sync error:", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
