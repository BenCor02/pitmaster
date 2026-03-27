// PATCH: emblème de marque refait en badge BBQ beaucoup plus distinct, pour casser totalement l'ancien rendu
export default function BrandMark({ size = 42, compact = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 4L53.5 13.5V33.5C53.5 45 44.6 54.8 32 60C19.4 54.8 10.5 45 10.5 33.5V13.5L32 4Z"
          fill="url(#badge)"
        />
        <path
          d="M32 6.8L51 15.2V33.1C51 43.1 43.3 51.9 32 56.8C20.7 51.9 13 43.1 13 33.1V15.2L32 6.8Z"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.4"
        />
        <path
          d="M17 37.5C17 35.8 18.3 34.5 20 34.5H44C45.7 34.5 47 35.8 47 37.5C47 39.2 45.7 40.5 44 40.5H20C18.3 40.5 17 39.2 17 37.5Z"
          fill="url(#grill)"
        />
        <path d="M21 44.5H43" stroke="url(#steelLine)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23.5 32.6L20 45.6" stroke="#7B7B7B" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M32 32.4V45.4" stroke="#8E8E8E" strokeWidth="1.9" strokeLinecap="round" opacity={compact ? 0.55 : 0.92} />
        <path d="M40.5 32.6L44 45.6" stroke="#7B7B7B" strokeWidth="2.1" strokeLinecap="round" />
        <path
          d="M34.7 10.3C35.8 15.5 32.4 18.7 29.8 21.3C27.5 23.6 25.8 25.7 25.8 28.7C25.8 32 28.2 34.2 31.2 34.2C35.1 34.2 37.9 31.1 37.9 27.1C37.9 24.9 37.2 23.2 36.2 21.1C40 22.9 44.5 27.4 44.5 34C44.5 41.3 39 46.8 31.2 46.8C23.8 46.8 18 41.3 18 34.3C18 27.6 22 23.5 25.5 19.9C28.7 16.6 31.4 13.8 32.3 9.2L34.7 10.3Z"
          fill="url(#ember)"
        />
        <path
          d="M31.8 21.4C32.3 23.7 30.9 25.3 29.6 26.6C28.5 27.8 27.6 29 27.6 30.7C27.6 32.6 29 34 30.8 34C33.2 34 34.9 32 34.9 29.5C34.9 28.2 34.5 27.1 33.9 25.8C36.2 27 38.8 29.8 38.8 33.5C38.8 37.7 35.7 40.7 31.3 40.7C27.2 40.7 24.1 37.8 24.1 34C24.1 30.3 26.3 27.8 28.2 25.9C29.9 24.1 31.3 22.6 31.7 19.8L31.8 21.4Z"
          fill="url(#core)"
        />
        <path
          d="M45.6 12L47.1 15.7L50.8 17.2L47.1 18.7L45.6 22.4L44.1 18.7L40.4 17.2L44.1 15.7L45.6 12Z"
          fill="#FDBA74"
          opacity={compact ? 0.85 : 1}
        />
        <defs>
          <linearGradient id="badge" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#262626" />
            <stop offset="1" stopColor="#0F0F0F" />
          </linearGradient>
          <linearGradient id="ember" x1="31.25" y1="9.2" x2="31.25" y2="46.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A36" />
            <stop offset="0.48" stopColor="#E53935" />
            <stop offset="1" stopColor="#9A1B1B" />
          </linearGradient>
          <linearGradient id="core" x1="31.45" y1="19.8" x2="31.45" y2="40.7" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD39A" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="grill" x1="32" y1="34.5" x2="32" y2="40.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D5D5D5" />
            <stop offset="1" stopColor="#717171" />
          </linearGradient>
          <linearGradient id="steelLine" x1="32" y1="44.5" x2="32" y2="44.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D0D0D0" />
            <stop offset="1" stopColor="#767676" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
