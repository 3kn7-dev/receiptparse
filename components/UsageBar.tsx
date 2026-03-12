'use client'

interface UsageBarProps {
  used: number
  limit: number
  plan: string
  onUpgrade?: () => void
}

export default function UsageBar({ used, limit, plan, onUpgrade }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100)
  const isWarning = pct >= 80
  const isMaxed = pct >= 100

  const barColor = isMaxed ? '#e87d7d' : isWarning ? '#e8b86d' : '#3a6b4a'
  const textColor = isMaxed ? '#e87d7d' : isWarning ? '#e8b86d' : '#7dd4a0'

  return (
    <div style={{
      background: '#0f0f18',
      border: '1px solid #1e1e2e',
      borderRadius: 6,
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>
          {plan} plan · uploads this month
        </div>
        <div style={{ fontSize: 12, color: textColor, fontFamily: 'DM Mono, monospace' }}>
          {used} / {limit === 999999 ? '∞' : limit}
        </div>
      </div>

      <div style={{ height: 4, background: '#1a1a28', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: barColor,
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {isWarning && !isMaxed && onUpgrade && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#e8b86d', display: 'flex', justifyContent: 'space-between' }}>
          <span>Running low on uploads</span>
          <button onClick={onUpgrade} style={{ background: 'none', border: 'none', color: '#e8b86d', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}>
            Upgrade →
          </button>
        </div>
      )}

      {isMaxed && onUpgrade && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#e87d7d', display: 'flex', justifyContent: 'space-between' }}>
          <span>Limit reached for this month</span>
          <button onClick={onUpgrade} style={{ background: 'none', border: 'none', color: '#e87d7d', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}>
            Upgrade now →
          </button>
        </div>
      )}
    </div>
  )
}
