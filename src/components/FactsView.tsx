"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { SolarBody } from "@/data/bodies";
import { useState, useMemo } from "react";

type SortKey = "order" | "diameterKm" | "orbitAu" | "rotationHours" | "orbitPeriodDays";

function nameOf(b: SolarBody) {
  return b.nameZh || b.name;
}

function kindZh(k: string) {
  if (k === "star") return zh.type.star;
  if (k === "planet") return zh.type.planet;
  if (k === "dwarf") return zh.type.dwarf;
  if (k === "belt") return zh.type.belt;
  return k;
}

export function FactsView({ bodies }: { bodies: SolarBody[] }) {
  const [sort, setSort] = useState<SortKey>("order");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    return [...bodies].sort((a, b) => {
      const av = a[sort] as number;
      const bv = b[sort] as number;
      return dir === "asc" ? av - bv : bv - av;
    });
  }, [bodies, sort, dir]);

  const headers: { k: SortKey; label: string }[] = [
    { k: "order", label: zh.facts.columns.order },
    { k: "diameterKm", label: zh.facts.columns.diameter },
    { k: "orbitAu", label: zh.facts.columns.distance },
    { k: "rotationHours", label: zh.facts.columns.day },
    { k: "orbitPeriodDays", label: zh.facts.columns.year }
  ];

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="eyebrow mb-3">{zh.facts.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.facts.title}</h1>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.facts.desc}</p>
        </motion.div>

        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/60">{zh.facts.columns.body}</th>
                  <th className="text-left px-4 py-3 font-medium text-white/60">{zh.facts.columns.type}</th>
                  {headers.map((h) => (
                    <th key={h.k} className="text-left px-4 py-3 font-medium text-white/60 cursor-pointer hover:text-white" onClick={() => { if (sort === h.k) setDir(dir === "asc" ? "desc" : "asc"); else { setSort(h.k); setDir("asc"); } }}>
                      {h.label} {sort === h.k && (dir === "asc" ? "↑" : "↓")}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium text-white/60">{zh.facts.columns.moons}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                        <span className="font-display">{nameOf(b)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{kindZh(b.kind)}</td>
                    <td className="px-4 py-3 text-white/80">{b.diameterKm > 0 ? b.diameterKm.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-white/80">{(b.orbitAu >= 0 ? b.orbitAu : "—")}</td>
                    <td className="px-4 py-3 text-white/80">{(b.rotationHours ? b.rotationHours : "—")}</td>
                    <td className="px-4 py-3 text-white/80">{b.orbitPeriodDays > 0 ? b.orbitPeriodDays.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-white/80">{b.moons ?? "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <BigStat k="46 亿年" v="太阳系年龄" />
          <BigStat k="约 24,000" v="年（绕银心一周）" />
          <BigStat k="220 km/s" v="太阳绕银河速度" />
        </div>
      </div>
    </div>
  );
}

function BigStat({ k, v }: { k: string; v: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="font-display text-3xl gradient-text">{k}</div>
      <div className="mt-2 text-white/60">{v}</div>
    </motion.div>
  );
}
