import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceiptParse — AI Invoice & Receipt Extractor",
  description: "Upload any invoice or receipt. Get structured data in seconds. Export to CSV.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        </head>
        <body className="bg-[#0a0a0f] text-[#e8e4d9] font-mono antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
