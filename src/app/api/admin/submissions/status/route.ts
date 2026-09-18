import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { sendBookingStatusEmail, sendBookingRejectedEmail, sendContactResolvedEmail, sendAdminStatusNote } from "@/lib/mail";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const db = await getDb();
    const item = await db.collection("submissions").findOne({ _id: new ObjectId(id) });
    if (!item) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const data = (item.data || {}) as Record<string, unknown>;
    const customerEmail = String(data.email || "");
    const name = String(data.name || "there");
    const type = item.type as string;

    const validActions = ["confirm", "reject", "resolve", "reopen"] as const;
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (type === "booking") {
      let newStatus: string;
      if (action === "confirm") newStatus = "confirmed";
      else if (action === "reject") newStatus = "rejected";
      else return NextResponse.json({ error: "Booking only supports confirm or reject" }, { status: 400 });

      await db.collection("submissions").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: newStatus, updatedAt: new Date() } }
      );
      if (action === "confirm") {
        await sendBookingStatusEmail(customerEmail, name, data as never, true);
      } else {
        await sendBookingRejectedEmail(customerEmail, name);
      }
    } else if (type === "contact" || type === "enquiry") {
      const newStatus = action === "resolve" ? "resolved" : "pending";
      await db.collection("submissions").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: newStatus, updatedAt: new Date() } }
      );
      if (action === "resolve") {
        await sendContactResolvedEmail(customerEmail, name);
      }
    } else {
      return NextResponse.json({ error: "This type doesn't support status" }, { status: 400 });
    }

    const actionLabel =
      action === "confirm" ? "Confirmed"
      : action === "reject" ? "Rejected"
      : action === "resolve" ? "Resolved"
      : "Reopened (pending)";

    const typeLabel =
      type === "booking" ? "Booking"
      : type === "enquiry" ? "Enquiry"
      : "Contact";

    await sendAdminStatusNote(
      `[${typeLabel}] ${name} — ${actionLabel}`,
      [
        { label: "Customer", value: `${name} (${customerEmail})` },
        { label: "Type", value: typeLabel },
        { label: "Action", value: actionLabel },
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
