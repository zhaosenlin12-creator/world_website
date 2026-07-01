"use client";
import { motion } from "framer-motion";

interface Props {
  colors?: string[];
  speed?: number;
  size?: number;
  className?: string;
  opacity?: number;
}

// Large, soft, animated gradient blob - inspired by reactbits.dev gradient blobs.
export function GradientBlob({ colors = ["#a855f7", "#ec4899", "#f59e0b", "#3b82f6"], speed = 20, size = 600, className = "", opacity = 0.5 }: Props) {
  return (
    <div className={"pointer-events-none absolute " + className} style={{ width: size, height: size, opacity }}>
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "conic-gradient(from 0deg, " + colors.join(", ") + ")"
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
