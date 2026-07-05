"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  text: string;
};

export default function AudioSubtitle({ text }: Props) {
  return (
    <AnimatePresence>
      {text ? (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-50 w-[min(90vw,680px)] -translate-x-1/2"
        >
          <div className="rounded-full border border-cyan-400/30 bg-black/48 px-5 py-2.5 text-center text-sm text-white/90 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-md">
            {text}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
