"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import fleet from "../../../../data/nasa3d.json";
import { publicUrl } from "@/lib/assetPath";

interface Entry {
  slug: string;
  title: string;
  description: string;
  glbLocal?: string;
}

const SpacecraftFleet = dynamic(
  () => import("@/components/fx/SpacecraftFleet").then((m) => m.SpacecraftFleet),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-white/60">
        正在加载飞行器场景...
      </div>
    ),
  },
);

const zhNames: Record<string, string> = {
  "1999-rq36-asteroid": "1999 RQ36 小行星",
  "70-meter-dish": "70 米深空天线",
  "active-cavity-irradiance-monitor-satellite-acrimsat-a": "AcrimSAT 卫星 A 型",
  "active-cavity-irradiance-monitor-satellite-acrimsat-b": "AcrimSAT 卫星 B 型",
  "advanced-composition-explorer": "先进成分探测器",
  "advanced-crew-escape-suit": "先进乘员逃逸服",
  "advanced-technology-large-aperture-space-telescope-atlast": "ATLAST 大口径空间望远镜",
  "aeronomy-of-ice-in-the-mesosphere": "中间层冰层空气学探测器",
  "agena-target-vehicle": "阿吉纳目标飞行器",
  "voyager-probe-b": "旅行者探测器 B",
};

const narrationMap: Record<string, string> = {
  "1999-rq36-asteroid": "这是 OSIRIS-REx 重点研究的近地小行星，保留着太阳系早期形成阶段的原始物质。",
  "70-meter-dish": "这是一座 70 米深空通信天线，用来接收深空探测器极其微弱的信号，是 NASA 深空网络的重要节点。",
  "active-cavity-irradiance-monitor-satellite-acrimsat-a": "AcrimSAT 负责长期测量太阳总辐照度，用于研究太阳活动与地球气候之间的关系。",
  "active-cavity-irradiance-monitor-satellite-acrimsat-b": "这台 AcrimSAT 变体同样面向太阳辐照观测，展示了 NASA 长期稳定监测太阳输出的能力。",
  "advanced-composition-explorer": "先进成分探测器 ACE 主要研究太阳风、星际介质以及高能粒子的来源和组成。",
  "advanced-crew-escape-suit": "先进乘员逃逸服用于高风险飞行阶段的人体保护，兼顾压力防护与紧急撤离支持。",
  "advanced-technology-large-aperture-space-telescope-atlast": "ATLAST 是下一代大型空间望远镜概念，目标是更深入观测系外行星与深空结构。",
  "aeronomy-of-ice-in-the-mesosphere": "AIM 探测器研究地球中高层大气中的极地中间层云，用于理解高层大气变化。",
  "agena-target-vehicle": "阿吉纳目标飞行器代表了早期航天任务中的轨道交会与对接技术发展阶段。",
  "voyager-probe-b": "旅行者探测器是人类飞得最远的航天器之一，如今仍在向星际空间继续前进。",
};

function useTypewriter(text: string, active: boolean) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (!active || !text) {
      setVisibleText("");
      return;
    }

    let timer = 0;
    let index = 0;
    setVisibleText("");

    const tick = () => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index < text.length) {
        timer = window.setTimeout(tick, index < 12 ? 38 : 24);
      }
    };

    timer = window.setTimeout(tick, 120);
    return () => window.clearTimeout(timer);
  }, [active, text]);

  return visibleText;
}

export default function FleetPage() {
  const items = fleet as Entry[];
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const models = useMemo(
    () =>
      items
        .filter((entry) => Boolean(entry.glbLocal))
        .map((entry) => ({
          slug: entry.slug,
          title: zhNames[entry.slug] || entry.title,
          url: publicUrl(entry.glbLocal as string),
          description: entry.description,
          narration: narrationMap[entry.slug] || entry.description,
          scale: entry.slug === "70-meter-dish" ? 0.42 : entry.slug === "advanced-crew-escape-suit" ? 1.25 : 0.96,
        })),
    [items],
  );

  const selectedModel = models.find((item) => item.slug === selectedSlug) || null;
  const narrationText = useTypewriter(selectedModel?.narration || "", Boolean(selectedModel));

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    speechRef.current = null;

    if (!selectedModel) {
      setIsNarrating(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(selectedModel.narration);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);
    speechRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    };
  }, [selectedModel]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SpacecraftFleet models={models} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-[860px] rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(6,10,20,0.78),rgba(6,10,20,0.58))] px-4 py-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl md:px-5">
          {selectedModel ? (
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-cyan-200/82">
                  <span>已选中飞行器</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${isNarrating ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)]" : "bg-white/35"}`} />
                  <span>{isNarrating ? "讲解中" : "已就绪"}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{selectedModel.title}</div>
                <div className="mt-1 min-h-[2.2rem] text-xs leading-5 text-white/72 md:pr-4">{narrationText}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2 pb-0.5">
                <Link
                  href={`/spacecrafts/${selectedModel.slug}/`}
                  className="rounded-full border border-cyan-300/26 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/16"
                >
                  查看详情
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                    setSelectedSlug(null);
                    setIsNarrating(false);
                  }}
                  className="rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-xs text-white/78 transition hover:bg-white/10"
                >
                  收起
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] tracking-[0.24em] text-cyan-200/78">NASA 飞行器宇宙场景</div>
                <div className="mt-1 text-xs text-white/68">点击飞行器开始讲解，拖拽旋转，滚轮缩放，右键可以平移视角。</div>
              </div>
              <Link
                href="/spacecrafts/"
                className="rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
              >
                返回展廊
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

