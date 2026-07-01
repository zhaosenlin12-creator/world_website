import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Starfield } from "@/components/Starfield";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Loader } from "@/components/Loader";
import { NoiseOverlay } from "@/components/fx/NoiseOverlay";
import { ClickSpark } from "@/components/fx/ClickSpark";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "宇宙探索者 — 太阳系与远方",
  description: "一段电影感、互动式的太阳系旅程——3D 探索、任务故事与宇宙科学。",
  keywords: ["太阳系","行星","太空","NASA","探索","3D","宇宙"],
  openGraph: {
    title: "宇宙探索者 — 太阳系与远方",
    description: "一段电影感、互动式的太阳系旅程。",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${body.variable}`}>
      <body>
        <Starfield />
        <Loader />
        <SiteHeader />
        <main className="relative z-10">{children}</main>
        <SiteFooter />
        <ClickSpark />
        <NoiseOverlay opacity={0.05} />
      </body>
    </html>
  );
}
