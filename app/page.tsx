import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

const FEATURES = [
  { icon: "⬆", title: "Upload anything", desc: "PDF, JPG, PNG, WEBP — invoices or receipts, any format" },
  { icon: "⚡", title: "Extract in seconds", desc: "Claude AI reads vendor, date, totals, line items automatically" },
  { icon: "✎", title: "Edit & verify", desc: "Review and correct any field before exporting" },
  { icon: "⬇", title: "Export to CSV", desc: "One click export — ready for Excel, QuickBooks, or any tool" },
];

const PLANS = [
  { name: "Free", price: "$0", uploads: "5 uploads/mo", features: ["PDF & image support", "CSV export", "Edit results"], cta: "Get started free", highlight: false },
  { name: "Starter", price: "$19", uploads: "50 uploads/mo", features: ["Everything in Free", "Extraction history", "Email support"], cta: "Start Starter", highlight: true },
  { name: "Pro", price: "$49", uploads: "300 uploads/mo", features: ["Everything in Starter", "Bulk upload", "Priority support"], cta: "Go Pro", highlight: false },
  { name: "Business", price: "$99", uploads: "Unlimited", features: ["Everything in Pro", "QuickBooks export", "Dedicated support"], cta: "Go Business", highlight: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'DM Mono', monospace" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e8e4d9" }}>
          ReceiptParse<span style={{ color: "#7dd4a0" }}>.io</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "#666", fontSize: 12, textDecoration: "none", letterSpacing: "0.05em" }}>Pricing</Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ background: "none", border: "1px solid #2a2a3a", color: "#888", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.05em" }}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ background: "#1a3a26", border: "1px solid #3a6b4a", color: "#7dd4a0", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.05em" }}>
                Get started free →
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button style={{ background: "#1a3a26", border: "1px solid #3a6b4a", color: "#7dd4a0", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.05em" }}>
                Dashboard →
              </button>
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "100px 40px 80px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "#1a3a26", border: "1px solid #2a5a3a", color: "#7dd4a0", padding: "4px 14px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>
          ✦ AI-powered invoice extraction
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: "#e8e4d9", marginBottom: 24, textShadow: "0 0 60px rgba(125,212,160,0.15)" }}>
          Stop typing invoices.<br />
          <span style={{ color: "#7dd4a0" }}>Let AI read them.</span>
        </h1>
        <p style={{ color: "#666", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
          Upload any invoice or receipt — PDF or image. ReceiptParse extracts every field instantly and exports clean CSV data for your accounting tools.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <SignUpButton mode="modal">
            <button style={{ background: "#7dd4a0", color: "#0a0a0f", border: "none", padding: "14px 32px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em" }}>
              Start free — 5 uploads/month
            </button>
          </SignUpButton>
          <Link href="/pricing">
            <button style={{ background: "none", border: "1px solid #2a2a3a", color: "#888", padding: "14px 24px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: "0.05em" }}>
              See pricing
            </button>
          </Link>
        </div>
        <p style={{ color: "#3a5a4a", fontSize: 11, marginTop: 16 }}>No credit card required · Cancel anytime · Payable globally via PayPal</p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 100px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ background: "#0f0f18", border: "1px solid #1e1e2e", padding: "24px 28px" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e8e4d9", marginBottom: 8 }}>{f.title}</div>
            <div style={{ color: "#666", fontSize: 12, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Pricing preview */}
      <div style={{ borderTop: "1px solid #1e1e2e", padding: "80px 40px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: "#3a6b4a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#e8e4d9" }}>Simple, transparent pricing</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              background: p.highlight ? "#0f1a14" : "#0f0f18",
              border: `1px solid ${p.highlight ? "#3a6b4a" : "#1e1e2e"}`,
              padding: "24px 20px",
              position: "relative"
            }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#7dd4a0", color: "#0a0a0f", padding: "2px 12px", fontSize: 9, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ color: "#888", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: p.highlight ? "#7dd4a0" : "#e8e4d9", marginBottom: 4 }}>{p.price}<span style={{ fontSize: 12, fontWeight: 400, color: "#555" }}>/mo</span></div>
              <div style={{ color: "#3a6b4a", fontSize: 11, marginBottom: 20 }}>{p.uploads}</div>
              {p.features.map((f) => (
                <div key={f} style={{ color: "#666", fontSize: 11, marginBottom: 6 }}>▸ {f}</div>
              ))}
              <SignUpButton mode="modal">
                <button style={{
                  marginTop: 20, width: "100%", background: p.highlight ? "#1a3a26" : "none",
                  border: `1px solid ${p.highlight ? "#3a6b4a" : "#2a2a3a"}`,
                  color: p.highlight ? "#7dd4a0" : "#666", padding: "8px 0", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 11, letterSpacing: "0.05em"
                }}>
                  {p.cta}
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e1e2e", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#e8e4d9" }}>
          ReceiptParse<span style={{ color: "#7dd4a0" }}>.io</span>
        </div>
        <div style={{ color: "#3a3a4a", fontSize: 11 }}>© 2025 ReceiptParse · Payments via Lemon Squeezy · Global PayPal payouts</div>
      </div>
    </div>
  );
}
