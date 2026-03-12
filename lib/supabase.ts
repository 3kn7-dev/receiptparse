import { createClient } from "@supabase/supabase-js";

// Browser client (for use in components) - lazy initialized to avoid issues during build
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}

// Server client with elevated privileges (for API routes) - lazy initialized
let serviceClientInstance: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  if (!serviceClientInstance) {
    serviceClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return serviceClientInstance;
}

// Plan upload limits
export const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 300,
  business: 999999,
};

// Get user's current plan
export async function getUserPlan(userId: string): Promise<string> {
  const db = getServiceClient();
  const { data } = await db
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .single() as any;

  if (!data || data.status === "cancelled") return "free";
  return data.plan ?? "free";
}

// Check if user can upload and increment counter
export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}> {
  const db = getServiceClient();
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan] ?? 5;
  const month = new Date().toISOString().slice(0, 7); // e.g. "2025-03"

  // Upsert usage row
  const { data: usageData, error } = await db
    .from("usage")
    .select("upload_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single() as any;

  const currentCount = usageData?.upload_count ?? 0;

  if (currentCount >= limit) {
    return { allowed: false, used: currentCount, limit, plan };
  }

  // Increment
  await (db.from("usage") as any).upsert(
    { user_id: userId, month, upload_count: currentCount + 1 },
    { onConflict: "user_id,month" }
  );

  return { allowed: true, used: currentCount + 1, limit, plan };
}

// Get this month's usage for a user
export async function getMonthlyUsage(userId: string): Promise<{ used: number; limit: number; plan: string }> {
  const db = getServiceClient();
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan] ?? 5;
  const month = new Date().toISOString().slice(0, 7);

  const { data } = await db
    .from("usage")
    .select("upload_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single() as any;

  return { used: data?.upload_count ?? 0, limit, plan };
}

// Save extraction result
export async function saveExtraction(userId: string, filename: string, data: object): Promise<{ id: string } | null> {
  const db = getServiceClient();
  const { data: row, error } = await (db
    .from("extractions") as any)
    .insert({ user_id: userId, filename, extracted_data: data, created_at: new Date().toISOString() })
    .select()
    .single() as any;
  return row as { id: string } | null;
}

// Get user's extraction history
export async function getExtractions(userId: string, limit = 20) {
  const db = getServiceClient();
  const { data } = await db
    .from("extractions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit) as any;
  return data ?? [];
}
