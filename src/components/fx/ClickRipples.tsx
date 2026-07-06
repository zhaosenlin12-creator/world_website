"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  hue: number;
  size: number;
}

const HUES = [270, 280, 290, 310, 250, 220]; // 紫色调为主

export function ClickRipples({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++idRef.current;
    const hue = HUES[Math.floor(Math.random() * HUES.length)];
    const size = 60 + Math.random() * 100;
    setRipples((prev) => [...prev, { id, x, y, hue, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
  }, []);

  return (
    <div ref={containerRef} onClick={handleClick} className={`relative ${className}`}>
      {children}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)"
          }}
        >
          {/* 三层波纹 */}
          {[0, 0.15, 0.3].map((delay, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: r.size,
                height: r.size,
                borderRadius: "50%",
                transform: "translate(-50%, -50%) scale(0)",
                border: `1.5px solid hsla(${r.hue}, 90%, 75%, 0.6)`,
                background: `radial-gradient(circle, hsla(${r.hue}, 90%, 75%, 0.18) 0%, transparent 70%)`,
                animation: `ripple-out 1.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`
              }}
            />
          ))}
          {/* 中心闪光点 */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 6,
              height: 6,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, #fff 0%, hsl(${r.hue}, 90%, 75%) 50%, transparent 100%)`,
              boxShadow: `0 0 12px 4px hsla(${r.hue}, 90%, 75%, 0.8)`,
              animation: "ripple-core 1.6s ease-out forwards"
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes ripple-out {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        @keyframes ripple-core {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          30% { transform: translate(-50%, -50%) scale(1.6); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}