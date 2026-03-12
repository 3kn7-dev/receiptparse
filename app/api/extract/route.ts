import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { extractInvoice } from "@/lib/claude";
import { checkAndIncrementUsage, saveExtraction } from "@/lib/supabase";

export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check usage limit
  const usage = await checkAndIncrementUsage(userId);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: "Monthly upload limit reached",
        used: usage.used,
        limit: usage.limit,
        plan: usage.plan,
        upgrade: true,
      },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Please upload a PDF, JPG, PNG, or WEBP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const data = await extractInvoice(base64, file.type as any);

  // Save to history
  const saved = await saveExtraction(userId, file.name, data);

  return NextResponse.json({
    success: true,
    data,
    extraction_id: saved?.id,
    usage: { used: usage.used, limit: usage.limit, plan: usage.plan },
  });
}
