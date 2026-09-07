/**
 * Zentra brand mark — the single source of truth for the logo.
 * Mirrors `public/favicon.svg` (blue gradient tile + white Z from the theme's
 * --primary). If you re-theme, update the gradient here AND in the favicon.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" role="img">
      <defs>
        <linearGradient
          id="zentra-brand-g"
          x1="6"
          y1="4"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38B6FF" />
          <stop offset="1" stopColor="#1481D2" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#zentra-brand-g)" />
      <path
        d="M13 13 L35 13 L35 19 L21 30 L35 30 L35 36 L13 36 L13 30 L27 19 L13 19 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
