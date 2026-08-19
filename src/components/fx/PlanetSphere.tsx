"use client";
import { publicUrl } from "@/lib/assetPath";

// 用真实纹理图片 + CSS 光影模拟的行星小球
// 纯 CSS 实现, 不依赖 Three.js / R3F, 在卡片网格中能保持轻量
interface Props {
  texture?: string;       // 纹理图路径 (jpg/webp/svg)
  accent?: string;        // 主体色 (用于环境光晕)
  size?: number;          // 像素直径
  ring?: { color: string; inner: number; outer: number };
  atmosphere?: boolean;   // 是否加发光大气层
  className?: string;
}

export function PlanetSphere({
  texture,
  accent = "#a78bfa",
  size = 88,
  ring,
  atmosphere = false,
  className = "",
}: Props) {
  const px = size;
  const inner = ring ? Math.round(ring.inner * 100) / 100 : 0;
  const outer = ring ? Math.round(ring.outer * 100) / 100 : 0;
  return (
    <div
      className={"relative inline-block " + className}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div
        className="absolute -inset-3 rounded-full blur-2xl opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(circle, " + accent + "55, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: texture
            ? "url(" + publicUrl(texture) + ") center/cover no-repeat"
            : "radial-gradient(circle at 32% 28%, " + accent + ", " + accent + "80 55%, #05060f 100%)",
          boxShadow:
            "inset -8px -10px 20px rgba(0,0,0,0.55), inset 6px 8px 16px rgba(255,255,255,0.18), 0 0 24px " + accent + "55",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 25%, transparent 50%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 70% 80%, rgba(0,0,0,0.45) 0%, transparent 55%)",
            mixBlendMode: "multiply",
          }}
        />
      </div>
      {atmosphere && (
        <div
          className="absolute -inset-2 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, transparent 55%, " + accent + "44 70%, transparent 80%)",
            boxShadow: "0 0 18px " + accent + "66",
          }}
        />
      )}
      {ring && (
        <div
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{
            width: px * 1.7,
            height: px * 1.7 * 0.32,
            transform: "translate(-50%, -50%) rotate(-22deg)",
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              border: "1px solid " + ring.color + "aa",
              boxShadow:
                "0 0 12px " + ring.color + "80, inset 0 0 8px " + ring.color + "44",
              transform: "scaleY(" + (outer / inner) + ")",
              opacity: 0.9,
            }}
          />
        </div>
      )}
    </div>
  );
}
