/* Cashfree Payment Gateway — server-side helper (REST API v2023-08-01).
 * Keys come from .env: CASHFREE_APP_ID / CASHFREE_SECRET_KEY.
 * Leave them blank to run the site in DEMO MODE (no real charges). */

const API_VERSION = "2023-08-01";
const MODE = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
const BASE =
  MODE === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";

export const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
export const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";

export function isCashfreeConfigured(): boolean {
  return Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY && CASHFREE_SECRET_KEY !== "dummy");
}

function authHeaders(): Record<string, string> {
  return {
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

export interface CashfreeOrderArgs {
  orderId: string;
  amountInr: number;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export async function createCashfreeOrder(args: CashfreeOrderArgs) {
  const body = {
    order_id: args.orderId,
    order_amount: Number(args.amountInr.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: args.customerId,
      customer_email: args.customerEmail,
      customer_phone: args.customerPhone,
    },
    order_meta: { return_url: args.returnUrl },
  };

  const res = await fetch(`${BASE}/pg/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.payment_session_id) {
    throw new Error(
      json?.message || json?.details?.[0]?.description || "Cashfree order creation failed"
    );
  }
  return {
    orderId: json.order_id as string,
    paymentSessionId: json.payment_session_id as string,
  };
}

export async function getCashfreeOrderStatus(orderId: string) {
  const res = await fetch(
    `${BASE}/pg/orders/${encodeURIComponent(orderId)}`,
    { method: "GET", headers: authHeaders() }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || "Could not fetch Cashfree order status");
  }
  return json;
}
