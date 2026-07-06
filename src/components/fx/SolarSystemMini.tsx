"use client";
import { useMemo } from "react";

type Planet = {
  size: number;
  startColor: string;
  bodyColor: string;
  shadowColor: string;
  glow: string;
  duration: number;
  startAngle: number;
  reverse: boolean;
  rings?: boolean;
  atmosphere?: string;
};

const PLANETS: Planet[] = [
  { size: 7,  startColor: "#e5e7eb", bodyColor: "#9ca3af", shadowColor: "#1f2937", glow: "rgba(156,163,175,0.4)", duration: 22, startAngle: 30,  reverse: false },
  { size: 10, startColor: "#fef3c7", bodyColor: "#eab308", shadowColor: "#7c2d12", glow: "rgba(234,179,8,0.5)",   duration: 34, startAngle: 110, reverse: true,  atmosphere: "rgba(253,224,71,0.18)" },
  { size: 11, startColor: "#bae6fd", bodyColor: "#2563eb", shadowColor: "#0c1f3f", glow: "rgba(59,130,246,0.7)",  duration: 46, startAngle: 210, reverse: false, atmosphere: "rgba(125,211,252,0.22)" },
  { size: 8,  startColor: "#fecaca", bodyColor: "#dc2626", shadowColor: "#450a0a", glow: "rgba(220,38,38,0.55)",  duration: 58, startAngle: 80,  reverse: true,  atmosphere: "rgba(248,113,113,0.18)" },
  { size: 18, startColor: "#fde68a", bodyColor: "#d97706", shadowColor: "#451a03", glow: "rgba(217,119,6,0.55)",  duration: 78, startAngle: 180, reverse: false },
  { size: 15, startColor: "#fef9c3", bodyColor: "#eab308", shadowColor: "#713f12", glow: "rgba(234,179,8,0.5)",   duration: 96, startAngle: 300, reverse: true,  rings: true },
  { size: 12, startColor: "#a5f3fc", bodyColor: "#22d3ee", shadowColor: "#083344", glow: "rgba(34,211,238,0.6)",  duration: 116, startAngle: 50,  reverse: false, atmosphere: "rgba(103,232,249,0.2)" },
  { size: 11, startColor: "#93c5fd", bodyColor: "#1d4ed8", shadowColor: "#0c1f3f", glow: "rgba(29,78,216,0.7)",   duration: 132, startAngle: 250, reverse: true,  atmosphere: "rgba(96,165,250,0.22)" }
];

const ORBIT_RADII = [62, 95, 132, 170, 220, 280, 330, 375];

export function SolarSystemMini({ size = 800 }: { size?: number }) {
  const items = useMemo(() => {
    return PLANETS.map((p, i) => ({ ...p, orbit: ORBIT_RADII[i] }));
  }, []);

  const half = size / 2;

  return (
    <div
      className="relative pointer-events-none select-none"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0) 70%)"
        }}
      />

      <div
        className="absolute"
        style={{
          left: half - 24,
          top: half - 24,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "radial-gradient(circle at 32% 32%, #fff5b0 0%, #fcd34d 35%, #f59e0b 70%, #7c2d12 100%)",
          boxShadow: "0 0 50px 10px rgba(251,191,36,0.55), 0 0 110px 30px rgba(251,191,36,0.30), 0 0 180px 60px rgba(251,191,36,0.12), inset 0 0 16px rgba(255,255,255,0.6)",
          animation: "sun-pulse 5s ease-in-out infinite"
        }}
      />

      {items.map((p, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            left: half - p.orbit,
            top: half - p.orbit,
            width: p.orbit * 2,
            height: p.orbit * 2,
            borderRadius: "50%",
            border: "1px solid rgba(168, 85, 247, 0.10)",
            boxShadow: "0 0 8px rgba(168, 85, 247, 0.05)",
            animation: `spin-${idx} ${p.duration}s linear infinite${p.reverse ? " reverse" : ""}`,
            transformOrigin: "50% 50%"
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle at 32% 28%, ${p.startColor} 0%, ${p.bodyColor} 45%, ${p.shadowColor} 110%)`,
              boxShadow: `0 0 ${p.size * 1.4}px ${p.size * 0.35}px ${p.glow}, inset -2px -2px 4px rgba(0,0,0,0.45)`,
              animation: `counter-spin-${idx} ${p.duration}s linear infinite${p.reverse ? " reverse" : ""}`
            }}
          >
            {p.atmosphere && (
              <div
                style={{
                  position: "absolute",
                  inset: -p.size * 0.18,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${p.atmosphere} 30%, transparent 70%)`,
                  pointerEvents: "none"
                }}
              />
            )}
            {p.rings && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: p.size * 2.2,
                  height: p.size * 0.55,
                  transform: "translate(-50%, -50%) rotate(20deg)",
                  borderRadius: "50%",
                  border: "1.2px solid rgba(253, 224, 71, 0.55)",
                  background: "linear-gradient(90deg, transparent 0%, rgba(253,224,71,0.18) 30%, rgba(253,224,71,0.32) 50%, rgba(253,224,71,0.18) 70%, transparent 100%)",
                  boxShadow: "0 0 6px rgba(253,224,71,0.25)",
                  pointerEvents: "none"
                }}
              />
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50%      { transform: scale(1.04); filter: brightness(1.15); }
        }
        ${items.map((p, idx) => `
          @keyframes spin-${idx} {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes counter-spin-${idx} {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to   { transform: translate(-50%, -50%) rotate(-360deg); }
          }
        `).join("\n")}
      `}</style>
    </div>
  );
}