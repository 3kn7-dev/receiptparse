"use client";
import { useUser, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";

const PLANS = [
  { key: "free", name: "Free", price: 0, uploads: 5, features: ["PDF & image support", "CSV export", "Edit results", "5 uploads/month"] },
  { key: "starter", name: "Starter", price: 19, uploads: 50, features: ["Everything in Free", "50 uploads/month", "Extraction history", "Email support"], popular: true },
  { key: "pro", name: "Pro", price: 49, uploads: 300, features: ["Everything in Starter", "300 uploads/month", "Bulk upload", "Priority support"] },
  { key: "business", name: "Business", price: 99, uploads: -1, features: ["Everything in Pro", "Unlimited uploads", "QuickBooks CSV export", "Dedicated support"] },
];

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "free") return;
    setLoading(planKey);
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planKey }) });
    const { url } = await res.json();
    setLoading(null);
    if (url) window.location.href = url;
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", fontFamily: "'DM Mono', monospace" }}>
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e8e4d9", textDecoration: "none" }}>
          ReceiptParse<span style={{ color: "#7dd4a0" }}>.io</span>
        </Link>
        {isSignedIn && (
          <Link href="/dashboard">
            <button style={{ background: "#1a3a26", border: "1px solid #3a6b4a", color: "#7dd4a0", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
              Dashboard →
            </button>
          </Link>
        )}
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: "#3a6b4a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 40, color: "#e8e4d9", marginBottom: 16 }}>Pay once, extract forever</h1>
          <p style={{ color: "#666", fontSize: 13 }}>All plans include unlimited CSV exports. Upgrade or cancel anytime. Payments via PayPal globally.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {PLANS.map((p) => (
            <div key={p.key} style={{
              background: p.popular ? "#0f1a14" : "#0f0f18",
              border: `1px solid ${p.popular ? "#3a6b4a" : "#1e1e2e"}`,
              padding: "28px 22px", position: "relative"
            }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#7dd4a0", color: "#0a0a0f", padding: "2px 14px", fontSize: 9, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ color: "#888", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 34, color: p.popular ? "#7dd4a0" : "#e8e4d9", marginBottom: 4 }}>
                ${p.price}<span style={{ fontSize: 12, fontWeight: 400, color: "#555" }}>/mo</span>
              </div>
              <div style={{ color: "#3a6b4a", fontSize: 11, marginBottom: 24 }}>{p.uploads === -1 ? "Unlimited" : p.uploads} uploads/mo</div>

              {p.features.map((f) => (
                <div key={f} style={{ color: "#666", fontSize: 11, marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ color: "#3a6b4a" }}>✓</span>{f}
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                {isSignedIn ? (
                  p.key === "free" ? (
                    <Link href="/dashboard">
                      <button style={{ width: "100%", background: "none", border: "1px solid #2a2a3a", color: "#555", padding: "9px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
                        Current plan
                      </button>
                    </Link>
                  ) : (
                    <button onClick={() => handleUpgrade(p.key)} disabled={loading === p.key} style={{
                      width: "100%", background: p.popular ? "#1a3a26" : "none",
                      border: `1px solid ${p.popular ? "#3a6b4a" : "#2a2a3a"}`,
                      color: p.popular ? "#7dd4a0" : "#888", padding: "9px 0", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 11, letterSpacing: "0.05em", opacity: loading === p.key ? 0.6 : 1
                    }}>
                      {loading === p.key ? "Redirecting…" : `Upgrade to ${p.name} →`}
                    </button>
                  )
                ) : (
                  <SignUpButton mode="modal">
                    <button style={{
                      width: "100%", background: p.popular ? "#1a3a26" : "none",
                      border: `1px solid ${p.popular ? "#3a6b4a" : "#2a2a3a"}`,
                      color: p.popular ? "#7dd4a0" : "#666", padding: "9px 0", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 11
                    }}>
                      Get started →
                    </button>
                  </SignUpButton>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60, background: "#0f0f18", border: "1px solid #1e1e2e", padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[
            ["🌍 Global payments", "Pay with any card or PayPal. Works from anywhere in the world."],
            ["🔒 Secure processing", "Payments handled by Lemon Squeezy. We never see your card details."],
            ["↩ Cancel anytime", "No contracts. Cancel your subscription instantly from your account."],
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ color: "#e8e4d9", fontSize: 13, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "#555", fontSize: 11, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
