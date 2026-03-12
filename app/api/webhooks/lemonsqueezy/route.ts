import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, handleWebhookEvent } from "@/lib/lemonsqueezy";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifyWebhookSignature(payload, signature)) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  console.log("LS Webhook:", event.meta?.event_name);

  await handleWebhookEvent(event);

  return NextResponse.json({ received: true });
}
