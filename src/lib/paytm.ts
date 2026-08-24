import crypto from "crypto";

const ENV = (process.env.PAYTM_ENV || "stage").toLowerCase();
const BASE =
  ENV === "production"
    ? "https://securegw.paytm.in"
    : "https://securegw-stage.paytm.in";

export const PAYTM_MID = process.env.PAYTM_MID || "";
export const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || "";
export const PAYTM_WEBSITE =
  process.env.PAYTM_WEBSITE || (ENV === "production" ? "DEFAULT" : "WEBSTAGING");

export function isPaytmConfigured(): boolean {
  return Boolean(
    PAYTM_MID && PAYTM_MERCHANT_KEY && PAYTM_MERCHANT_KEY !== "dummy"
  );
}

// Paytm checksum = SHA256(JSON.stringify(body) + merchantKey)
function generateChecksum(body: object, key: string): string {
  return crypto.createHash("sha256").update(JSON.stringify(body) + key).digest("hex");
}

export interface PaytmInitArgs {
  orderId: string;
  amountInr: number;
  customerId: string;
  callbackUrl: string;
}

export async function initiatePaytmPayment(args: PaytmInitArgs) {
  const body = {
    requestType: "Payment",
    mid: PAYTM_MID,
    websiteName: PAYTM_WEBSITE,
    orderId: args.orderId,
    callbackUrl: args.callbackUrl,
    txnAmount: { value: args.amountInr.toFixed(2), currency: "INR" },
    userInfo: { custId: args.customerId },
  };
  const checksum = generateChecksum(body, PAYTM_MERCHANT_KEY);

  const res = await fetch(
    `${BASE}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${args.orderId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, head: { signature: checksum } }),
    }
  );
  const json = await res.json();
  if (
    json?.body?.resultInfo?.resultStatus !== "S" ||
    !json?.body?.txnToken
  ) {
    throw new Error(json?.body?.resultInfo?.resultMsg || "Paytm initiation failed");
  }

  const txnToken = json.body.txnToken;
  return {
    url: `${BASE}/theia/api/v1/showPaymentPage?mid=${PAYTM_MID}&orderId=${args.orderId}&txnToken=${encodeURIComponent(txnToken)}`,
  };
}

export async function checkPaytmStatus(orderId: string) {
  const body = { mid: PAYTM_MID, orderId };
  const checksum = generateChecksum(body, PAYTM_MERCHANT_KEY);
  const res = await fetch(
    `${BASE}/merchant-status/api/v1/getTransactionStatus?mid=${PAYTM_MID}&orderId=${encodeURIComponent(orderId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, head: { signature: checksum } }),
    }
  );
  return res.json();
}
