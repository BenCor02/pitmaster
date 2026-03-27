// PATCH: emblème de marque refait plus radicalement pour lire "barbecue" au premier regard
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
        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), transparent 40%), linear-gradient(180deg, #202020, #0f0f0f)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -16px 28px rgba(0,0,0,0.24), 0 12px 24px rgba(0,0,0,0.22)',
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
            'radial-gradient(circle at 68% 28%, rgba(249,115,22,0.22), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      <svg
        width={Math.round(size * 0.74)}
        height={Math.round(size * 0.74)}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 32.5C10 30.6 11.6 29 13.5 29H42.5C44.4 29 46 30.6 46 32.5C46 34.4 44.4 36 42.5 36H13.5C11.6 36 10 34.4 10 32.5Z"
          fill="url(#grill)"
        />
        <path d="M16 40.5H40" stroke="#8C8C8C" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18.5 27.5L15.2 41.8" stroke="#767676" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M37.5 27.5L40.8 41.8" stroke="#767676" strokeWidth="2.2" strokeLinecap="round" />
        {!compact && (
          <>
            <path d="M20 28.8L18.4 36" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeLinecap="round" />
            <path d="M28 28.8L28 36" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeLinecap="round" />
            <path d="M36 28.8L37.6 36" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeLinecap="round" />
          </>
        )}
        <path
          d="M29.8 6C30.9 11.5 27.4 15 24.7 17.9C22.2 20.4 20.4 22.8 20.4 26.1C20.4 29.7 23.1 32.1 26.3 32.1C30.5 32.1 33.5 28.8 33.5 24.4C33.5 22 32.7 20.1 31.6 17.8C35.8 19.8 40.8 24.6 40.8 31.8C40.8 39.8 34.8 45.8 26.2 45.8C18.1 45.8 11.7 39.8 11.7 32.2C11.7 24.9 16 20.4 19.8 16.5C23.3 12.9 26.3 9.8 27.2 4.8L29.8 6Z"
          fill="url(#ember)"
        />
        <path
          d="M26.8 18.8C27.3 21.3 25.7 23 24.3 24.4C23 25.8 22 27.1 22 29C22 31.1 23.5 32.6 25.5 32.6C28.1 32.6 30 30.5 30 27.7C30 26.3 29.5 25.1 28.9 23.7C31.4 25 34.2 28 34.2 32C34.2 36.5 30.9 39.8 26.2 39.8C21.8 39.8 18.5 36.6 18.5 32.5C18.5 28.5 20.9 25.9 22.9 23.8C24.8 21.9 26.3 20.2 26.7 17.2L26.8 18.8Z"
          fill="url(#core)"
        />
        <path
          d="M41.7 9.2L43.6 13.8L48.2 15.7L43.6 17.6L41.7 22.2L39.8 17.6L35.2 15.7L39.8 13.8L41.7 9.2Z"
          fill="#FDBA74"
          opacity={compact ? 0.85 : 1}
        />
        <defs>
          <linearGradient id="ember" x1="26.25" y1="4.8" x2="26.25" y2="45.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A36" />
            <stop offset="0.48" stopColor="#E53935" />
            <stop offset="1" stopColor="#9A1B1B" />
          </linearGradient>
          <linearGradient id="core" x1="26.35" y1="17.2" x2="26.35" y2="39.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD39A" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="grill" x1="28" y1="29" x2="28" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D5D5D5" />
            <stop offset="1" stopColor="#717171" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
