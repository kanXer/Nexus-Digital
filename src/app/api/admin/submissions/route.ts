import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const email = await getSessionEmail(token || "");
  if (!email) return null;
  return email;
}

export async function GET(req: Request) {
  const email = await requireAuth();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

  try {
    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const items = await db
      .collection("submissions")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const data = items.map((item) => ({
      id: item._id.toString(),
      type: item.type,
      status: item.status,
      data: item.data,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const counts = {
      contact: await db.collection("submissions").countDocuments({ type: "contact" }),
      booking: await db.collection("submissions").countDocuments({ type: "booking" }),
      enquiry: await db.collection("submissions").countDocuments({ type: "enquiry" }),
      subscribe: await db.collection("submissions").countDocuments({ type: "subscribe" }),
      contactPending: await db.collection("submissions").countDocuments({ type: "contact", status: "pending" }),
      bookingPending: await db.collection("submissions").countDocuments({ type: "booking", status: "pending" }),
      enquiryPending: await db.collection("submissions").countDocuments({ type: "enquiry", status: "pending" }),
      total: await db.collection("submissions").countDocuments({}),
    };

    return NextResponse.json({ success: true, admin: email, items: data, counts });
  } catch (err) {
    console.error("Admin submissions error:", err);
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const email = await requireAuth();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const db = await getDb();
    await db.collection("submissions").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete error:", err);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}
