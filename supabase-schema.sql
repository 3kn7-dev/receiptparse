-- ============================================
-- ReceiptParse Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',        -- free | starter | pro | business
  status TEXT NOT NULL DEFAULT 'active',    -- active | cancelled | expired
  ls_subscription_id TEXT,                  -- Lemon Squeezy subscription ID
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (per user per month)
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,                      -- e.g. '2025-03'
  upload_count INT DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Extraction history
CREATE TABLE IF NOT EXISTS extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  extracted_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_extractions_user ON extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_extractions_created ON extractions(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by server-side API routes)
-- No additional policies needed since we use service role key in API routes
