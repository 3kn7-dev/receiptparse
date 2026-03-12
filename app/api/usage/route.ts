import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMonthlyUsage } from "@/lib/supabase";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const usage = await getMonthlyUsage(userId);
  return NextResponse.json(usage);
}
