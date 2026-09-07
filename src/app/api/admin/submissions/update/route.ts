import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || "";
  return getSessionEmail(token);
}

const VALID = ["pending", "resolved", "rejected", "confirmed"];

export async function POST(req: Request) {
  const email = await requireAuth();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await req.json();
    if (!id || !ObjectId.isValid(id) || !VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("submissions").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update submission error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
