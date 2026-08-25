/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCashfreeOrderStatus, isCashfreeConfigured } from "@/lib/cashfree";

export const dynamic = "force-dynamic";

// Used by the payment-success page to authoritatively verify a Cashfree
// order after the user returns from the gateway.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId") || "";

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  if (!isCashfreeConfigured()) {
    return NextResponse.json({ demo: true, order_status: "DEMO_MODE" }, { status: 200 });
  }

  try {
    const json: any = await getCashfreeOrderStatus(orderId);
    return NextResponse.json({
      order_id: json?.order_id,
      order_status: json?.order_status,
      order_amount: json?.order_amount,
      payment_session_id: json?.payment_session_id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Could not verify order" },
      { status: 500 }
    );
  }
}
