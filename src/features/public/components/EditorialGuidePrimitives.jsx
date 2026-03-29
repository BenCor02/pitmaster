export const EDITORIAL_GUIDE_CSS = `
  .editorial-guide-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, rgba(229,57,53,0.08), transparent 24%),
      linear-gradient(180deg, #0a0a0a 0%, #090909 42%, #070707 100%);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
  }

  .editorial-guide-shell {
    max-width: 1240px;
    margin: 0 auto;
    padding: 110px 24px 72px;
    display: grid;
    gap: 18px;
  }

  .editorial-guide-hero {
    position: relative;
    overflow: hidden;
    border-radius: 30px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(160deg, rgba(26,26,26,0.98), rgba(10,10,10,0.98));
    box-shadow: var(--shadow-lg);
    min-height: 500px;
  }

  .editorial-guide-hero-media,
  .editorial-guide-hero-overlay,
  .editorial-guide-hero-noise {
    position: absolute;
    inset: 0;
  }

  .editorial-guide-hero-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.9) contrast(1.05) brightness(0.62);
  }

  .editorial-guide-hero-overlay {
    background:
      linear-gradient(90deg, rgba(8,8,8,0.92), rgba(8,8,8,0.42)),
      linear-gradient(180deg, rgba(8,8,8,0.1), rgba(8,8,8,0.9));
  }

  .editorial-guide-hero-noise {
    opacity: 0.12;
    pointer-events: none;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0);
    background-size: 22px 22px;
  }

  .editorial-guide-hero-body {
    position: relative;
    z-index: 1;
    min-height: 500px;
    padding: 32px;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
    gap: 18px;
    align-items: end;
  }

  .editorial-guide-hero-copy {
    display: grid;
    gap: 16px;
    align-content: end;
    max-width: 760px;
  }

  .editorial-guide-title {
    margin: 0;
    font-family: 'Oswald', sans-serif;
    font-size: clamp(44px, 7vw, 90px);
    line-height: 0.92;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--text);
    text-shadow: 0 18px 44px rgba(0,0,0,0.34);
  }

  .editorial-guide-copy {
    margin: 0;
    font-size: 16px;
    line-height: 1.7;
    color: var(--text2);
    max-width: 720px;
  }

  .editorial-guide-chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .editorial-guide-chip {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: var(--text2);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .editorial-guide-action-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .editorial-guide-stat-stack {
    display: grid;
    gap: 12px;
    align-content: end;
  }

  .editorial-guide-stat-card {
    padding: 16px 18px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(12,12,12,0.58);
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 34px rgba(0,0,0,0.24);
  }

  .editorial-guide-stat-label {
    margin-bottom: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.54);
  }

  .editorial-guide-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.05;
  }

  .editorial-guide-stat-copy {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--text3);
  }

  .editorial-guide-section {
    display: grid;
    gap: 14px;
  }

  .editorial-guide-section[data-tone="panel"] .editorial-guide-panel {
    background: linear-gradient(180deg, #1a1a1a, #161616);
  }

  .editorial-guide-panel {
    position: relative;
    overflow: hidden;
    padding: 24px;
    border-radius: 22px;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, #161616, #121212);
    box-shadow: var(--shadow-soft);
  }

  .editorial-guide-panel::before {
    content: "";
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, rgba(249,115,22,0.2), transparent 58%);
    pointer-events: none;
  }

  .editorial-guide-section-head {
    display: grid;
    gap: 8px;
    max-width: 860px;
  }

  .editorial-guide-section-title {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: clamp(26px, 4vw, 42px);
    font-weight: 800;
    line-height: 1.02;
    color: var(--text);
  }

  .editorial-guide-section-copy {
    margin: 0;
    font-size: 14px;
    color: var(--text2);
    line-height: 1.75;
  }

  .editorial-guide-card-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .editorial-guide-card {
    padding: 18px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  }

  .editorial-guide-card-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.02;
    letter-spacing: 0.02em;
  }

  .editorial-guide-card-copy {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text3);
  }

  .editorial-guide-highlight-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .editorial-guide-highlight {
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(198,40,40,0.14), rgba(198,40,40,0.04));
    border: 1px solid rgba(198,40,40,0.24);
  }

  .editorial-guide-highlight-label {
    margin-bottom: 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--ember);
  }

  .editorial-guide-highlight-value {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.08;
  }

  .editorial-guide-highlight-copy {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--text3);
  }

  .editorial-guide-cta {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    padding: 22px 24px;
    border-radius: 22px;
    border: 1px solid rgba(198,40,40,0.24);
    background:
      radial-gradient(circle at top right, rgba(229,57,53,0.14), transparent 32%),
      linear-gradient(180deg, rgba(24,24,24,0.98), rgba(12,12,12,0.98));
    box-shadow: var(--shadow-soft);
  }

  .editorial-guide-cta-copy {
    max-width: 700px;
  }

  .editorial-guide-cta-title {
    margin: 0 0 8px;
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--text);
  }

  .editorial-guide-cta-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: var(--text2);
  }

  @media (max-width: 1100px) {
    .editorial-guide-hero-body,
    .editorial-guide-cta {
      grid-template-columns: 1fr;
    }

    .editorial-guide-highlight-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 780px) {
    .editorial-guide-shell {
      padding: 98px 16px 52px;
    }

    .editorial-guide-hero {
      min-height: 0;
    }

    .editorial-guide-hero-body {
      min-height: 0;
      padding: 18px;
      gap: 14px;
    }

    .editorial-guide-title {
      font-size: clamp(38px, 13vw, 68px);
    }

    .editorial-guide-copy {
      font-size: 14px;
    }

    .editorial-guide-card-grid {
      grid-template-columns: 1fr;
    }

    .editorial-guide-panel,
    .editorial-guide-cta {
      padding: 18px;
      border-radius: 18px;
    }
  }
`

function renderTextItem(item, fallbackLabel) {
  if (typeof item === 'string') {
    return { title: item, copy: '', label: fallbackLabel }
  }
  return {
    title: item?.title || item?.label || fallbackLabel,
    copy: item?.copy || item?.description || item?.body || '',
    label: item?.label || fallbackLabel,
  }
}

export function EditorialGuideHero({
  image,
  kicker,
  title,
  copy,
  chips = [],
  stats = [],
  primaryAction,
  secondaryAction,
}) {
  return (
    <section className="editorial-guide-hero">
      <div className="editorial-guide-hero-media">
        <img src={image} alt={title} />
      </div>
      <div className="editorial-guide-hero-overlay" />
      <div className="editorial-guide-hero-noise" />
      <div className="editorial-guide-hero-body">
        <div className="editorial-guide-hero-copy">
          {kicker ? <div className="pm-kicker">{kicker}</div> : null}
          <h1 className="editorial-guide-title">{title}</h1>
          {copy ? <p className="editorial-guide-copy">{copy}</p> : null}
          {chips.length ? (
            <div className="editorial-guide-chip-row">
              {chips.map((chip) => <div key={chip} className="editorial-guide-chip">{chip}</div>)}
            </div>
          ) : null}
          {(primaryAction || secondaryAction) ? (
            <div className="editorial-guide-action-row">
              {primaryAction}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        <div className="editorial-guide-stat-stack">
          {stats.map((item) => (
            <div key={item.label} className="editorial-guide-stat-card">
              <div className="editorial-guide-stat-label">{item.label}</div>
              <div className="editorial-guide-stat-value">{item.value}</div>
              {item.copy ? <div className="editorial-guide-stat-copy">{item.copy}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditorialGuideSection({ eyebrow, title, copy, children, tone = 'default' }) {
  return (
    <section className="editorial-guide-section" data-tone={tone}>
      <div className="editorial-guide-panel">
        {(eyebrow || title || copy) ? (
          <div className="editorial-guide-section-head" style={{ marginBottom: children ? 16 : 0 }}>
            {eyebrow ? <div className="pm-kicker">{eyebrow}</div> : null}
            {title ? <h2 className="editorial-guide-section-title">{title}</h2> : null}
            {copy ? <p className="editorial-guide-section-copy">{copy}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export function EditorialGuideCards({ items, fallbackLabel = 'Repère' }) {
  return (
    <div className="editorial-guide-card-grid">
      {items.map((rawItem, index) => {
        const item = renderTextItem(rawItem, `${fallbackLabel} ${index + 1}`)
        return (
          <div key={`${item.title}-${index}`} className="editorial-guide-card">
            <div className="editorial-guide-card-title">{item.title}</div>
            {item.copy ? <div className="editorial-guide-card-copy">{item.copy}</div> : null}
          </div>
        )
      })}
    </div>
  )
}

export function EditorialGuideHighlights({ items }) {
  return (
    <div className="editorial-guide-highlight-grid">
      {items.map((item) => (
        <div key={item.label} className="editorial-guide-highlight">
          <div className="editorial-guide-highlight-label">{item.label}</div>
          <div className="editorial-guide-highlight-value">{item.value}</div>
          {item.copy ? <div className="editorial-guide-highlight-copy">{item.copy}</div> : null}
        </div>
      ))}
    </div>
  )
}

export function EditorialGuideCta({ eyebrow, title, copy, primaryAction, secondaryAction }) {
  return (
    <section className="editorial-guide-cta">
      <div className="editorial-guide-cta-copy">
        {eyebrow ? <div className="pm-kicker" style={{ marginBottom: 12 }}>{eyebrow}</div> : null}
        <h2 className="editorial-guide-cta-title">{title}</h2>
        {copy ? <p className="editorial-guide-cta-text">{copy}</p> : null}
      </div>
      <div className="editorial-guide-action-row" style={{ justifyContent: 'flex-start' }}>
        {primaryAction}
        {secondaryAction}
      </div>
    </section>
  )
}
