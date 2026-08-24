/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { checkPaytmStatus } from "@/lib/paytm";
import { getDb } from "@/lib/db";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

// Paytm redirects the user's browser here after a payment attempt.
// We verify the transaction status (authoritative), store a payment record,
// then send the user to the success page (which records the order in Firebase).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const po = url.searchParams.get("po") || "";
  const plan = url.searchParams.get("plan") || "";
  const origin = url.origin;

  let success = false;
  let statusJson: any = null;
  try {
    statusJson = await checkPaytmStatus(po);
    success = statusJson?.body?.resultInfo?.resultStatus === "TXN_SUCCESS";
  } catch {
    // Verification failed — treat as failure.
  }

  const product = getProduct(plan);
  const amountInr = product?.priceInr || 0;

  try {
    const db = await getDb();
    await db
      .collection("payments")
      .insertOne({
        gateway: "paytm",
        orderId: po,
        productId: plan,
        productName: product?.name || plan,
        amount: amountInr,
        status: success ? "paid" : statusJson?.body?.resultInfo?.resultStatus || "failed",
        response: statusJson,
        createdAt: new Date(),
      })
      .catch(() => {});
  } catch {
    // Non-fatal: payment record is best-effort.
  }

  if (!success) {
    return NextResponse.redirect(
      `${origin}/payment-success?status=failed&plan=${encodeURIComponent(plan)}`
    );
  }

  const billNumber = `INV-${po}`;
  return NextResponse.redirect(
    `${origin}/payment-success?po=${encodeURIComponent(po)}&plan=${encodeURIComponent(plan)}&txn=${billNumber}`
  );
}
