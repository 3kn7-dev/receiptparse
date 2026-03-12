import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl, PLANS } from "@/lib/lemonsqueezy";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const { plan } = await req.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  const variantId = process.env[planConfig.variantEnv]!;
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const url = await createCheckoutUrl(variantId, userId, email);
  return NextResponse.json({ url });
}
