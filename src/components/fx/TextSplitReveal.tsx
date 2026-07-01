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

// Text split reveal - inspired by reactbits.dev split text.
export function TextSplitReveal({ text, className = "", delay = 0, stagger = 0.04, once = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.3 });
  const words = text.split(" ");

  return (
    <span ref={ref} className={"inline-block " + className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em]">
          {Array.from(word).map((ch, ci) => (
            <motion.span
              key={ci}
              initial={{ y: "120%", opacity: 0 }}
              animate={inView ? { y: "0%", opacity: 1 } : { y: "120%", opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: delay + (wi * 0.05) + (ci * stagger),
                ease: [0.16, 1, 0.3, 1]
              }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
