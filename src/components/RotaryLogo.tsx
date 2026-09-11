/**
 * Logotipo de Rotary (wordmark + rueda) en SVG con los colores oficiales.
 * Si el club cuenta con el archivo oficial del Brand Center, se puede
 * sustituir este componente por una <img> a /public/rotary-logo.svg.
 */
export function RotaryLogo({ className = "" }: { className?: string }) {
  const teeth = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  const spokes = Array.from({ length: 6 }, (_, i) => (i * 360) / 6);
  return (
    <svg
      viewBox="0 0 330 100"
      className={className}
      role="img"
      aria-label="Rotary"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="72"
        fontFamily="Open Sans, Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="64"
        fill="#17458f"
        letterSpacing="-1"
      >
        Rotary
      </text>
      <g transform="translate(280 50)">
        {teeth.map((a) => (
          <rect
            key={a}
            x="-5"
            y="-48"
            width="10"
            height="12"
            fill="#f7a81b"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="40" fill="#f7a81b" />
        <circle r="31" fill="#fff" />
        <circle r="28" fill="#f7a81b" />
        {spokes.map((a) => (
          <rect
            key={a}
            x="-3.5"
            y="-28"
            width="7"
            height="56"
            fill="#fff"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="11" fill="#f7a81b" />
        <circle r="5" fill="#fff" />
        <rect x="-2" y="-7" width="4" height="4" fill="#17458f" />
      </g>
    </svg>
  );
}
