"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { LiquidGlassPanel } from "./LiquidGlassPanel";

interface Props {
  src: string;
  poster?: string;
  title: string;
  eyebrow?: string;
  body?: string;
  href?: string;
  ctaLabel?: string;
  tone?: "neutral" | "cyan" | "fuchsia" | "amber";
  height?: string;
}

// Auto-looping NASA video panel with fade-in/out and overlay CTA card.
export function FeaturedVideoPanel({
  src,
  poster,
  title,
  eyebrow,
  body,
  href,
  ctaLabel = "阅读详情",
  tone = "cyan",
  height = "h-[420px] md:h-[520px]",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const replayTimeoutRef = useRef<number | null>(null);
  const hasFadedRef = useRef(false);
  const isReplayingRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        /* autoplay can be blocked; ignore */
      }
    };

    const animateOpacity = (target: HTMLVideoElement, to: number, duration: number) => {
      const from = Number(target.style.opacity || target.getAttribute("data-opacity") || 0);
      const start = performance.now();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const next = from + (to - from) * progress;
        target.style.opacity = String(next);
        target.setAttribute("data-opacity", String(next));
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          animationRef.current = null;
        }
      };
      animationRef.current = requestAnimationFrame(tick);
    };

    const restartVideo = () => {
      video.currentTime = 0;
      hasFadedRef.current = false;
      isReplayingRef.current = false;
      void playVideo();
      animateOpacity(video, 1, 500);
      hasFadedRef.current = true;
    };

    const queueReplay = () => {
      if (isReplayingRef.current) return;
      isReplayingRef.current = true;
      video.style.opacity = "0";
      video.setAttribute("data-opacity", "0");
      if (replayTimeoutRef.current !== null) window.clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = window.setTimeout(() => restartVideo(), 100);
    };

    let monitorFrame = 0;
    const monitorVideo = () => {
      if (video.readyState >= 3 && !hasFadedRef.current && !isReplayingRef.current) {
        animateOpacity(video, 1, 500);
        hasFadedRef.current = true;
      }
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const remaining = video.duration - video.currentTime;
        if (remaining <= 0.02 || (video.paused && video.currentTime >= video.duration - 0.02)) {
          queueReplay();
        }
      }
      monitorFrame = window.requestAnimationFrame(monitorVideo);
    };

    video.style.opacity = "0";
    video.setAttribute("data-opacity", "0");
    void playVideo();
    monitorFrame = window.requestAnimationFrame(monitorVideo);

    return () => {
      if (monitorFrame) cancelAnimationFrame(monitorFrame);
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      if (replayTimeoutRef.current !== null) window.clearTimeout(replayTimeoutRef.current);
    };
  }, []);

  const headingVariants = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.15, ease: "easeOut" as const },
      };

  return (
    <section className={`relative w-full overflow-hidden rounded-[28px] ${height}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        autoPlay
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_75%)]" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-6 p-6 md:p-10">
        {eyebrow ? (
          <motion.div
            {...headingVariants}
            className="text-[11px] uppercase tracking-[0.35em] text-white/70"
          >
            {eyebrow}
          </motion.div>
        ) : null}
        <motion.h3
          {...headingVariants}
          transition={{ duration: 0.85, delay: 0.22, ease: "easeOut" as const }}
          className="font-display text-2xl md:text-4xl font-semibold text-white max-w-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
        >
          {title}
        </motion.h3>

        {body ? (
          <LiquidGlassPanel
            tone={tone}
            interactive
            delay={0.3}
            className="max-w-2xl rounded-2xl"
          >
            <div className="p-4 md:p-5">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">{body}</p>
            </div>
          </LiquidGlassPanel>
        ) : null}

        {href ? (
          <motion.a
            {...headingVariants}
            transition={{ duration: 0.85, delay: 0.4, ease: "easeOut" as const }}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <span>{ctaLabel}</span>
            <span aria-hidden>&#8599;</span>
          </motion.a>
        ) : null}
      </div>
    </section>
  );
}

