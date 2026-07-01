"use client";
import { motion } from "framer-motion";

interface Props {
  className?: string;
  speed?: number;
  opacity?: number;
}

// Aurora background - inspired by reactbits.dev aurora.
export function Aurora({ className = "", speed = 18, opacity = 0.25 }: Props) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} style={{ opacity }}>
      <motion.div
        className="absolute -inset-32 blur-3xl"
        style={{
          background: "radial-gradient(40% 50% at 20% 30%, rgba(168,85,247,0.7), transparent 60%), radial-gradient(40% 50% at 80% 60%, rgba(236,72,153,0.6), transparent 60%), radial-gradient(40% 50% at 50% 80%, rgba(59,130,246,0.7), transparent 60%)"
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-32 blur-3xl"
        style={{
          background: "radial-gradient(30% 40% at 60% 20%, rgba(251,191,36,0.5), transparent 60%), radial-gradient(30% 40% at 30% 70%, rgba(34,211,238,0.5), transparent 60%)"
        }}
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["-5%", "5%", "-5%"]
        }}
        transition={{ duration: speed * 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
