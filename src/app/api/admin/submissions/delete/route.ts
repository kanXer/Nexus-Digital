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

export async function POST(req: Request) {
  const email = await requireAuth();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const db = await getDb();
    const res = await db.collection("submissions").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, deleted: res.deletedCount });
  } catch (err) {
    console.error("Delete submission error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
