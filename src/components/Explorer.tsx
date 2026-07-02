"use client";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { ALL_BODIES } from "@/data/bodies";
import { BodyPanel } from "@/components/BodyPanel";
import { ControlBar } from "@/components/ControlBar";
import { zh } from "@/i18n/zh";

const SolarSystem3D = dynamic(() => import("@/components/SolarSystem3D").then((m) => m.SolarSystem3D), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center"><div className="text-white/60">正在校准轨道…</div></div>
});

function nameOf(b: any) {
  return b.nameZh || b.name;
}

function kindZh(k: string) {
  if (k === "star") return zh.type.star;
  if (k === "planet") return zh.type.planet;
  if (k === "dwarf") return zh.type.dwarf;
  if (k === "belt") return zh.type.belt;
  return k;
}

export function Explorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const onSelect = useCallback((id: string) => setSelectedId(id || null), []);
  const selected = selectedId ? ALL_BODIES.find((b) => b.id === selectedId) : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden pt-16">
      <div className={"absolute inset-0 pt-16 transition-[padding] duration-500 " + (selected ? "md:pl-[380px]" : "")}>
        <SolarSystem3D
          selectedId={selectedId}
          onSelect={onSelect}
          paused={paused}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
        />
      </div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
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
      <div className={"absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-1 max-h-[70vh] overflow-y-auto glass-strong p-2 rounded-2xl transition-all duration-500 " + (selected ? "right-[400px] opacity-50 hover:opacity-100" : "right-4 opacity-100")}>
        <button
          onClick={() => setSelectedId("sun")}
          className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-sm transition ${
            selectedId === "sun" ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber-400" style={{ boxShadow: "0 0 10px #fcd34d" }} />
          <span>{nameOf({ name: "Sun", nameZh: "太阳" })}</span>
          <span className="text-[10px] uppercase tracking-widest text-white/40">{zh.type.star}</span>
        </button>
        {ALL_BODIES.filter((b) => b.id !== "sun").map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedId(b.id)}
            className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-sm transition ${
              selectedId === b.id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
            }`}
            title={nameOf(b)}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
            <span className="truncate">{nameOf(b)}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{kindZh(b.kind)}</span>
          </button>
        ))}
      </div>
      {selected && (
        <BodyPanel body={selected} onClose={() => setSelectedId(null)} />
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-xs text-white/40 text-center">
        点击行星聚焦 · 拖动旋转 · 滚轮缩放
      </div>
    </div>
  );
}
