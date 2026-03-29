import { useNavigate } from 'react-router-dom'
import BrandMark from '../../components/BrandMark'

export default function AuthShell({
  title,
  subtitle,
  children,
  footer = null,
  maxWidth = 430,
}) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#080706', padding: 24, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto 24px', background: 'transparent', border: 'none', color: '#f5f1ea', cursor: 'pointer' }}
        >
          <BrandMark size={42} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>Charbon & Flamme</div>
            <div style={{ fontSize: 11, color: '#8a7060', letterSpacing: '1.3px', textTransform: 'uppercase' }}>Planification BBQ</div>
          </div>
        </button>

        <div style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 20, padding: 30, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />
          <h1 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#f5f1ea', lineHeight: 1.05 }}>
            {title}
          </h1>
          {subtitle ? (
            <p style={{ margin: '10px 0 24px', color: '#8a7060', lineHeight: 1.7, fontSize: 13 }}>
              {subtitle}
            </p>
          ) : null}
          {children}
          {footer ? <div style={{ marginTop: 18 }}>{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
