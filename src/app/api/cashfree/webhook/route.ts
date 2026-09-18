/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature, isCashfreeConfigured } from "@/lib/cashfree";
import { getDb } from "@/lib/db";
import { sendPurchaseReceipt, notifyAdminPurchase } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Webhook handler configured in Cashfree Merchant Dashboard
// https://merchant.cashfree.com/common/developers?env=prod -> Webhooks
export async function POST(req: Request) {
  if (!isCashfreeConfigured()) {
    return NextResponse.json({ message: "Cashfree not configured" }, { status: 200 });
  }

  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp");
    const signature = req.headers.get("x-webhook-signature");

    // Authoritative HMAC-SHA256 signature verification as documented by Cashfree
    const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
    if (!isValid) {
      console.warn("[Cashfree Webhook] Invalid signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload?.type || "";
    const data = payload?.data || {};
    const order = data?.order || {};
    const payment = data?.payment || {};
    const customer = data?.customer_details || {};

    const orderId = order?.order_id || "";
    const paymentStatus = payment?.payment_status || "";
    const paymentAmount = payment?.payment_amount || order?.order_amount || 0;
    const customerEmail = customer?.customer_email || "";
    const customerName = customer?.customer_name || "Nexus Client";

    console.log(`[Cashfree Webhook] Event: ${eventType}, Order: ${orderId}, Status: ${paymentStatus}`);

    // Process successful payment
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS" || eventType === "ORDER_PAID") {
      try {
        const db = await getDb();
        if (db) {
          await db.collection("orders").updateOne(
            { orderId: orderId },
            {
              $set: {
                orderId: orderId,
                cfPaymentId: payment?.cf_payment_id || "",
                status: "Completed",
                paymentStatus: "SUCCESS",
                amount: paymentAmount,
                email: customerEmail,
                name: customerName,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
        }

        // Send email receipt to buyer and agency notification (non-blocking)
        if (customerEmail) {
          const receiptData = {
            customerName,
            customerEmail,
            customerPhone: customer?.customer_phone || "",
            orderId,
            planName: "Nexus Digital Growth Package",
            amountInr: paymentAmount,
            amountDisplay: `₹${paymentAmount.toLocaleString("en-IN")}`,
            isSubscription: true,
            purchaseDate: new Date().toLocaleDateString("en-IN"),
            purchaseTime: new Date().toLocaleTimeString("en-IN"),
          };
          sendPurchaseReceipt(receiptData).catch((err) =>
            console.warn("[Cashfree Webhook] Receipt email error:", err)
          );
          notifyAdminPurchase(receiptData).catch(() => {});
        }
      } catch (dbErr) {
        console.error("[Cashfree Webhook] DB update error:", dbErr);
      }
    }

    return NextResponse.json({ status: "ok", received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Cashfree Webhook] Handler error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
