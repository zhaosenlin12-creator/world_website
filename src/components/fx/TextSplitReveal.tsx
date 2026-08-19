"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

// Character-by-character reveal with depth blur + per-char perspective tilt.
export function TextSplitReveal({ text, className = "", delay = 0, stagger = 0.04, once = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.3 });
  const chars = Array.from(text);

  return (
    <span ref={ref} className={"inline-block " + className}>
      {chars.map((ch, i) => {
        const isSpace = ch === " ";
        return (
          <motion.span
            key={i}
            initial={{ y: "120%", opacity: 0, filter: "blur(14px)", rotateX: -45 }}
            animate={
              inView
                ? { y: "0%", opacity: 1, filter: "blur(0px)", rotateX: 0 }
                : { y: "120%", opacity: 0, filter: "blur(14px)", rotateX: -45 }
            }
            transition={{
              duration: 0.95,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="inline-block"
            style={{ transformOrigin: "50% 100%", whiteSpace: isSpace ? "pre" : "normal" }}
          >
            {isSpace ? "\u00A0" : ch}
          </motion.span>
        );
      })}
    </span>
  );
}
