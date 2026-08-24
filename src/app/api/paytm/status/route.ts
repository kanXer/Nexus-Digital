/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { isPaytmConfigured, checkPaytmStatus } from "@/lib/paytm";

export const dynamic = "force-dynamic";

// Used by the payment-success page to authoritatively verify a Paytm
// transaction after the user returns from the gateway.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const po = url.searchParams.get("po") || "";

  if (!po) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  if (!isPaytmConfigured()) {
    return NextResponse.json(
      { body: { resultInfo: { resultStatus: "TXN_FAILURE", resultMsg: "Demo mode" } } },
      { status: 200 }
    );
  }

  try {
    const json = await checkPaytmStatus(po);
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Could not verify transaction" },
      { status: 500 }
    );
  }
}
