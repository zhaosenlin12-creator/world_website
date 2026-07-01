"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import Link from "next/link";
import { SolarBody, BODIES } from "@/data/bodies";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Article { url: string; slug: string; title: string; description: string; hero: string | null; body: string[]; headings: { level: number; text: string }[]; images: { src: string; alt: string }[] }

function kindLabel(k: string) {
  if (k === "star") return zh.type.star;
  if (k === "dwarf") return zh.type.dwarf;
  if (k === "belt") return zh.type.belt;
  return zh.type.planet;
}

function bodyName(b: SolarBody): string {
  return b.nameZh || b.name;
}

export function PlanetDetail({ body, articles }: { body: SolarBody; articles: Article[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(5, 3, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(new THREE.Color(body.color), 0.7);
    rim.position.set(-3, -1, -3);
    scene.add(rim);

    const radius = 1.5;
    const geom = new THREE.SphereGeometry(radius, 96, 96);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(body.color),
      roughness: 0.7,
      metalness: 0.1,
      emissive: new THREE.Color(body.color),
      emissiveIntensity: 0.05
    });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    if (body.hasRings) {
      const ringGeom = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(body.ringColor || "#fde68a"), side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      scene.add(ring);
    }

    if (body.id === "earth" || body.id === "venus") {
      const aGeom = new THREE.SphereGeometry(radius * 1.05, 64, 64);
      const aMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(body.color), side: THREE.BackSide, transparent: true, opacity: 0.18 });
      scene.add(new THREE.Mesh(aGeom, aMat));
    }

    let raf = 0;
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    canvas.addEventListener("mousemove", onMove);
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      mesh.rotation.y += 0.0035;
      mesh.rotation.x = my * 0.3;
      mesh.rotation.z = mx * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [body]);

  const linked = BODIES.filter((b) => b.kind === body.kind && b.id !== body.id).slice(0, 4);

  return (
    <article className="pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="eyebrow mb-3">{kindLabel(body.kind)}</div>
          <h1 className="h-section gradient-text inline-flex items-center gap-4">
            <span className="text-4xl">{body.emoji}</span>
            <span>{bodyName(body)}</span>
            <span className="text-3xl text-white/50">{body.symbol}</span>
          </h1>
          <p className="mt-3 text-white/65 max-w-2xl mx-auto italic">{body.taglineZh || body.tagline}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-[16/8] rounded-3xl overflow-hidden glass-strong mb-12"
        >
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 30% 30%, ${body.color}40, transparent 60%), radial-gradient(circle at 70% 80%, ${body.color}30, transparent 60%)` }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute bottom-4 left-4 text-xs text-white/50 tracking-widest uppercase">{zh.planetDetail.nasaColors}</div>
            <div className="absolute top-4 right-4 text-xs text-white/50">{zh.planetDetail.dragRotate}</div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <Stat label={zh.stat.diameter} value={`${body.diameterKm.toLocaleString()} km`} />
          <Stat label="距日距离" value={body.orbitAu > 0 ? `${body.orbitAu} AU` : "—"} />
          <Stat label={zh.stat.day} value={formatHours(body.rotationHours)} />
          <Stat label={zh.stat.year} value={formatDays(body.orbitPeriodDays)} />
          <Stat label={zh.stat.mass} value={body.massKg} />
          <Stat label={zh.stat.surfaceGravity} value={body.gravity} />
          <Stat label={zh.stat.axialTilt} value={`${body.axialTiltDeg}°`} />
          <Stat label={zh.stat.temperature} value={`${body.temperatureC.min}°C – ${body.temperatureC.max}°C`} />
        </div>

        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4">关于 {bodyName(body)}</h2>
          <p className="text-lg text-white/80 leading-relaxed">{body.descriptionZh || body.description}</p>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-6">
            <div className="eyebrow mb-2">组成</div>
            <p className="text-white/80">{body.compositionZh || body.composition}</p>
          </div>
          {body.atmosphere && (
            <div className="glass rounded-2xl p-6">
              <div className="eyebrow mb-2">大气</div>
              <p className="text-white/80">{body.atmosphereZh || body.atmosphere}</p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4">{zh.planetDetail.didYouKnow}</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {(body.funFactsZh || body.funFacts).map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex gap-3"
              >
                <span className="text-purple-300 mt-0.5">·</span>
                <span className="text-white/80">{f}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {articles.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl mb-4">{zh.planetDetail.fromNasa}</h2>
            <div className="space-y-8">
              {articles.map((a, i) => (
                <motion.article
                  key={a.url}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-display text-xl mb-2">{a.title}</h3>
                  {a.description && <p className="text-sm text-purple-300 mb-3">{a.description}</p>}
                  <div className="space-y-3 text-white/80 leading-relaxed">
                    {a.body.slice(0, 6).map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-purple-300 hover:text-white text-sm">
                    {zh.planetDetail.readOnNasa}
                  </a>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {linked.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl mb-4">{zh.planetDetail.related}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {linked.map((b) => (
                <Link key={b.id} href={`/planets/${b.id}`} className="group">
                  <div className="glass rounded-xl p-4 transition-all duration-500 group-hover:scale-105 group-hover:border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, ${b.color}, ${b.color}80 50%, #000)`, boxShadow: `0 0 16px ${b.color}60` }} />
                      <div>
                        <div className="font-display">{bodyName(b)}</div>
                        <div className="text-xs text-white/50">{kindLabel(b.kind)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="text-center">
          <Link href="/explore" className="btn-primary">
            <span>{zh.planetDetail.openIn3d}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </section>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-base text-white mt-1">{value}</div>
    </div>
  );
}

function formatHours(h: number) {
  if (!h) return "—";
  if (Math.abs(h) < 48) return `${h} 小时`;
  return `${(h/24).toFixed(2)} 地球日`;
}
function formatDays(d: number) {
  if (!d) return "—";
  if (d < 365) return `${d} 地球日`;
  return `${(d/365.25).toFixed(2)} 地球年`;
}
