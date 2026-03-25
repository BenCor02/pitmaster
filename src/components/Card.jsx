export default function Card({ children, className = '', accent = true, hover = false }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        padding: '20px',
        marginBottom: '14px',
        transition: hover ? 'border-color 0.2s, background 0.2s' : 'none',
      }}
      onMouseEnter={hover ? e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--card-hover)' } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)' } : undefined}
    >
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(232,93,4,0.6), transparent)',
        }} />
      )}
      {children}
    </div>
  )
}

export function CardTitle({ children, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 700,
      letterSpacing: '1.5px', textTransform: 'uppercase',
      color: 'var(--text-2)', marginBottom: '16px',
    }}>
      {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
      {children}
    </div>
  )
}