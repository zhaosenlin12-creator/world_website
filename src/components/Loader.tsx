"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zh } from "@/i18n/zh";

export function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.6, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm tracking-[0.4em] text-white/80 uppercase"
            >
              {zh.loader}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
