"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (v: number) => string;
}

export function CountUp({ to, from = 0, duration = 1.6, prefix = "", suffix = "", className = "", format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const value = useMotionValue(from);
  const display = useTransform(value, (v) => format ? format(v) : Math.round(v).toString());

  useEffect(() => {
    if (inView) {
      const ctrl = animate(value, to, { duration, ease: [0.16, 1, 0.3, 1] });
      return () => ctrl.stop();
    }
  }, [inView, value, to, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
