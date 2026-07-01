"use client";
import { useEffect, useRef } from "react";

export function GalaxyField({ density = 180 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = (canvas.width = window.innerWidth * dpr);
    let h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);

    type Star = { x: number; y: number; z: number; c: string; s: number; tw: number };
    const colors = ["#fbbf24", "#a78bfa", "#f472b6", "#22d3ee", "#34d399", "#fff"];
    const stars: Star[] = Array.from({ length: density }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1.2 + 0.1,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 1.4 + 0.4,
      tw: Math.random() * Math.PI * 2
    }));

    let raf = 0;
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      my = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      grd.addColorStop(0, "rgba(168, 85, 247, 0.10)");
      grd.addColorStop(0.5, "rgba(59, 130, 246, 0.05)");
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.02;
        const alpha = 0.5 + 0.5 * Math.sin(s.tw) * s.z;
        const px = s.x + mx * 30 * s.z;
        const py = s.y + my * 30 * s.z;
        const size = s.s * s.z;
        ctx.beginPath();
        ctx.fillStyle = s.c;
        ctx.globalAlpha = alpha;
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        if (s.s > 1) {
          ctx.shadowColor = s.c;
          ctx.shadowBlur = 8 * s.z;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}
