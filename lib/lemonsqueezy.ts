import crypto from "crypto";
import { getServiceClient } from "./supabase";

export const PLANS = {
  starter: {
    name: "Starter",
    price: 19,
    variantEnv: "LS_STARTER_VARIANT_ID",
    uploads: 50,
  },
  pro: {
    name: "Pro",
    price: 49,
    variantEnv: "LS_PRO_VARIANT_ID",
    uploads: 300,
  },
  business: {
    name: "Business",
    price: 99,
    variantEnv: "LS_BIZ_VARIANT_ID",
    uploads: -1,
  },
};

// Generate a checkout URL for a given plan
export async function createCheckoutUrl(
  variantId: string,
  userId: string,
  userEmail: string
): Promise<string> {
  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: process.env.NEXT_PUBLIC_LS_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  const json = await response.json();
  return json.data?.attributes?.url ?? "";
}

// Verify Lemon Squeezy webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return hmac === signature;
}

// Map variant ID to plan name
export function variantToPlan(variantId: string): string {
  const map: Record<string, string> = {
    [process.env.LS_STARTER_VARIANT_ID!]: "starter",
    [process.env.LS_PRO_VARIANT_ID!]: "pro",
    [process.env.LS_BIZ_VARIANT_ID!]: "business",
  };
  return map[variantId] ?? "free";
}

// Handle incoming subscription webhook events
export async function handleWebhookEvent(event: any): Promise<void> {
  const db = getServiceClient();
  const { meta, data } = event;
  const eventName: string = meta.event_name;
  const userId: string = data.attributes.custom_data?.user_id;

  if (!userId) {
    console.error("Webhook missing user_id in custom_data");
    return;
  }

  const variantId = String(data.attributes.variant_id);
  const plan = variantToPlan(variantId);
  const status: string = data.attributes.status;

  if (["subscription_created", "subscription_updated", "subscription_resumed"].includes(eventName)) {
    await db.from("subscriptions").upsert(
      { user_id: userId, plan, status, ls_subscription_id: data.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }

  if (["subscription_cancelled", "subscription_expired"].includes(eventName)) {
    await db
      .from("subscriptions")
      .update({ plan: "free", status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }
}
