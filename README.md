# ReceiptParse.io

AI-powered invoice & receipt data extractor. Upload any PDF or image, extract structured data, export to CSV.

## Tech Stack
- **Next.js 14** (App Router)
- **Clerk** — Authentication
- **Claude claude-sonnet-4-20250514** — AI extraction via vision API
- **Supabase** — Database (Postgres)
- **Lemon Squeezy** — Payments / subscriptions (Jamaica-ready, PayPal payouts)
- **Vercel** — Hosting

---

## Setup Guide

### 1. Clone & install
```bash
git clone <your-repo>
cd receiptparse
npm install
```

### 2. Set up Supabase
1. Create project at supabase.com
2. Run `supabase-schema.sql` in the SQL editor
3. Copy your project URL and keys to `.env.local`

### 3. Set up Clerk
1. Create app at clerk.com
2. Copy publishable key + secret key to `.env.local`
3. Set redirect URLs in Clerk dashboard:
   - Sign-in: `http://localhost:3000/sign-in`
   - Sign-up: `http://localhost:3000/sign-up`
   - After sign-in: `http://localhost:3000/dashboard`

### 4. Set up Lemon Squeezy
1. Create store at lemonsqueezy.com
2. Create 3 products (Starter $19, Pro $49, Business $99)
3. For each product, create a subscription variant
4. Copy variant IDs and store ID to `.env.local`
5. Set up webhook:
   - URL: `https://yourdomain.com/api/webhooks/lemonsqueezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_resumed`
6. Copy webhook secret to `.env.local`

### 5. Get Anthropic API key
1. Sign up at console.anthropic.com
2. Create API key → add to `.env.local`

### 6. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 7. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add all env vars in Vercel dashboard (Settings → Environment Variables)
```

---

## Pricing Tiers
| Plan     | Price  | Uploads/mo |
|----------|--------|------------|
| Free     | $0     | 5          |
| Starter  | $19/mo | 50         |
| Pro      | $49/mo | 300        |
| Business | $99/mo | Unlimited  |

## Payment Flow (Jamaica)
Customer pays → Lemon Squeezy processes → Bi-monthly PayPal payout to you

---

## API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/extract` | POST | Upload file, returns extracted data |
| `/api/usage` | GET | Current month usage for user |
| `/api/history` | GET | Extraction history |
| `/api/checkout` | POST | Create Lemon Squeezy checkout URL |
| `/api/webhooks/lemonsqueezy` | POST | Handle subscription events |

## File Structure
```
app/
  page.tsx                    # Landing page
  dashboard/page.tsx          # Main app UI
  pricing/page.tsx            # Pricing page
  sign-in/[[...sign-in]]/     # Clerk auth
  sign-up/[[...sign-up]]/     # Clerk auth
  api/
    extract/route.ts          # Core extraction endpoint
    usage/route.ts            # Usage stats
    history/route.ts          # Extraction history
    checkout/route.ts         # Payment checkout
    webhooks/lemonsqueezy/    # Subscription webhooks
lib/
  claude.ts                   # Claude API wrapper
  supabase.ts                 # DB client + usage tracking
  lemonsqueezy.ts             # Payment helpers
  csv.ts                      # CSV export utilities
middleware.ts                 # Clerk auth protection
supabase-schema.sql           # Run in Supabase SQL editor
```
