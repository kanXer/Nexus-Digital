import { NextResponse } from "next/server";
import { sendAckEmail } from "@/lib/mail";
import { saveSubmission } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await saveSubmission("subscribe", { email, name: name || "Newsletter Subscriber" });
    await sendAckEmail(email, name || "there", false);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
