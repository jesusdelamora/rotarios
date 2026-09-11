import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Rueda de Rotary sobre fondo azul Rotary, para iOS (pantalla de inicio).
export default function AppleIcon() {
  const teeth = Array.from({ length: 24 }, (_, i) => i * 15);
  const spokes = Array.from({ length: 6 }, (_, i) => i * 60);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17458f",
        }}
      >
        <svg width="160" height="160" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
          <g fill="#f7a81b">
            {teeth.map((a) => (
              <rect key={a} x="-5" y="-48" width="10" height="12" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r="40" fill="#f7a81b" />
          <circle r="31" fill="#17458f" />
          <circle r="28" fill="#f7a81b" />
          <g fill="#17458f">
            {spokes.map((a) => (
              <rect key={a} x="-3.5" y="-28" width="7" height="56" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r="11" fill="#f7a81b" />
          <circle r="5" fill="#17458f" />
          <rect x="-2" y="-7" width="4" height="4" fill="#f7a81b" />
        </svg>
      </div>
    ),
    size,
  );
}
