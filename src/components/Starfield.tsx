"use client";
import { useEffect, useRef } from "react";

/** Renders a parallax starfield on a canvas. Pointer-driven parallax + twinkle. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    type Star = { x: number; y: number; z: number; r: number; t: number; ts: number; c: string };
    const stars: Star[] = [];
    const colors = ["#ffffff", "#c4b5fd", "#a5b4fc", "#f0abfc", "#fde68a", "#bae6fd"];
    const count = 380;
    for (let i = 0; i < count; i++) {
      const z = Math.random();
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        r: 0.3 + z * 1.8,
        t: Math.random() * Math.PI * 2,
        ts: 0.01 + Math.random() * 0.04,
        c: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // occasional shooting stars
    const shooters: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    const mouse = { x: w / 2, y: h / 2, px: w / 2, py: h / 2 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      // smoothing parallax
      mouse.px += (mouse.x - mouse.px) * 0.05;
      mouse.py += (mouse.y - mouse.py) * 0.05;
      const offX = (mouse.px - w / 2) * 0.04;
      const offY = (mouse.py - h / 2) * 0.04;

      for (const s of stars) {
        s.t += s.ts;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.t));
        const x = s.x + offX * s.z;
        const y = s.y + offY * s.z + Math.sin(s.t * 0.3) * (0.5 + s.z * 0.8);
        ctx.beginPath();
        ctx.fillStyle = s.c;
        ctx.globalAlpha = tw * (0.4 + s.z * 0.6);
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // glow
        if (s.r > 1.2) {
          ctx.globalAlpha = tw * 0.15;
          ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // occasionally spawn a shooting star
      if (Math.random() < 0.005) {
        shooters.push({ x: -50, y: Math.random() * h * 0.5, vx: 6 + Math.random() * 4, vy: 2 + Math.random() * 2, life: 0 });
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.life += 1;
        s.x += s.vx; s.y += s.vy;
        const grd = ctx.createLinearGradient(s.x - s.vx * 8, s.y - s.vy * 8, s.x, s.y);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        if (s.x > w + 80 || s.life > 120) shooters.splice(i, 1);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.95 }}
      aria-hidden
    />
  );
}
