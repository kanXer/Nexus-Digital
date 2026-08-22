// Server-only PayPal REST client. The client secret never reaches the browser.
// (Only imported by route handlers — never by client components.)
import { getDb } from "@/lib/db";
import { PAYPAL_CURRENCY, convertFromInr } from "@/lib/paypalConfig";

const ENV = process.env.PAYPAL_ENV || "sandbox";
const BASE =
  ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";
const SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  if (!SECRET || SECRET === "sb") {
    throw new Error("PayPal secret is not configured (PAYPAL_CLIENT_SECRET).");
  }
  const basic = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };
  return json.access_token;
}

export interface PayPalCapture {
  id: string;
  status: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { value: string; currency_code: string };
      }>;
    };
  }>;
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalCapture> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });
  const json = (await res.json()) as PayPalCapture;
  if (!res.ok) {
    throw new Error(`PayPal capture failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

export interface PayPalOrder {
  id: string;
  status: string;
  purchase_units?: Array<{
    amount?: { value: string; currency_code: string };
  }>;
}

// Inspect an order WITHOUT capturing it — used to verify the amount before we capture.
export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const json = (await res.json()) as PayPalOrder;
  if (!res.ok) {
    throw new Error(`PayPal order fetch failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

// ─── Recurring subscriptions (autopay) ───────────────────────────────────────

export interface PayPalPlanInput {
  id: string;
  name: string;
  priceInr: number;
}

// Creates (and caches) a PayPal product + monthly billing plan for a recurring
// product. Returns the billing plan id used by the JS SDK subscription flow.
export async function ensurePayPalPlan(product: PayPalPlanInput): Promise<string> {
  if (!SECRET || SECRET === "sb") {
    throw new Error("PayPal secret is not configured (PAYPAL_CLIENT_SECRET).");
  }
  const db = await getDb();
  const col = db.collection("paypalPlans");
  const cached = await col.findOne({ productId: product.id });
  if (cached?.paypalPlanId) return cached.paypalPlanId;

  const token = await getPayPalAccessToken();

  const prodRes = await fetch(`${BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: product.name,
      description: product.name,
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
  const prod = await prodRes.json();
  if (!prodRes.ok) {
    throw new Error(`PayPal product create failed: ${JSON.stringify(prod)}`);
  }

  const planRes = await fetch(`${BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      product_id: prod.id,
      name: `${product.name} (Monthly)`,
      description: `${product.name} — monthly subscription`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: convertFromInr(product.priceInr).toFixed(2),
              currency_code: PAYPAL_CURRENCY,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: "0", currency_code: PAYPAL_CURRENCY },
        payment_failure_threshold: 3,
      },
    }),
  });
  const plan = await planRes.json();
  if (!planRes.ok) {
    throw new Error(`PayPal plan create failed: ${JSON.stringify(plan)}`);
  }

  await col
    .insertOne({
      productId: product.id,
      paypalProductId: prod.id,
      paypalPlanId: plan.id,
      createdAt: new Date(),
    })
    .catch(() => {});

  return plan.id;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  subscriber?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  billing_info?: {
    last_payment?: { amount?: { value: string; currency_code: string } };
  };
}

export async function getPayPalSubscription(
  subscriptionId: string
): Promise<PayPalSubscription> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const json = (await res.json()) as PayPalSubscription;
  if (!res.ok) {
    throw new Error(
      `PayPal subscription fetch failed (${res.status}): ${JSON.stringify(json)}`
    );
  }
  return json;
}
