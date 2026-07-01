"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";

export function AboutView() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="eyebrow mb-3">{zh.about.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.siteName}</h1>
        </motion.div>

        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p className="text-lg">{zh.about.intro}</p>

          <h2 className="font-display text-2xl text-white mt-12">{zh.about.whatsInside}</h2>
          <ul className="space-y-2">
            <li>· 一个可旋转、点击、缩放的 3D 太阳系——基于 <span className="text-purple-300">Three.js</span> 与 <span className="text-purple-300">@react-three/fiber</span> 构建。</li>
            <li>· 由 <span className="text-purple-300">Framer Motion</span> 驱动的电影感滚动与过渡动效。</li>
            <li>· 交互式星空背景，2D 画布渲染的视差、闪烁与流星。</li>
            <li>· 每颗行星、矮行星、小行星带、柯伊伯带和奥尔特云的专属详情页。</li>
            <li>· 资源库、任务时间线以及可排序的数据表。</li>
          </ul>

          <h2 className="font-display text-2xl text-white mt-12">{zh.about.dataSources}</h2>
          <p>所有文本、图片和结构化数据均来自 NASA 开放科学档案。文章内容来自 <a className="text-purple-300 hover:text-white" href="https://science.nasa.gov/solar-system/" target="_blank" rel="noopener noreferrer">science.nasa.gov/solar-system</a>。3D 太阳系数据——包括物理参数、轨道根数和大气组成——源自 NASA 公开的事实清单。</p>

          <h2 className="font-display text-2xl text-white mt-12">{zh.about.stack}</h2>
          <ul className="space-y-2">
            <li>· <span className="text-purple-300">Next.js 14</span> + App Router</li>
            <li>· <span className="text-purple-300">TypeScript</span> + <span className="text-purple-300">Tailwind CSS</span></li>
            <li>· <span className="text-purple-300">Three.js</span>（3D 渲染）</li>
            <li>· <span className="text-purple-300">Framer Motion</span>（UI 动效）</li>
            <li>· <span className="text-purple-300">Scrapling</span>（数据采集）</li>
          </ul>

          <h2 className="font-display text-2xl text-white mt-12">{zh.about.credits}</h2>
          <p>{zh.about.creditsText}</p>
        </div>
      </div>
    </div>
  );
}
