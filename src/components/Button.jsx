export function ButtonPrimary({ children, onClick, disabled = false, className = '', style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
        fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700,
        letterSpacing: '0.5px', cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? 'var(--border-2)' : 'linear-gradient(135deg, #f48c06, #e85d04)',
        color: '#fff', opacity: disabled ? 0.6 : 1,
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(232,93,4,0.25)',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,93,4,0.4)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,93,4,0.25)' }}
    >
      {children}
    </button>
  )
}

export function ButtonSecondary({ children, onClick, className = '', style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '13px', borderRadius: '12px',
        border: '1px solid var(--border-2)',
        fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700,
        letterSpacing: '0.5px', cursor: 'pointer',
        background: 'transparent', color: 'var(--text-2)',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-3)'; e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
    >
      {children}
    </button>
  )
}

export function ButtonDanger({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '13px', borderRadius: '12px',
        border: '1px solid rgba(239,68,68,0.3)',
        fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700,
        cursor: 'pointer', background: 'rgba(239,68,68,0.08)',
        color: '#ef4444', transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}