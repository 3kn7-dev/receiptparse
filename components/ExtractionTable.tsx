'use client'

import { useState } from 'react'
import type { InvoiceData } from '@/lib/claude'
import { downloadCSV, singleInvoiceCSV } from '@/lib/csv'

interface ExtractionTableProps {
  data: InvoiceData
  filename: string
}

export default function ExtractionTable({ data, filename }: ExtractionTableProps) {
  const [editing, setEditing] = useState<Record<string, string>>({})

  const getVal = (key: string, fallback: string) =>
    editing[key] !== undefined ? editing[key] : fallback

  const set = (key: string, val: string) =>
    setEditing((prev) => ({ ...prev, [key]: val }))

  const merged: InvoiceData = {
    ...data,
    vendor: getVal('vendor', data.vendor),
    date: getVal('date', data.date),
    invoice_number: getVal('invoice_number', data.invoice_number || ''),
    subtotal: parseFloat(getVal('subtotal', String(data.subtotal))) || 0,
    tax: parseFloat(getVal('tax', String(data.tax))) || 0,
    total: parseFloat(getVal('total', String(data.total))) || 0,
    currency: getVal('currency', data.currency),
  }

  const handleExport = () => {
    const csv = singleInvoiceCSV(merged, filename)
    downloadCSV(csv, `${filename.replace(/\.[^/.]+$/, '')}-extracted.csv`)
  }

  const confidenceColor = {
    high: '#7dd4a0',
    medium: '#e8b86d',
    low: '#e87d7d',
  }[data.confidence] || '#555'

  return (
    <div style={{ background: '#0f0f18', border: '1px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1e1e2e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#3a6b4a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            Extraction Result
          </div>
          <div style={{ fontSize: 13, color: '#888', fontFamily: 'DM Mono, monospace' }}>{filename}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '3px 10px',
            background: `${confidenceColor}18`,
            border: `1px solid ${confidenceColor}44`,
            borderRadius: 3,
            fontSize: 10,
            color: confidenceColor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'DM Mono, monospace',
          }}>
            {data.confidence} confidence
          </div>
          <button
            onClick={handleExport}
            style={{
              padding: '7px 16px',
              background: '#1a3a26',
              border: '1px solid #2a5a3a',
              borderRadius: 4,
              color: '#7dd4a0',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.05em',
            }}
          >
            Export CSV ↓
          </button>
        </div>
      </div>

      {/* Main fields */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Vendor', key: 'vendor', value: merged.vendor },
            { label: 'Date', key: 'date', value: merged.date },
            { label: 'Invoice #', key: 'invoice_number', value: merged.invoice_number || '' },
          ].map(({ label, key, value }) => (
            <div key={key}>
              <div style={{ fontSize: 10, color: '#3a6b4a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                {label}
              </div>
              <input
                value={value}
                onChange={(e) => set(key, e.target.value)}
                style={{
                  width: '100%',
                  background: '#07070e',
                  border: '1px solid #1e1e2e',
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: '#e8e4d9',
                  fontSize: 13,
                  fontFamily: 'DM Mono, monospace',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3a6b4a')}
                onBlur={(e) => (e.target.style.borderColor = '#1e1e2e')}
              />
            </div>
          ))}
        </div>

        {/* Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Subtotal', key: 'subtotal', value: String(merged.subtotal) },
            { label: 'Tax', key: 'tax', value: String(merged.tax) },
            { label: 'Total', key: 'total', value: String(merged.total), highlight: true },
            { label: 'Currency', key: 'currency', value: merged.currency },
          ].map(({ label, key, value, highlight }) => (
            <div key={key}>
              <div style={{ fontSize: 10, color: '#3a6b4a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                {label}
              </div>
              <input
                value={value}
                onChange={(e) => set(key, e.target.value)}
                style={{
                  width: '100%',
                  background: highlight ? '#0a1a10' : '#07070e',
                  border: `1px solid ${highlight ? '#2a5a3a' : '#1e1e2e'}`,
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: highlight ? '#7dd4a0' : '#e8e4d9',
                  fontSize: highlight ? 15 : 13,
                  fontFamily: 'DM Mono, monospace',
                  fontWeight: highlight ? 500 : 400,
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3a6b4a')}
                onBlur={(e) => (e.target.style.borderColor = highlight ? '#2a5a3a' : '#1e1e2e')}
              />
            </div>
          ))}
        </div>

        {/* Line items */}
        {data.line_items && data.line_items.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#3a6b4a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Line Items
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                  {['Description', 'Qty', 'Unit Price', 'Amount'].map((h) => (
                    <th key={h} style={{
                      padding: '6px 12px',
                      textAlign: 'left',
                      fontSize: 9,
                      color: '#555',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.line_items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0d0d18' }}>
                    <td style={{ padding: '8px 12px', color: '#e8e4d9' }}>{item.description}</td>
                    <td style={{ padding: '8px 12px', color: '#888', fontFamily: 'DM Mono, monospace' }}>{item.quantity ?? '—'}</td>
                    <td style={{ padding: '8px 12px', color: '#888', fontFamily: 'DM Mono, monospace' }}>
                      {item.unit_price != null ? `${merged.currency} ${item.unit_price.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#7dd4a0', fontFamily: 'DM Mono, monospace' }}>
                      {merged.currency} {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid #0d0d18',
        fontSize: 10,
        color: '#2a3a30',
        fontFamily: 'DM Mono, monospace',
      }}>
        ✦ All fields are editable. Changes are reflected in your CSV export.
      </div>
    </div>
  )
}
