function ProductCard({ product }) {
  return (
    <a
      href={product.affiliate_url || '#'}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'grid',
        gridTemplateColumns: product.image_url ? '72px 1fr' : '1fr',
        gap: 12,
        padding: 12,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        textDecoration: 'none',
      }}
    >
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
      ) : null}
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{product.name}</div>
        {product.description ? (
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{product.description}</div>
        ) : null}
        {product.rating ? (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>Note {product.rating}/5</div>
        ) : null}
      </div>
    </a>
  )
}

function SeoBlockCard({ block }) {
  const hasProducts = Array.isArray(block.products) && block.products.length > 0
  const cardBorder = block.block_type === 'bloc_conseil' ? 'rgba(245,166,35,0.18)' : 'rgba(232,69,11,0.18)'
  const ctaHref = block.affiliate_link || block.cta_link || '#'

  return (
    <article
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,24,0.98), rgba(12,12,12,0.98))',
        border: `1px solid ${cardBorder}`,
        borderRadius: 20,
        padding: 18,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div>
          {block.badge ? (
            <div className="pm-kicker" style={{ marginBottom: 8 }}>{block.badge}</div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {block.icon ? <span style={{ fontSize: 18 }}>{block.icon}</span> : null}
            <h3 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>{block.title}</h3>
          </div>
          {block.title_secondary ? (
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{block.title_secondary}</div>
          ) : null}
        </div>
        {block.note ? (
          <div style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', fontSize: 10, color: 'var(--text3)', maxWidth: 160, textAlign: 'right' }}>
            {block.note}
          </div>
        ) : null}
      </div>

      {block.image_url ? (
        <img
          src={block.image_url}
          alt={block.title}
          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, marginBottom: 12, display: 'block' }}
          loading="lazy"
        />
      ) : null}

      {block.content ? (
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: hasProducts || block.cta_text ? 14 : 0 }}>
          {block.content}
        </div>
      ) : null}

      {hasProducts ? (
        <div className="calc-seo-grid" style={{ marginBottom: block.cta_text ? 14 : 0 }}>
          {block.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {block.cta_text ? (
        <a
          href={ctaHref}
          target={block.affiliate_link ? '_blank' : undefined}
          rel={block.affiliate_link ? 'noreferrer' : undefined}
          className={block.block_type === 'bloc_conseil' ? 'pm-btn-secondary' : 'pm-btn-primary'}
          style={{ width: 'auto', padding: '12px 16px', textDecoration: 'none', display: 'inline-flex' }}
        >
          {block.cta_text}
        </a>
      ) : null}
    </article>
  )
}

export default function SeoBlocksSection({ title, kicker, blocks }) {
  if (!blocks?.length) return null

  return (
    <section style={{ marginBottom: 12 }}>
      {(title || kicker) ? (
        <div className="pm-card" style={{ marginBottom: 12 }}>
          {kicker ? <div className="pm-kicker" style={{ marginBottom: 8 }}>{kicker}</div> : null}
          {title ? (
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
              {title}
            </div>
          ) : null}
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {blocks.map((block) => (
          <SeoBlockCard key={block.id} block={block} />
        ))}
      </div>
    </section>
  )
}
