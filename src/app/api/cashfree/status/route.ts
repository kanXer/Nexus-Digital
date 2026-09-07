/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import {
  getCashfreeOrderStatus,
  getCashfreePayments,
  isCashfreeConfigured,
} from "@/lib/cashfree";

export const dynamic = "force-dynamic";

// Used by the payment-success page to authoritatively verify a Cashfree
// order after the user returns from the gateway.
//
// Verification strategy:
//   1. GET /pg/orders/{orderId}/payments  → inspect payment_status (SUCCESS/FAILED)
//   2. GET /pg/orders/{orderId}           → fallback on order_status (PAID/ACTIVE)
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
    // Try the payments list first — it carries the authoritative payment_status.
    let payments: any[] = [];
    let paymentHappened = false;
    try {
      const paymentsJson = await getCashfreePayments(orderId);
      if (Array.isArray(paymentsJson)) {
        payments = paymentsJson;
        paymentHappened = payments.length > 0;
      }
    } catch {
      // If the payments call fails, fall through to order status below.
    }

    const order = await getCashfreeOrderStatus(orderId);

    if (paymentHappened && payments.length) {
      const latest = payments[payments.length - 1];
      return NextResponse.json({
        order_id: orderId,
        order_status: order?.order_status,
        payment_status: latest?.payment_status,
        payment_amount: latest?.payment_amount,
        cf_payment_id: latest?.cf_payment_id,
        payment_method: latest?.payment_method,
        is_paid:
          latest?.payment_status === "SUCCESS" || order?.order_status === "PAID",
        payments_count: payments.length,
      });
    }

    return NextResponse.json({
      order_id: order?.order_id,
      order_status: order?.order_status,
      order_amount: order?.order_amount,
      payment_session_id: order?.payment_session_id,
      is_paid: order?.order_status === "PAID",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Could not verify order" },
      { status: 500 }
    );
  }
}
