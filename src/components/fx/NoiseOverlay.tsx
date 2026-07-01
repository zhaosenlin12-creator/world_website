"use client";
// Static noise / grain overlay - reactbits style.
export function NoiseOverlay({ opacity = 0.06 }: { opacity?: number }) {
  const noise = "data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>";
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: "url(" + noise + ")"
      }}
    />
  );
}
