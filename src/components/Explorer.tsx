"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { ALL_BODIES } from "@/data/bodies";
import { BodyPanel } from "@/components/BodyPanel";
import { ControlBar } from "@/components/ControlBar";
import { zh } from "@/i18n/zh";

const SolarSystem3D = dynamic(() => import("@/components/SolarSystem3D").then((m) => m.SolarSystem3D), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-white/60">正在校准太阳系轨道...</div>
    </div>
  ),
});

function nameOf(body: any) {
  return body.nameZh || body.name;
}

function kindZh(kind: string) {
  if (kind === "star") return zh.type.star;
  if (kind === "planet") return zh.type.planet;
  if (kind === "dwarf") return zh.type.dwarf;
  if (kind === "belt") return zh.type.belt;
  return kind;
}

export function Explorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const onSelect = useCallback((id: string) => setSelectedId(id || null), []);
  const selected = selectedId ? ALL_BODIES.find((body) => body.id === selectedId) : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#040612]">
      <div className={"absolute inset-0 transition-[padding] duration-500 " + (selected ? "md:pl-[360px]" : "")}>
        <SolarSystem3D
          selectedId={selectedId}
          onSelect={onSelect}
          paused={paused}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
        />
      </div>

      <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 md:top-24">
        <ControlBar
          paused={paused}
          onPause={() => setPaused(!paused)}
          speed={speed}
          onSpeed={setSpeed}
          showOrbits={showOrbits}
          onOrbits={() => setShowOrbits(!showOrbits)}
          showLabels={showLabels}
          onLabels={() => setShowLabels(!showLabels)}
          onReset={() => setSelectedId(null)}
        />
      </div>

      <div
        className={
          "absolute right-3 top-20 z-20 hidden w-[170px] max-h-[68vh] flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/36 p-2 backdrop-blur-xl transition-all duration-500 md:flex " +
          (selected ? "opacity-55 hover:opacity-100" : "opacity-92")
        }
      >
        <button
          onClick={() => setSelectedId("sun")}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
            selectedId === "sun" ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
          }`}
        >
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-amber-400" style={{ boxShadow: "0 0 10px #fcd34d" }} />
          <span className="truncate">太阳</span>
          <span className="text-[10px] uppercase tracking-widest text-white/40">{zh.type.star}</span>
        </button>

        {ALL_BODIES.filter((body) => body.id !== "sun").map((body) => (
          <button
            key={body.id}
            onClick={() => setSelectedId(body.id)}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
              selectedId === body.id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
            }`}
            title={nameOf(body)}
          >
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: body.color, boxShadow: `0 0 8px ${body.color}` }}
            />
            <span className="truncate">{nameOf(body)}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{kindZh(body.kind)}</span>
          </button>
        ))}
      </div>

      {selected ? <BodyPanel body={selected} onClose={() => setSelectedId(null)} /> : null}

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-center text-[11px] text-white/42">
        点击天体聚焦 · 拖拽旋转 · 滚轮缩放 · 右键平移
      </div>
    </div>
  );
}
