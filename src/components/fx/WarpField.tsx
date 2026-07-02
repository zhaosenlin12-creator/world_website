"use client";
import { useEffect, useRef } from "react";

export function WarpField({ speed = 1, density = 240 }: { speed?: number; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = window.innerWidth;
    let h = window.innerHeight;
    const fit = () => {
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    type Star = { x: number; y: number; z: number; pz: number; c: string };
    const palette = ["#fbbf24", "#a78bfa", "#f472b6", "#22d3ee", "#34d399", "#fff", "#fde68a", "#c4b5fd"];
    const stars: Star[] = Array.from({ length: density }).map(() => {
      const z = Math.random();
      return {
        x: (Math.random() - 0.5) * w,
        y: (Math.random() - 0.5) * h,
        z,
        pz: z,
        c: palette[Math.floor(Math.random() * palette.length)]
      };
    });

    // 涓ぎ寰勫悜鍏夋檿
    let raf = 0;
    const tick = () => {
      // 鎷栧熬鏁堟灉: 鐢ㄥ崐閫忔槑榛戣鐩?      ctx.fillStyle = "rgba(2, 6, 23, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // 涓績鍏夋檿
      const cx = w / 2, cy = h / 2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
      grd.addColorStop(0, "rgba(168, 85, 247, 0.15)");
      grd.addColorStop(0.3, "rgba(59, 130, 246, 0.05)");
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // 鏄熺┖鎺ㄨ繘
      for (const s of stars) {
        s.pz = s.z;
        s.z += 0.003 * speed;
        if (s.z > 1) {
          s.x = (Math.random() - 0.5) * w;
          s.y = (Math.random() - 0.5) * h;
          s.z = 0;
          s.pz = 0;
        }
        // 鎶曞奖: z 瓒婃帴杩?1 瓒婂ぇ
        const sx = (s.x / s.z) * 0.5 + w / 2;
        const sy = (s.y / s.z) * 0.5 + h / 2;
        const psx = (s.x / s.pz) * 0.5 + w / 2;
        const psy = (s.y / s.pz) * 0.5 + h / 2;
        const r = (1 - s.z) * 2.4;
        const alpha = 1 - s.z;
        ctx.beginPath();
        ctx.strokeStyle = s.c;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = r * 0.6;
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        // 澶撮儴鍏夌偣
        if (r > 0.5) {
          ctx.beginPath();
          ctx.fillStyle = "#fff";
          ctx.globalAlpha = alpha;
          ctx.arc(sx, sy, Math.max(0.6, r * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight; fit();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [speed, density]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}