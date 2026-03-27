// PATCH: emblème de marque plus premium, avec braise + étincelle au lieu du simple badge "CF"
export default function BrandMark({ size = 42, compact = false }) {
  const radius = Math.max(12, Math.round(size * 0.3))

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(180deg, #1f1f1f, #111111)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 24px rgba(0,0,0,0.22)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 68% 28%, rgba(249,115,22,0.18), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M26.5 4.5C27.4 9 24.4 12.5 21.9 15.2C19.6 17.6 17.7 19.9 17.7 23.4C17.7 27 20.4 29.6 23.7 29.6C27.9 29.6 31.1 26.2 31.1 21.7C31.1 19.3 30.3 17.4 29.2 15.1C33.3 17.1 38.2 22 38.2 29.1C38.2 37.3 32.2 43.5 23.6 43.5C15.5 43.5 9.1 37.5 9.1 29.7C9.1 22.3 13.4 17.6 17.2 13.6C20.7 10 23.7 6.9 24.6 1.5L26.5 4.5Z"
          fill="url(#ember)"
        />
        <path
          d="M24.1 17.7C24.6 20 23.1 21.7 21.8 23.1C20.6 24.3 19.7 25.5 19.7 27.3C19.7 29.3 21.1 30.7 22.9 30.7C25.4 30.7 27.3 28.6 27.3 25.9C27.3 24.5 26.8 23.3 26.2 21.9C28.6 23.1 31.3 25.9 31.3 29.8C31.3 34.2 28 37.5 23.4 37.5C19.1 37.5 15.8 34.3 15.8 30.2C15.8 26.3 18.1 23.8 20.1 21.7C21.9 19.8 23.4 18.2 23.9 15.4L24.1 17.7Z"
          fill="url(#core)"
        />
        <path
          d="M35.3 6.4L36.8 10.3L40.7 11.8L36.8 13.3L35.3 17.2L33.8 13.3L29.9 11.8L33.8 10.3L35.3 6.4Z"
          fill="#FDBA74"
          opacity={compact ? 0.85 : 1}
        />
        <defs>
          <linearGradient id="ember" x1="23.7" y1="1.5" x2="23.7" y2="43.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A36" />
            <stop offset="0.48" stopColor="#E53935" />
            <stop offset="1" stopColor="#9A1B1B" />
          </linearGradient>
          <linearGradient id="core" x1="23.55" y1="15.4" x2="23.55" y2="37.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD39A" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
