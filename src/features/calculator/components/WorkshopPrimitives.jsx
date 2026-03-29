export const WORKSHOP_PAGE_CSS = `
  .workshop-page {
    font-family: 'DM Sans', sans-serif;
    display: grid;
    gap: 16px;
  }

  .workshop-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .workshop-stat-card {
    background: linear-gradient(180deg, #1a1a1a, #161616);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: var(--shadow-soft);
  }

  .workshop-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    color: var(--text);
  }

  .workshop-stat-label {
    margin-top: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--text3);
  }

  .workshop-stat-copy {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text3);
    line-height: 1.6;
  }

  .workshop-state-shell {
    padding: 34px 24px;
    text-align: center;
  }

  .workshop-state-icon {
    font-size: 46px;
    margin-bottom: 12px;
  }

  .workshop-state-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 8px;
  }

  .workshop-state-copy {
    max-width: 560px;
    margin: 0 auto 18px;
    font-size: 13px;
    color: var(--text3);
    line-height: 1.7;
  }

  .workshop-state-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .workshop-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    flex-wrap: wrap;
  }

  .workshop-filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .workshop-filter {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, #1a1a1a, #161616);
    color: var(--text3);
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .workshop-filter:hover {
    border-color: var(--border2);
    color: var(--text);
  }

  .workshop-filter.active {
    border-color: var(--orange-border);
    background: var(--orange-bg);
    color: var(--ember);
  }

  .workshop-filter.danger {
    color: #fb7185;
    border-color: rgba(251,113,133,0.24);
  }

  .workshop-record {
    background: linear-gradient(180deg, #1a1a1a, #161616);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 18px;
    box-shadow: var(--shadow-soft);
  }

  .workshop-record-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .workshop-record-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.05;
  }

  .workshop-record-meta {
    margin-top: 5px;
    font-size: 12px;
    color: var(--text3);
  }

  .workshop-chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .workshop-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: #111111;
    color: var(--text2);
    font-size: 11px;
    font-family: 'DM Mono', monospace;
  }

  .workshop-note {
    margin-top: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #111111;
    border: 1px solid var(--border);
    color: var(--text2);
    font-size: 13px;
    line-height: 1.7;
  }

  .workshop-divider {
    height: 1px;
    margin: 14px 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }

  @media (max-width: 900px) {
    .workshop-stat-grid {
      grid-template-columns: 1fr;
    }
  }
`

export function WorkshopHero({ kicker, title, copy, children }) {
  return (
    <div className="pm-hero-shell">
      {kicker ? <div className="pm-kicker" style={{ marginBottom: 12 }}>{kicker}</div> : null}
      <div style={{ marginBottom: copy || children ? 10 : 0 }}>
        <h1 style={{ marginBottom: copy ? 8 : 0 }}>{title}</h1>
        {copy ? (
          <p style={{ maxWidth: 760 }}>{copy}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function WorkshopStateCard({ icon, title, copy, actions }) {
  return (
    <div className="pm-card">
      <div className="workshop-state-shell">
        <div className="workshop-state-icon">{icon}</div>
        <div className="workshop-state-title">{title}</div>
        <div className="workshop-state-copy">{copy}</div>
        {actions ? <div className="workshop-state-actions">{actions}</div> : null}
      </div>
    </div>
  )
}

export function WorkshopStatGrid({ items }) {
  return (
    <div className="workshop-stat-grid">
      {items.map((item) => (
        <div key={item.label} className="workshop-stat-card">
          <div className="workshop-stat-value" style={item.color ? { color: item.color } : undefined}>{item.value}</div>
          <div className="workshop-stat-label">{item.label}</div>
          {item.copy ? <div className="workshop-stat-copy">{item.copy}</div> : null}
        </div>
      ))}
    </div>
  )
}

export function WorkshopToolbar({ eyebrow, title, copy, actions }) {
  return (
    <div className="workshop-toolbar">
      <div>
        {eyebrow ? <div className="pm-sec-label">{eyebrow}</div> : null}
        {title ? (
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.08 }}>
            {title}
          </div>
        ) : null}
        {copy ? (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
            {copy}
          </div>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
