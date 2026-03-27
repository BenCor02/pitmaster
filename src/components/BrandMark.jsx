// PATCH: emblème de marque plus barbecue, avec flamme, grille acier et étincelle
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
          d="M10 30.5C10 29.7 10.7 29 11.5 29H36.5C37.3 29 38 29.7 38 30.5C38 31.3 37.3 32 36.5 32H11.5C10.7 32 10 31.3 10 30.5Z"
          fill="url(#steel)"
          opacity={0.95}
        />
        <path d="M14 34.5H34" stroke="url(#steelLine)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 38H32" stroke="url(#steelLine)" strokeWidth="2.2" strokeLinecap="round" opacity={0.86} />
        <path d="M17.5 27L14.2 38.6" stroke="#6E6E6E" strokeWidth="2" strokeLinecap="round" opacity={0.92} />
        <path d="M30.5 27L33.8 38.6" stroke="#6E6E6E" strokeWidth="2" strokeLinecap="round" opacity={0.92} />
        <path
          d="M26.2 4.4C27 8.6 24.3 11.9 22 14.4C19.9 16.7 18.1 18.8 18.1 22C18.1 25.5 20.6 27.9 23.7 27.9C27.6 27.9 30.5 24.8 30.5 20.7C30.5 18.5 29.7 16.8 28.8 14.7C32.7 16.6 37.3 21 37.3 27.4C37.3 34.9 31.7 40.7 23.6 40.7C15.9 40.7 10 35 10 27.8C10 21 14.1 16.6 17.6 12.8C20.9 9.4 23.6 6.5 24.4 1.6L26.2 4.4Z"
          fill="url(#ember)"
        />
        <path
          d="M23.9 16.4C24.4 18.6 22.9 20.1 21.8 21.3C20.8 22.4 20 23.4 20 25C20 26.8 21.2 28 22.9 28C25.1 28 26.7 26.2 26.7 23.9C26.7 22.7 26.3 21.7 25.8 20.4C27.9 21.5 30.3 24 30.3 27.3C30.3 31.1 27.4 34 23.4 34C19.7 34 16.9 31.2 16.9 27.8C16.9 24.4 18.9 22.2 20.6 20.4C22.1 18.8 23.3 17.5 23.7 15L23.9 16.4Z"
          fill="url(#core)"
        />
        <path
          d="M35.3 6.4L36.8 10.3L40.7 11.8L36.8 13.3L35.3 17.2L33.8 13.3L29.9 11.8L33.8 10.3L35.3 6.4Z"
          fill="#FDBA74"
          opacity={compact ? 0.85 : 1}
        />
        <path
          d="M11.5 30.5C12.8 28 16.2 26 20.2 26H27.8C31.7 26 35.2 28 36.5 30.5"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.2"
          strokeLinecap="round"
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
          <linearGradient id="steel" x1="24" y1="29" x2="24" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D0D0D0" />
            <stop offset="1" stopColor="#777777" />
          </linearGradient>
          <linearGradient id="steelLine" x1="24" y1="34.5" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B8B8B8" />
            <stop offset="1" stopColor="#666666" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
