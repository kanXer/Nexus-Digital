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

const VALID = [
  "pending",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "resolved",
  "rejected",
  "confirmed",
];

import { sendQueryResolvedEmail } from "@/lib/mail";
import { getServicePricing } from "@/lib/servicePricingUtils";

export async function POST(req: Request) {
  const email = await requireAuth();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, dealValue, priority, notes, source, service, phone, nextFollowUp, resolutionNotes, sendEmail } = body;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    if (status && !VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status stage" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status) updateFields.status = status;
    if (dealValue !== undefined) {
      updateFields["data.dealValue"] = Number(dealValue) || 0;
    } else if (service) {
      updateFields["data.dealValue"] = getServicePricing(service).price;
    }
    if (priority !== undefined) updateFields["data.priority"] = priority;
    if (notes !== undefined) updateFields["data.notes"] = notes;
    if (source !== undefined) updateFields["data.source"] = source;
    if (service !== undefined) updateFields["data.service"] = service;
    if (phone !== undefined) updateFields["data.phone"] = phone;
    if (nextFollowUp !== undefined) updateFields["data.nextFollowUp"] = nextFollowUp;
    if (resolutionNotes !== undefined) updateFields["data.resolutionNotes"] = resolutionNotes;

    const db = await getDb();
    const existing = await db.collection("submissions").findOne({ _id: new ObjectId(id) });

    await db.collection("submissions").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    let emailSent = false;
    // When marking as resolved, send notification email to the client if they have an email address
    if (status === "resolved" && (sendEmail !== false)) {
      const clientEmail = String(body.email || existing?.data?.email || "");
      const clientName = String(body.name || existing?.data?.name || "Client");
      const clientService = String(service || existing?.data?.service || existing?.data?.resourceTitle || "");
      const originalMessage = String(existing?.data?.message || "");
      const remarks = String(resolutionNotes || notes || updateFields["data.notes"] || "");

      if (clientEmail && clientEmail.includes("@")) {
        try {
          await sendQueryResolvedEmail({
            clientName,
            clientEmail,
            service: clientService,
            originalMessage,
            resolutionNotes: remarks,
            submissionType: existing?.type || "inquiry",
          });
          emailSent = true;
        } catch (emailErr) {
          console.warn("Failed to dispatch query resolved email:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    console.error("Update submission error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
