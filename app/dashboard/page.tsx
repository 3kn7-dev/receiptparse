"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { invoicesToCSV, singleInvoiceCSV } from "@/lib/csv";

interface InvoiceData {
  vendor: string; date: string; invoice_number: string | null;
  subtotal: number; tax: number; total: number; currency: string;
  line_items: { description: string; quantity?: number; unit_price?: number; amount: number }[];
  confidence: "high" | "medium" | "low";
}

interface Extraction { id: string; filename: string; extracted_data: InvoiceData; created_at: string; }
interface Usage { used: number; limit: number; plan: string; }

const CONF_COLOR = { high: "#7dd4a0", medium: "#e8b86d", low: "#e87d7d" };

function UsageBar({ used, limit, plan }: Usage) {
  const pct = Math.min((used / limit) * 100, 100);
  const warn = pct >= 80;
  return (
    <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", padding: "12px 16px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span>Monthly uploads</span>
          <span style={{ color: warn ? "#e8b86d" : "#3a6b4a" }}>{used} / {limit === 999999 ? "∞" : limit}</span>
        </div>
        <div style={{ height: 3, background: "#1e1e2e", borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: warn ? "#e8b86d" : "#3a6b4a", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#3a6b4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{plan}</div>
      {warn && (
        <Link href="/pricing">
          <button style={{ background: "#1a3a26", border: "1px solid #3a6b4a", color: "#7dd4a0", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            Upgrade →
          </button>
        </Link>
      )}
    </div>
  );
}

function DropZone({ onFile, loading }: { onFile: (f: File) => void; loading: boolean }) {
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${drag ? "#7dd4a0" : "#1e1e2e"}`,
        background: drag ? "#0f1a14" : "#0a0a0f",
        borderRadius: 4, padding: "48px 24px", textAlign: "center",
        transition: "all 0.2s", cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
      }}
      onClick={() => { if (!loading) document.getElementById("fileInput")?.click(); }}
    >
      <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      {loading ? (
        <div>
          <div style={{ fontSize: 28, marginBottom: 12, animation: "spin 1s linear infinite" }}>⟳</div>
          <div style={{ color: "#7dd4a0", fontSize: 13 }}>Extracting data…</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>Claude AI is reading your document</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⬆</div>
          <div style={{ color: "#e8e4d9", fontSize: 14, marginBottom: 6 }}>Drop invoice or receipt here</div>
          <div style={{ color: "#555", fontSize: 11 }}>PDF, JPG, PNG, WEBP · Max 10MB</div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResultTable({ data, onUpdate }: { data: InvoiceData; onUpdate: (d: InvoiceData) => void }) {
  const [editing, setEditing] = useState<string | null>(null);

  const update = (key: keyof InvoiceData, val: any) => onUpdate({ ...data, [key]: val });
  const updateLine = (i: number, key: string, val: any) => {
    const lines = [...data.line_items];
    lines[i] = { ...lines[i], [key]: val };
    onUpdate({ ...data, line_items: lines });
  };

  const field = (label: string, key: keyof InvoiceData, numeric = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0d0d18", alignItems: "center" }}>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 120 }}>{label}</div>
      {editing === key ? (
        <input
          autoFocus defaultValue={String(data[key] ?? "")} type={numeric ? "number" : "text"}
          onBlur={(e) => { update(key, numeric ? parseFloat(e.target.value) : e.target.value); setEditing(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          style={{ background: "#1a1a28", border: "1px solid #3a6b4a", color: "#e8e4d9", padding: "3px 8px", fontFamily: "inherit", fontSize: 12, width: 180 }}
        />
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#e8e4d9", fontSize: 13 }}>{String(data[key] ?? "—")}</span>
          <button onClick={() => setEditing(key)} style={{ background: "none", border: "none", color: "#3a5a4a", cursor: "pointer", fontSize: 10, padding: "0 4px" }}>✎</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#3a6b4a", letterSpacing: "0.15em", textTransform: "uppercase" }}>Extracted Data</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#555" }}>Confidence:</span>
          <span style={{ fontSize: 10, color: CONF_COLOR[data.confidence], textTransform: "uppercase", letterSpacing: "0.1em" }}>{data.confidence}</span>
        </div>
      </div>

      {field("Vendor", "vendor")}
      {field("Date", "date")}
      {field("Invoice #", "invoice_number")}
      {field("Currency", "currency")}
      {field("Subtotal", "subtotal", true)}
      {field("Tax", "tax", true)}
      {field("Total", "total", true)}

      {data.line_items?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Line Items</div>
          {data.line_items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #0d0d18", fontSize: 12, color: "#888" }}>
              <div style={{ flex: 3 }}>{item.description}</div>
              <div style={{ flex: 1, textAlign: "right" }}>{item.quantity ?? 1}x</div>
              <div style={{ flex: 1, textAlign: "right", color: "#7dd4a0" }}>{data.currency} {item.amount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceData | null>(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage>({ used: 0, limit: 5, plan: "free" });
  const [history, setHistory] = useState<Extraction[]>([]);
  const [tab, setTab] = useState<"upload" | "history">("upload");

  useEffect(() => {
    fetch("/api/usage").then(r => r.json()).then(setUsage).catch(() => {});
    fetch("/api/history").then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    setError(""); setLoading(true); setResult(null); setFilename(file.name);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/extract", { method: "POST", body: fd });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Extraction failed"); return; }
    setResult(json.data);
    setUsage(json.usage);
    fetch("/api/history").then(r => r.json()).then(setHistory).catch(() => {});
  };

  const downloadCSV = () => {
    if (!result) return;
    const csv = singleInvoiceCSV(result, filename);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename.replace(/\.[^.]+$/, "")}_extracted.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadHistoryCSV = () => {
    const csv = invoicesToCSV(history);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "receiptparse_history.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", fontFamily: "'DM Mono', monospace" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1e1e2e", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#e8e4d9" }}>
          ReceiptParse<span style={{ color: "#7dd4a0" }}>.io</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#555" }}>{user?.emailAddresses[0]?.emailAddress}</span>
          <Link href="/pricing" style={{ fontSize: 11, color: "#3a6b4a", textDecoration: "none" }}>Upgrade</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 32px" }}>
        {/* Usage bar */}
        <div style={{ marginBottom: 24 }}>
          <UsageBar {...usage} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid #1e1e2e" }}>
          {(["upload", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "#7dd4a0" : "transparent"}`,
              color: tab === t ? "#7dd4a0" : "#555", padding: "10px 20px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
              transition: "all 0.15s"
            }}>
              {t === "upload" ? "⬆ Upload" : `⏱ History (${history.length})`}
            </button>
          ))}
        </div>

        {tab === "upload" && (
          <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 20 }}>
            <div>
              <DropZone onFile={handleFile} loading={loading} />
              {error && (
                <div style={{ marginTop: 12, background: "#1a0a0a", border: "1px solid #3a1a1a", color: "#e87d7d", padding: "10px 14px", fontSize: 12 }}>
                  ⚠ {error}
                  {error.includes("limit") && (
                    <Link href="/pricing" style={{ color: "#7dd4a0", marginLeft: 8 }}>Upgrade →</Link>
                  )}
                </div>
              )}
            </div>

            {result && (
              <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e", padding: "24px" }}>
                <ResultTable data={result} onUpdate={setResult} />
                <button onClick={downloadCSV} style={{
                  marginTop: 20, width: "100%", background: "#1a3a26", border: "1px solid #3a6b4a",
                  color: "#7dd4a0", padding: "10px", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, letterSpacing: "0.08em"
                }}>
                  ⬇ Download CSV
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#555", fontSize: 13 }}>
                No extractions yet. Upload your first invoice above.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button onClick={downloadHistoryCSV} style={{
                    background: "#1a3a26", border: "1px solid #3a6b4a", color: "#7dd4a0",
                    padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.05em"
                  }}>
                    ⬇ Export all as CSV
                  </button>
                </div>
                <div style={{ background: "#0f0f18", border: "1px solid #1e1e2e" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                        {["Date", "Filename", "Vendor", "Total", "Currency", "Confidence"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9, color: "#3a6b4a", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((e) => (
                        <tr key={e.id} style={{ borderBottom: "1px solid #0d0d18" }}
                          onClick={() => { setResult(e.extracted_data); setFilename(e.filename); setTab("upload"); }}
                          className="cursor-pointer hover:bg-[#0f0f18]">
                          <td style={{ padding: "9px 14px", color: "#555" }}>{new Date(e.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: "9px 14px", color: "#888", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.filename}</td>
                          <td style={{ padding: "9px 14px", color: "#e8e4d9" }}>{e.extracted_data.vendor}</td>
                          <td style={{ padding: "9px 14px", color: "#7dd4a0", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{e.extracted_data.total}</td>
                          <td style={{ padding: "9px 14px", color: "#555" }}>{e.extracted_data.currency}</td>
                          <td style={{ padding: "9px 14px" }}>
                            <span style={{ color: CONF_COLOR[e.extracted_data.confidence], fontSize: 10, textTransform: "uppercase" }}>{e.extracted_data.confidence}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
