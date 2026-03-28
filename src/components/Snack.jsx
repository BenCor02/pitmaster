export default function Snack({ snack }) {
  if (!snack) return null
  const colors = { success: '#22c55e', error: '#ef4444', warning: '#f48c06', info: '#3b82f6' }
  return (
    <div style={{
      position: 'fixed', bottom: '76px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 300, background: colors[snack.type] || colors.success,
      color: '#fff', padding: '11px 20px', borderRadius: '10px',
      fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {snack.msg}
    </div>
  )
}
