"use client";
import { useEffect, useRef } from "react";

// 静态星点 + 偶发流星, 慢速精致
export function StarField({ density = 140 }: { density?: number }) {
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
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    type Star = {
      x: number;
      y: number;
      r: number;
      base: number;
      phase: number;
      color: string;
    };
    const palette = ["#ffffff", "#fde68a", "#c4b5fd", "#a5f3fc", "#fbcfe8"];
    const stars: Star[] = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      base: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));

    // 流星: 每 4-8 秒一颗
    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      color: string;
    };
    const meteors: Meteor[] = [];
    let nextMeteor = 2 + Math.random() * 4;

    let raf = 0;
    let t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      // 轻拖尾
      ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
      ctx.fillRect(0, 0, w, h);

      // 星点 (缓慢呼吸)
      for (const s of stars) {
        const a = s.base + 0.25 * Math.sin(t * 0.8 + s.phase);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 生成新流星
      nextMeteor -= 1 / 60;
      if (nextMeteor <= 0) {
        const startX = Math.random() * w;
        const startY = Math.random() * h * 0.5; // 上半屏
        const angle = Math.PI * 0.15 + Math.random() * 0.15; // ~30度斜向下
        const speed = 4 + Math.random() * 3;
        meteors.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 1.4 + Math.random() * 0.6,
          color: ["#a78bfa", "#c4b5fd", "#fde68a", "#f9a8d4"][Math.floor(Math.random() * 4)]
        });
        nextMeteor = 4 + Math.random() * 5;
      }

      // 渲染流星
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += 1 / 60;
        if (m.life > m.max) {
          meteors.splice(i, 1);
          continue;
        }
        m.x += m.vx;
        m.y += m.vy;
        const lifeRatio = m.life / m.max;
        const alpha = Math.max(0, 1 - lifeRatio);
        const tailLen = 60;
        const tx = m.x - m.vx * (tailLen / Math.hypot(m.vx, m.vy));
        const ty = m.y - m.vy * (tailLen / Math.hypot(m.vx, m.vy));
        const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
        grad.addColorStop(0, m.color);
        grad.addColorStop(1, "rgba(167, 139, 250, 0)");
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // 头部光点
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      fit();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}