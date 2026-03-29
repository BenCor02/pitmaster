/**
 * Logo Charbon & Flamme — Flamme BBQ agressive, style premium
 * Flamme large et dynamique (pas bougie), avec braises
 */

export function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lf-main" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#7c2d12"/>
          <stop offset="40%" stopColor="#c2410c"/>
          <stop offset="75%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#fdba74"/>
        </linearGradient>
        <linearGradient id="lf-left" x1="0.3" y1="1" x2="0.7" y2="0">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <linearGradient id="lf-right" x1="0.7" y1="1" x2="0.3" y2="0">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
        <linearGradient id="lf-core" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#fef3c7"/>
        </linearGradient>
      </defs>

      {/* Flamme gauche — mèche qui part sur le côté */}
      <path d="M20 52 C14 44 10 36 13 26 C15 20 20 16 22 22 C24 28 22 36 24 42 C25 46 22 50 20 52Z"
        fill="url(#lf-left)" opacity="0.7"/>

      {/* Flamme droite — mèche symétrique */}
      <path d="M44 52 C50 44 54 36 51 26 C49 20 44 16 42 22 C40 28 42 36 40 42 C39 46 42 50 44 52Z"
        fill="url(#lf-right)" opacity="0.7"/>

      {/* Flamme principale — large, BBQ style */}
      <path d="M32 4
        C32 4 16 18 16 36
        C16 42 18.5 47 23 51
        C23 44 26 38 32 34
        C38 38 41 44 41 51
        C45.5 47 48 42 48 36
        C48 18 32 4 32 4Z"
        fill="url(#lf-main)"/>

      {/* Coeur jaune vif — chaleur intense */}
      <path d="M32 28
        C32 28 25 36 25 42
        C25 46 28 49 32 50
        C36 49 39 46 39 42
        C39 36 32 28 32 28Z"
        fill="url(#lf-core)" opacity="0.85"/>

      {/* Braises en bas */}
      <circle cx="24" cy="56" r="2.5" fill="#f97316" opacity="0.5"/>
      <circle cx="32" cy="58" r="2" fill="#fb923c" opacity="0.4"/>
      <circle cx="40" cy="56" r="2.5" fill="#f97316" opacity="0.5"/>
      <circle cx="28" cy="57" r="1.5" fill="#fdba74" opacity="0.3"/>
      <circle cx="36" cy="57" r="1.5" fill="#fdba74" opacity="0.3"/>
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
