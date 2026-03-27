export function ButtonPrimary({ children, onClick, disabled = false, className = '', style = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pm-btn-primary ${className}`.trim()}
      style={{
        width: '100%',
        border: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function ButtonSecondary({ children, onClick, className = '', style = {}, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pm-btn-secondary ${className}`.trim()}
      style={{
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function ButtonDanger({ children, onClick, className = '', style = {}, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pm-btn-danger ${className}`.trim()}
      style={{
        width: '100%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
