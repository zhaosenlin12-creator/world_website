"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { zh } from "@/i18n/zh";
import { ClickRipples } from "@/components/fx/ClickRipples";
import { TextType } from "@/components/fx/TextType";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { CountUp } from "@/components/fx/CountUp";

// 直接同步导入: 原 dynamic() 在生产构建中 chunk 解析异常, 改成同步导入保证首屏立即挂载
// (Hero3DScene 内部已经 "use client" + Suspense 包裹 useTexture, 客户端水合后立即渲染)
import { Hero3DScene } from "@/components/fx/Hero3DScene";

// 多文案循环 (与项目主题相关)
const HERO_CYCLE = [
  "探索太阳系",
  "飞跃八大行星",
  "穿越小行星带",
  "靠近太阳边缘",
  "追寻旅行者号",
  "触碰宇宙边界",
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <ClickRipples className="block">
      <section
        ref={ref}
        className="relative min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-12 bg-[#05060f]"
        style={{ cursor: "crosshair" }}
      >
        {mounted ? <Hero3DScene /> : <div className="absolute inset-0 bg-[#05060f]"><div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" /></div>}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(5,6,15,0.55) 75%, rgba(5,6,15,0.85) 100%)"
          }}
        />

        <motion.div style={{ opacity, scale }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="eyebrow mb-6 inline-block"
          >
            <span className="relative">
              {zh.hero.eyebrow}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
              />
            </span>
          </motion.div>

          <motion.h1
            style={{ y: titleY }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.15] tracking-tight glow-text min-h-[2.4em]"
          >
            <TextType
              as="span"
              text={HERO_CYCLE}
              typingSpeed={85}
              deletingSpeed={40}
              pauseDuration={1600}
              loop
              showCursor
              cursorCharacter="|"
              cursorClassName="text-cyan-300"
              className="block gradient-text text-shimmer"
              textColors={["#c4b5fd", "#f0abfc", "#fcd34d", "#67e8f9", "#fda4af", "#86efac"]}
              variableSpeed={{ min: 60, max: 130 }}
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed"
          >
            {zh.hero.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton strength={0.4} className="inline-block">
              <Link href="/explore" className="btn-primary text-base px-6 py-3 inline-flex">
                <span>{zh.buttons.launch3d}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.4} className="inline-block">
              <Link href="/spacecrafts/fleet" className="btn-ghost text-base px-6 py-3 inline-flex">
                飞行器阵列
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.4} className="inline-block">
              <Link href="/play" className="text-base px-6 py-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/50 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-200 transition">
                <span>{"🎮"}</span>
                <span>{"开始游戏"}</span>
                <span className="text-[10px] uppercase tracking-widest text-fuchsia-300/70 ml-1">{"NEW"}</span>
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { to: 8, v: zh.hero.stats.planets },
                { to: 5, v: zh.hero.stats.dwarfs },
              { to: 290, suffix: "+", v: zh.hero.stats.moons },
              { to: 1.3, format: (n: number) => n.toFixed(1) + "M+", v: zh.hero.stats.asteroids }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.1, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.04 }}
                className="glass px-4 py-3 cursor-default transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
              >
                <div className="font-display text-2xl gradient-text">
                  <CountUp to={s.to} duration={1.8} format={s.format} />
                </div>
                <div className="text-xs tracking-widest text-white/60">{s.v}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.8 }}
          className="absolute top-28 right-8 text-[10px] tracking-[0.3em] text-white/30 hidden md:block z-10"
        >
          ✦ 点击任意位置产生星轨波纹
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.4em] flex flex-col items-center gap-2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span>向下滚动探索</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 7l5 5 5-5" />
          </svg>
        </motion.div>
      </section>
    </ClickRipples>
  );
}








