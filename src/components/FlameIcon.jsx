/**
 * Icône flamme SVG animée — logo Charbon & Flamme
 */
export default function FlameIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-flicker ${className}`}
    >
      <path
        d="M32 4C32 4 20 20 20 36C20 42.627 25.373 48 32 48C38.627 48 44 42.627 44 36C44 20 32 4 32 4Z"
        fill="url(#flame-outer)"
      />
      <path
        d="M32 20C32 20 26 30 26 38C26 41.314 28.686 44 32 44C35.314 44 38 41.314 38 38C38 30 32 20 32 20Z"
        fill="url(#flame-inner)"
      />
      <path
        d="M32 32C32 32 29 36 29 39C29 40.657 30.343 42 32 42C33.657 42 35 40.657 35 39C35 36 32 32 32 32Z"
        fill="#FDE68A"
      />
      {/* Étincelles */}
      <circle cx="22" cy="18" r="1.5" fill="#F97316" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="18;12;18" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="16" r="1" fill="#FB923C" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="16;10;16" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="36" cy="10" r="1" fill="#FDBA74" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* Charbon en bas */}
      <ellipse cx="32" cy="54" rx="16" ry="4" fill="#292524" />
      <ellipse cx="32" cy="54" rx="14" ry="3" fill="#44403C" />
      <ellipse cx="30" cy="53" rx="3" ry="1.5" fill="#DC2626" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="36" cy="54" rx="2" ry="1" fill="#F97316" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
      </ellipse>
      <defs>
        <linearGradient id="flame-outer" x1="32" y1="4" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="0.4" stopColor="#F97316" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="32" y1="20" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
    </svg>
  )
}
