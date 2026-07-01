import Link from "next/link";
import { zh } from "@/i18n/zh";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-display text-lg">{zh.footer.aboutTitle}</div>
            <p className="text-sm text-white/60 mt-3 max-w-xs">{zh.footer.aboutDesc}</p>
          </div>
          <div>
            <div className="eyebrow mb-3">{zh.footer.exploreCol}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/explore" className="hover:text-white">3D {zh.nav.explorer}</Link></li>
              <li><Link href="/planets" className="hover:text-white">{zh.nav.planets}</Link></li>
              <li><Link href="/facts" className="hover:text-white">{zh.nav.facts}与数字</Link></li>
              <li><Link href="/stories" className="hover:text-white">{zh.nav.stories}</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">{zh.footer.learnCol}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/missions" className="hover:text-white">{zh.nav.missions}</Link></li>
              <li><Link href="/resources" className="hover:text-white">{zh.nav.resources}</Link></li>
              <li><Link href="/about" className="hover:text-white">{zh.nav.about}</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">{zh.footer.dataCol}</div>
            <p className="text-xs text-white/60 leading-relaxed">{zh.footer.dataDesc}</p>
            <a href="https://science.nasa.gov/solar-system/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-purple-300 hover:text-white">
              {zh.footer.original}
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>{zh.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</div>
          <div>{zh.footer.built}</div>
        </div>
      </div>
    </footer>
  );
}
