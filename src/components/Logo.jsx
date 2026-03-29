/**
 * Logo Charbon & Flamme — Flamme géométrique minimaliste
 * Variantes : icon (flamme seule), full (flamme + texte)
 */

export function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (56/48)}
      className={className}
    >
      <defs>
        <linearGradient id="logo-fg" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#c2410c"/>
          <stop offset="50%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <linearGradient id="logo-ig" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#fdba74"/>
        </linearGradient>
      </defs>
      <path d="M24 2
        C24 2 8 18 8 34
        C8 41 10.5 47 15 51
        C16 44.5 18.5 40 24 37
        C29.5 40 32 44.5 33 51
        C37.5 47 40 41 40 34
        C40 18 24 2 24 2Z"
        fill="url(#logo-fg)"/>
      <path d="M24 20
        C24 20 17.5 29 17.5 36
        C17.5 39.5 19.5 43 24 45
        C28.5 43 30.5 39.5 30.5 36
        C30.5 29 24 20 24 20Z"
        fill="url(#logo-ig)" opacity="0.9"/>
      <circle cx="24" cy="40.5" r="2.8" fill="#fff" opacity="0.85"/>
    </svg>
  )
}

export function LogoFull({ iconSize = 28, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <div className="flex flex-col leading-none">
        <span className="text-[14px] font-extrabold tracking-wide text-white">
          CHARBON
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] text-orange-400/80">
          &amp; FLAMME
        </span>
      </div>
    </div>
  )
}

export default LogoFull
