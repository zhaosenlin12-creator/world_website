"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { zh } from "@/i18n/zh";

const NAV = [
  { href: "/", label: zh.nav.home },
  { href: "/explore", label: zh.nav.explorer },
  { href: "/play", label: zh.nav.play },
  { href: "/planets", label: zh.nav.planets },
  { href: "/stories", label: zh.nav.stories },
  { href: "/facts", label: zh.nav.facts },
  { href: "/missions", label: zh.nav.missions },
  { href: "/resources", label: zh.nav.resources },
  { href: "/about", label: zh.nav.about }
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname === "/play") return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className={`mx-auto px-6 transition-all duration-500 ${
        scrolled ? "max-w-6xl" : "max-w-7xl"
      }`}>
        <div className={`flex items-center justify-between gap-6 rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? "glass-strong" : "bg-transparent"
        }`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 blur-md group-hover:blur-lg transition" />
              <div className="absolute inset-1 rounded-full bg-black" />
              <div className="absolute inset-[6px] rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-spinSlow" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold text-white tracking-wide">{zh.siteName}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-purple-300/70">{zh.siteTagline}</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative px-3 py-2 text-sm text-white/80 hover:text-white transition group"
              >
                <span className="relative z-10">{n.label}</span>
                <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/explore" className="btn-primary">
              <span>{zh.buttons.launch3d}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
          <button
            aria-label="菜单"
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white/80"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-2"
            >
              <div className="glass-strong rounded-2xl p-3 flex flex-col">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-white/90 hover:bg-white/5"
                  >{n.label}</Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
