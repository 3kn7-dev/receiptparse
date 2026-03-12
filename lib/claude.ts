import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface InvoiceData {
  vendor: string;
  date: string;
  invoice_number: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  line_items: { description: string; quantity?: number; unit_price?: number; amount: number }[];
  confidence: "high" | "medium" | "low";
}

export async function extractInvoice(
  base64Data: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"
): Promise<InvoiceData> {
  const isImage = mediaType.startsWith("image/");

  const content: Anthropic.MessageParam["content"] = isImage
    ? [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data: base64Data },
        },
        { type: "text", text: EXTRACTION_PROMPT },
      ]
    : [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64Data },
        } as any,
        { type: "text", text: EXTRACTION_PROMPT },
      ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse extraction result");
  }
}

const EXTRACTION_PROMPT = `Extract all invoice or receipt data from this document and return ONLY a valid JSON object with this exact structure:
{
  "vendor": "business name as string",
  "date": "YYYY-MM-DD format",
  "invoice_number": "string or null if not present",
  "subtotal": numeric value without currency symbol,
  "tax": numeric value or 0 if not shown,
  "total": numeric total amount,
  "currency": "3-letter ISO code e.g. USD, EUR, GBP, JMD",
  "line_items": [
    { "description": "item name", "quantity": 1, "unit_price": 0.00, "amount": 0.00 }
  ],
  "confidence": "high if all fields clear, medium if some unclear, low if very poor quality"
}
Return ONLY the JSON. No explanation, no markdown, no extra text.`;
