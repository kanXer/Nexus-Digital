import { NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { saveSubmission } from "@/lib/db";
import { leadMagnets } from "@/data/leadMagnets";

export const dynamic = "force-dynamic";

const RESOURCE_TITLES: Record<string, string> = Object.fromEntries(
  leadMagnets.map((m) => [m.id, m.title])
);

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`lm:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const resource = typeof body?.resource === "string" ? body.resource : "";
    const resourceTitle = RESOURCE_TITLES[resource] || resource || "Unknown resource";

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!resource) {
      return NextResponse.json({ error: "Missing resource." }, { status: 400 });
    }

    await saveSubmission("leadmagnet", {
      name: name || "",
      email,
      resource,
      resourceTitle,
      source: "website",
    });

    // Auto-subscribe to the newsletter (same as enquiry flow).
    await saveSubmission("subscribe", { email, source: "website", auto: true });

    return NextResponse.json({ ok: true, resourceTitle });
  } catch (err) {
    console.error("Lead magnet error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
