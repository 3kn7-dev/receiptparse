import { InvoiceData } from "./claude";

export function invoicesToCSV(extractions: { filename: string; extracted_data: InvoiceData; created_at: string }[]): string {
  const headers = [
    "Date Uploaded", "Filename", "Vendor", "Invoice Date",
    "Invoice #", "Subtotal", "Tax", "Total", "Currency", "Confidence"
  ];

  const rows = extractions.map((e) => {
    const d = e.extracted_data;
    return [
      new Date(e.created_at).toLocaleDateString(),
      e.filename,
      d.vendor ?? "",
      d.date ?? "",
      d.invoice_number ?? "",
      d.subtotal ?? 0,
      d.tax ?? 0,
      d.total ?? 0,
      d.currency ?? "",
      d.confidence ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function singleInvoiceCSV(data: InvoiceData, filename: string): string {
  const summaryHeaders = ["Vendor", "Date", "Invoice #", "Subtotal", "Tax", "Total", "Currency"];
  const summaryRow = [data.vendor, data.date, data.invoice_number ?? "", data.subtotal, data.tax, data.total, data.currency]
    .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");

  const lineHeaders = ["Description", "Quantity", "Unit Price", "Amount"];
  const lineRows = (data.line_items ?? []).map((item) =>
    [item.description, item.quantity ?? "", item.unit_price ?? "", item.amount]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  );

  return [
    `"${filename}"`, "",
    summaryHeaders.join(","), summaryRow, "",
    "Line Items:", lineHeaders.join(","), ...lineRows
  ].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
