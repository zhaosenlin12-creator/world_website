"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { Aurora } from "@/components/fx/Aurora";
import { GradientBlob } from "@/components/fx/GradientBlob";
import { useMemo, useState } from "react";

// Each card has a unique animated SVG scene representing its content type
const SCENES = {
  teaching: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="sun-grad-r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="#0b0820" />
      {Array.from({ length: 50 }).map((_, i) => (
        <circle key={i} cx={(i * 37) % 200} cy={(i * 19) % 120} r={i % 3 === 0 ? 1.1 : 0.5} fill="#fff" opacity={0.25} />
      ))}
      <ellipse cx="100" cy="60" rx="32" ry="10" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.5" />
      <ellipse cx="100" cy="60" rx="50" ry="15" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.5" />
      <ellipse cx="100" cy="60" rx="68" ry="22" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.5" />
      <circle cx="100" cy="60" r="10" fill="url(#sun-grad-r)">
        <animate attributeName="r" values="10;11.5;10" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="60" r="14" fill="none" stroke="#fb923c" strokeOpacity="0.4" strokeWidth="0.5">
        <animate attributeName="r" values="14;22;14" dur="4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite" />
      </circle>      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 100 60" to="360 100 60" dur="6s" repeatCount="indefinite" />
        <circle cx="132" cy="60" r="2.4" fill="#a8a29e" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 100 60" to="360 100 60" dur="12s" repeatCount="indefinite" />
        <circle cx="150" cy="60" r="3.2" fill="#3b82f6" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 100 60" to="-360 100 60" dur="20s" repeatCount="indefinite" />
        <circle cx="168" cy="60" r="3.6" fill="#dc2626" />
      </g>
      <g transform="translate(14 14)" opacity="0.9">
        <rect x="0" y="0" width="34" height="42" rx="2" fill="#0f172a" stroke="#a855f7" strokeWidth="0.6" />
        <rect x="4" y="6" width="20" height="1.5" fill="#cbd5e1" />
        <rect x="4" y="11" width="26" height="1.5" fill="#cbd5e1" opacity="0.7" />
        <rect x="4" y="16" width="18" height="1.5" fill="#cbd5e1" opacity="0.6" />
        <rect x="4" y="21" width="22" height="1.5" fill="#cbd5e1" opacity="0.5" />
        <rect x="4" y="26" width="14" height="1.5" fill="#a855f7" opacity="0.85" />
        <circle cx="26" cy="33" r="4" fill="#a855f7" opacity="0.6" />
      </g>
    </svg>
  ),
  models3d: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="cube-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="cube-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="cube-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="#020617" />
      <g opacity="0.2">
        <polygon points="30,90 45,82 45,98 30,106" fill="#22d3ee" />
        <polygon points="45,82 60,90 45,98" fill="#22d3ee" />
        <polygon points="30,90 45,82 60,90 45,98" fill="#67e8f9" />
        <polygon points="150,82 165,74 165,90 150,98" fill="#22d3ee" />
        <polygon points="165,74 180,82 165,90" fill="#22d3ee" />
        <polygon points="150,82 165,74 180,82 165,90" fill="#67e8f9" />
      </g>
      <g transform="translate(100 60)">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" additive="sum" />
        <polygon points="-22,-14 0,-26 22,-14 0,-2" fill="url(#cube-g3)" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.4" />
        <polygon points="-22,-14 -22,12 0,24 0,-2" fill="url(#cube-g2)" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.4" />
        <polygon points="22,-14 22,12 0,24 0,-2" fill="url(#cube-g1)" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.4" />
      </g>
      <g opacity="0.4" stroke="#22d3ee" strokeWidth="0.3" fill="none">
        <line x1="20" y1="60" x2="180" y2="60" />
        <line x1="100" y1="10" x2="100" y2="110" />
      </g>
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={20 + i * 22} cy={20 + (i % 3) * 35} r="1" fill="#67e8f9" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  ),  dataset: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="bar-r" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="#020617" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1="20" y1={20 + i * 16} x2="180" y2={20 + i * 16} stroke="#22d3ee" strokeOpacity="0.1" strokeWidth="0.3" />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = 28 + (i * 23) % 150;
        const y = 95 - ((i * 13) % 70);
        return <circle key={i} cx={x} cy={y} r="1.4" fill="#22d3ee" opacity={0.4 + (i % 3) * 0.2} />;
      })}
      {[40, 70, 55, 88, 62, 95].map((h, i) => (
        <rect key={i} x={30 + i * 24} y={100 - h} width="14" height={h} fill="url(#bar-r)" rx="1">
          <animate attributeName="height" values={`${h * 0.4};${h};${h * 0.4}`} dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="y" values={`${100 - h * 0.4};${100 - h};${100 - h * 0.4}`} dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </rect>
      ))}
      <polyline points="32,75 56,55 80,65 104,40 128,50 152,30 176,42" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {[[32,75],[56,55],[80,65],[104,40],[128,50],[152,30],[176,42]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#fbbf24" />
      ))}
    </svg>
  ),
  images: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="spiral-r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="40%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="#1e1b4b" />
      {Array.from({ length: 70 }).map((_, i) => (
        <circle key={i} cx={(i * 41) % 200} cy={(i * 23) % 120} r={i % 4 === 0 ? 1 : 0.5} fill="#fff" opacity={0.4}>
          <animate attributeName="opacity" values="0.1;1;0.1" dur={`${1.5 + (i % 7) * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <g transform="translate(100 60)">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="40s" repeatCount="indefinite" additive="sum" />
        {[0, 1, 2].map((arm) => (
          <g key={arm} transform={`rotate(${arm * 120})`}>
            <path d="M 0,0 Q 25,-15 50,-10 T 90,-5" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
            <path d="M 0,0 Q 25,-15 50,-10 T 90,-5" stroke="#fbcfe8" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" transform="scale(0.85) rotate(8)" />
          </g>
        ))}
        <circle cx="0" cy="0" r="8" fill="url(#spiral-r)">
          <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="3" fill="#fde68a" />
      </g>
    </svg>
  ),  activities: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="bubble-r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="80%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="#022c22" />
      <g transform="translate(60 30)">
        <path d="M 14,0 L 26,0 L 26,28 L 40,52 L 0,52 L 14,28 Z" fill="rgba(16,185,129,0.18)" stroke="#10b981" strokeWidth="1.2" />
        <rect x="14" y="0" width="12" height="4" fill="#10b981" />
        <path d="M 16,28 L 24,28 L 36,50 L 4,50 Z" fill="#10b981" opacity="0.55" />
        <circle cx="14" cy="40" r="2" fill="url(#bubble-r)">
          <animate attributeName="cy" values="46;28;46" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.9;0" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="22" cy="42" r="1.5" fill="url(#bubble-r)">
          <animate attributeName="cy" values="48;30;48" dur="3.2s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.9;0" dur="3.2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </g>
      <g transform="translate(120 20)">
        <rect x="10" y="0" width="6" height="6" fill="#0e7490" />
        <path d="M 10,6 L 16,6 L 16,55 Q 13,62 10,62 Q 7,62 7,55 L 7,6 Z" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="1.2" />
        <rect x="7" y="42" width="9" height="20" fill="#22d3ee" opacity="0.7">
          <animate attributeName="y" values="46;38;46" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="height" values="14;22;14" dur="2.6s" repeatCount="indefinite" />
        </rect>
      </g>
      {[[20,30],[180,50],[30,90],[170,100]].map(([x,y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle cx="0" cy="0" r="2.5" fill="#fbbf24" opacity="0.7">
            <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
          <circle cx="6" cy="-4" r="2" fill="#22d3ee" opacity="0.7">
            <animate attributeName="cy" values={`${y - 4};${y - 10};${y - 4}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
          <line x1="0" y1="0" x2="6" y2="-4" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
        </g>
      ))}
    </svg>
  ),
  video: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="play-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="#020617" />
      <g transform="translate(8 10)">
        <rect x="0" y="0" width="184" height="22" fill="#0f172a" stroke="#a855f7" strokeWidth="0.5" rx="2" />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <rect x={6 + i * 22} y="2" width="4" height="3" fill="#fff" opacity="0.3" />
            <rect x={6 + i * 22} y="17" width="4" height="3" fill="#fff" opacity="0.3" />
            <rect x={12 + i * 22} y="4" width="14" height="14" fill="#1e1b4b" stroke="#a855f7" strokeOpacity="0.5" strokeWidth="0.3" />
            <circle cx={19 + i * 22} cy="11" r="2" fill="#a855f7" opacity="0.4" />
          </g>
        ))}
      </g>
      <g transform="translate(8 88)">
        <rect x="0" y="0" width="184" height="22" fill="#0f172a" stroke="#a855f7" strokeWidth="0.5" rx="2" />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <rect x={6 + i * 22} y="2" width="4" height="3" fill="#fff" opacity="0.3" />
            <rect x={6 + i * 22} y="17" width="4" height="3" fill="#fff" opacity="0.3" />
            <rect x={12 + i * 22} y="4" width="14" height="14" fill="#1e1b4b" stroke="#a855f7" strokeOpacity="0.5" strokeWidth="0.3" />
            <rect x={14 + i * 22} y="6" width="10" height="10" fill="#3b82f6" opacity="0.4" />
          </g>
        ))}
      </g>
      <g transform="translate(100 60)">
        <circle r="22" fill="#0f172a" stroke="url(#play-g)" strokeWidth="1.5" />
        <circle r="22" fill="url(#play-g)" opacity="0.18">
          <animate attributeName="r" values="22;28;22" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.18;0;0.18" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M -7,-9 L 9,0 L -7,9 Z" fill="url(#play-g)" />
      </g>
      <text x="14" y="68" fill="#a855f7" fontSize="6" fontFamily="monospace">00:12:34</text>
      <rect x="170" y="62" width="22" height="8" fill="#a855f7" rx="2" />
      <text x="173" y="68" fill="#fff" fontSize="5" fontFamily="monospace">HD</text>
    </svg>
  ),  posters: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="poster-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="poster-planet" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="url(#poster-bg)" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 37) % 200} cy={(i * 19) % 120} r="0.4" fill="#fff" opacity={0.3} />
      ))}
      <g transform="translate(50 12)">
        <rect x="0" y="0" width="100" height="96" fill="#0f172a" stroke="#fde68a" strokeWidth="1" />
        <rect x="3" y="3" width="94" height="86" fill="#020617" />
        <circle cx="50" cy="48" r="28" fill="url(#poster-planet)">
          <animate attributeName="r" values="28;29;28" dur="4s" repeatCount="indefinite" />
        </circle>
        <ellipse cx="50" cy="48" rx="38" ry="6" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity="0.7" transform="rotate(-15 50 48)" />
        <ellipse cx="50" cy="48" rx="38" ry="6" fill="none" stroke="#fb923c" strokeWidth="0.5" opacity="0.5" transform="rotate(-15 50 48)" strokeDasharray="2 3" />
        <text x="50" y="92" fill="#fde68a" fontSize="7" textAnchor="middle" fontFamily="serif" fontWeight="bold">土星</text>
      </g>
      <g transform="translate(20 80) rotate(-8)" opacity="0.55">
        <rect x="0" y="0" width="34" height="42" fill="#0f172a" stroke="#22d3ee" strokeWidth="0.5" />
        <circle cx="17" cy="20" r="9" fill="#3b82f6" />
      </g>
      <g transform="translate(146 16) rotate(8)" opacity="0.55">
        <rect x="0" y="0" width="34" height="42" fill="#0f172a" stroke="#dc2626" strokeWidth="0.5" />
        <circle cx="17" cy="20" r="9" fill="#dc2626" />
      </g>
    </svg>
  ),
  apps: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="phone-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="planet-app" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="#020617" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 15} x2="200" y2={i * 15} stroke="#22d3ee" strokeOpacity="0.06" />
      ))}
      <g transform="translate(60 12)">
        <rect x="0" y="0" width="44" height="86" rx="6" fill="url(#phone-g)" stroke="#22d3ee" strokeWidth="1" />
        <rect x="3" y="3" width="38" height="80" rx="4" fill="#020617" />
        <circle cx="22" cy="9" r="1.2" fill="#22d3ee" />
        <circle cx="22" cy="40" r="14" fill="url(#planet-app)">
          <animate attributeName="r" values="14;15;14" dur="3s" repeatCount="indefinite" />
        </circle>
        <ellipse cx="22" cy="40" rx="22" ry="6" fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="0.5" />
        <ellipse cx="22" cy="40" rx="28" ry="3" fill="none" stroke="#a855f7" strokeOpacity="0.4" strokeWidth="0.5" />
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 22 40" to="360 22 40" dur="6s" repeatCount="indefinite" />
          <circle cx="44" cy="40" r="1.5" fill="#fbbf24" />
        </g>
        <rect x="6" y="60" width="32" height="2" rx="1" fill="#22d3ee" opacity="0.6" />
        <rect x="6" y="65" width="22" height="2" rx="1" fill="#22d3ee" opacity="0.4" />
        <rect x="6" y="70" width="28" height="2" rx="1" fill="#22d3ee" opacity="0.4" />
        <rect x="6" y="75" width="18" height="4" rx="2" fill="#22d3ee" opacity="0.85" />
      </g>
      <g transform="translate(118 18)">
        <rect x="0" y="0" width="68" height="50" rx="4" fill="url(#phone-g)" stroke="#a855f7" strokeWidth="1" />
        <rect x="3" y="3" width="62" height="44" rx="2" fill="#020617" />
        <polyline points="8,38 18,30 28,34 38,22 48,26 58,18" fill="none" stroke="#a855f7" strokeWidth="1.2" />
        <circle cx="18" cy="30" r="1.5" fill="#a855f7" />
        <circle cx="38" cy="22" r="1.5" fill="#a855f7" />
        <circle cx="58" cy="18" r="1.5" fill="#a855f7" />
        <rect x="6" y="8" width="14" height="2" rx="1" fill="#a855f7" opacity="0.5" />
      </g>
    </svg>
  ),  visualization: () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="viz-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="#020617" />
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={i} cx={(i * 41) % 200} cy={(i * 17) % 120} r="0.4" fill="#fff" opacity="0.25" />
      ))}
      <ellipse cx="100" cy="60" rx="22" ry="8" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.6" />
      <ellipse cx="100" cy="60" rx="38" ry="13" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.6" />
      <ellipse cx="100" cy="60" rx="56" ry="18" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.6" />
      <ellipse cx="100" cy="60" rx="76" ry="24" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.6" />
      <ellipse cx="100" cy="60" rx="92" ry="30" fill="none" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="0.6" />
      <circle cx="100" cy="60" r="7" fill="url(#viz-sun)">
        <animate attributeName="r" values="7;8;7" dur="3s" repeatCount="indefinite" />
      </circle>
      {[
        { r: 22, color: "#a8a29e", size: 2, dur: 6 },
        { r: 38, color: "#fb923c", size: 2.8, dur: 10 },
        { r: 56, color: "#3b82f6", size: 3, dur: 14, hasMoon: true },
        { r: 76, color: "#dc2626", size: 2.4, dur: 18 },
        { r: 92, color: "#fbbf24", size: 4, dur: 28, hasRings: true }
      ].map((p, i) => (
        <g key={i}>
          <animateTransform attributeName="transform" type="rotate" from="0 100 60" to="360 100 60" dur={`${p.dur}s`} repeatCount="indefinite" />
          <g transform={`translate(${100 + p.r} 60)`}>
            <circle r={p.size} fill={p.color} />
            {p.hasRings && (
              <ellipse rx={p.size * 2} ry={p.size * 0.4} fill="none" stroke="#fde68a" strokeWidth="0.6" opacity="0.8" />
            )}
            {p.hasMoon && (
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
                <circle cx={p.size + 4} cy="0" r="1" fill="#cbd5e1" />
              </g>
            )}
          </g>
        </g>
      ))}
    </svg>
  )
};

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "教学", label: "教学" },
  { key: "数据", label: "数据" },
  { key: "图像", label: "图像" },
  { key: "活动", label: "活动" },
  { key: "应用", label: "应用" }
];

const TAG_TO_SCENE: Record<string, keyof typeof SCENES> = {
  "教学套件": "teaching",
  "3D 模型": "models3d",
  "数据集": "dataset",
  "图像": "images",
  "活动": "activities",
  "视频": "video",
  "海报": "posters",
  "应用": "apps",
  "可视化": "visualization"
};
export function ResourcesView() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const cards = zh.resources.cards || [];
    if (filter === "all") return cards;
    return cards.filter((c: any) => c.tag.includes(filter));
  }, [filter]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Aurora opacity={0.22} />
        <GradientBlob size={520} speed={32} className="-top-40 -left-40" opacity={0.15} colors={["#a855f7", "#ec4899", "#22d3ee"]} />
        <GradientBlob size={460} speed={28} className="-bottom-32 -right-32" opacity={0.12} colors={["#22d3ee", "#3b82f6", "#a855f7"]} />
      </div>
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="eyebrow mb-3">{zh.resources.eyebrow}</div>
            <h1 className="h-section gradient-text">{zh.resources.title}</h1>
            <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.resources.desc}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition ${filter === f.key ? "bg-white/15 text-white" : "text-white/55 hover:text-white hover:bg-white/5"}`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c, i) => {
              const sceneKey = TAG_TO_SCENE[c.tag] || "teaching";
              const Scene = SCENES[sceneKey];
              return (
                <motion.a
                  key={c.url + i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: (i % 9) * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-500 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.18)]"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Scene />
                    <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-white/95 bg-black/45 backdrop-blur px-2 py-0.5 rounded-full">
                      {c.tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-lg leading-snug text-white">{c.title}</h2>
                    <p className="text-sm text-white/65 mt-2 leading-relaxed">{c.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs text-purple-300 group-hover:text-white transition">
                      <span>前往来源</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/50 py-12">该分类暂无资源</div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-16 glass-strong rounded-3xl p-8 text-center"
          >
            <h2 className="font-display text-2xl mb-3 gradient-text inline-block">数据来源</h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              所有文本、图像和结构化数据均来自公开的太阳系科学资料。3D 太阳系数据——包括物理参数、轨道根数和大气的组成——源自公开的事实清单。
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}