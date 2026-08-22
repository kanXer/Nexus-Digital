// Shared PayPal currency config — safe to import from both client and server.
// The sandbox account often does not support INR for REST checkout/subscriptions,
// so we bill in a supported currency (e.g. USD) and convert from the INR price list.
// For a production India PayPal account that supports INR, set PAYPAL_CURRENCY=INR
// (the rate is then 1:1).

// NEXT_PUBLIC_ prefix required so the client (PayPalButton) and server agree on
// the same currency/rate. Not secret.
export const PAYPAL_CURRENCY = (
  process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD"
).toUpperCase();

export const INR_TO_PAYPAL_RATE = Number(
  process.env.NEXT_PUBLIC_INR_TO_PAYPAL_RATE || "83"
);

// Convert an INR price to the PayPal billing currency amount.
export function convertFromInr(inr: number): number {
  const converted = PAYPAL_CURRENCY === "INR" ? inr : inr / (INR_TO_PAYPAL_RATE || 1);
  return Math.round(converted * 100) / 100;
}

export function formatPaypalAmount(inr: number): string {
  return convertFromInr(inr).toFixed(2);
}

export function isAmountMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01;
}

// Convert a PayPal-billed amount back to INR for invoices and records.
export function convertToInr(amount: number, currency: string): number {
  const c = (currency || "INR").toUpperCase();
  if (c === "INR") return Math.round(amount * 100) / 100;
  return Math.round(amount * (INR_TO_PAYPAL_RATE || 1) * 100) / 100;
}
