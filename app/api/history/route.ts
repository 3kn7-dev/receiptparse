import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getExtractions } from "@/lib/supabase";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const extractions = await getExtractions(userId);
  return NextResponse.json(extractions);
}
