"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

type Tone = "neutral" | "cyan" | "fuchsia" | "amber";

interface Props {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  interactive?: boolean;
  delay?: number;
  as?: "div" | "section" | "article";
}

const toneRing: Record<Tone, string> = {
  neutral: "ring-white/15",
  cyan: "ring-cyan-300/30",
  fuchsia: "ring-fuchsia-300/30",
  amber: "ring-amber-300/30",
};

const toneGlow: Record<Tone, string> = {
  neutral: "rgba(168, 85, 247, 0.18)",
  cyan: "rgba(34, 211, 238, 0.22)",
  fuchsia: "rgba(232, 121, 249, 0.22)",
  amber: "rgba(251, 191, 36, 0.22)",
};

export function LiquidGlassPanel({
  children,
  className = "",
  tone = "neutral",
  interactive = false,
  delay = 0,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = ref.current;
    if (!target || !interactive) return;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty("--pointer-x", `${x}%`);
    target.style.setProperty("--pointer-y", `${y}%`);
  };

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
      };

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref as never}
      {...motionProps}
      onPointerMove={handlePointerMove}
      className={`liquid-glass relative overflow-hidden ring-1 ${toneRing[tone]} ${className}`}
      style={{
        ["--glow-color" as never]: toneGlow[tone],
      }}
    >
      <div className="glass-content relative z-[1] h-full">{children}</div>
      <div className="liquid-pointer-glow pointer-events-none absolute inset-0" aria-hidden />
    </Component>
  );
}

