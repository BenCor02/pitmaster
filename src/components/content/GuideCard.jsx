import Link from 'next/link'

export default function GuideCard({ guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      style={{
        display: 'block',
        background: '#F5EFE0',
        border: '1px solid rgba(31,26,20,0.15)',
        borderRadius: 4,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(139,26,26,0.35)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,26,26,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(31,26,20,0.15)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {guide.cover_url && (
        <div style={{ height: 128, overflow: 'hidden' }}>
          <img
            src={guide.cover_url}
            alt={guide.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            loading="lazy"
          />
        </div>
      )}
      <div style={{ padding: '12px 16px' }}>
        {guide.category && (
          <span style={{
            display: 'block',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8B1A1A',
            marginBottom: 4,
            fontFamily: 'var(--cf-mono)',
          }}>
            {guide.category}
          </span>
        )}
        <h3 style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#1F1A14',
          marginBottom: 4,
          lineHeight: 1.35,
          fontFamily: 'var(--cf-serif)',
        }}>
          {guide.title}
        </h3>
        {guide.summary && (
          <p style={{
            fontSize: 11,
            color: '#6E6356',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {guide.summary}
          </p>
        )}
      </div>
    </Link>
  )
}

export function GuideList({ guides }) {
  if (!guides?.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>📚</span>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)' }}>
          Guides complémentaires
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {guides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  )
}
