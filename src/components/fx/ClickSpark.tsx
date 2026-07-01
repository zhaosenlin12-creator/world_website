"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Spark { id: number; x: number; y: number }

export function ClickSpark() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    let next = 0;
    const onClick = (e: MouseEvent) => {
      const id = next++;
      setSparks((arr) => [...arr, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setSparks((arr) => arr.filter((s) => s.id !== id));
      }, 900);
    };
    window.addEventListener("pointerdown", onClick);
    return () => window.removeEventListener("pointerdown", onClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]">
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 1, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute"
            style={{ left: s.x - 32, top: s.y - 32, width: 64, height: 64 }}
          >
            <span className="absolute inset-0 rounded-full border-2 border-purple-400/70" />
            <span className="absolute inset-2 rounded-full border-full border-pink-400/60" />
            <span className="absolute inset-4 rounded-full border-full border-amber-400/50" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
