"use client";

import { useEffect, useRef } from "react";

interface Props {
  text: string;
  className?: string;
  size?: number;
  // Optional subtitle shown below the ASCII text.
  caption?: string;
}

// Lightweight ASCII-style title built from layered CSS text shadows. The
// title leans with the cursor (parallax tilt) and breathes with a subtle
// pulse so it feels alive without pulling Three.js.
export function AsciiTitle({ text, className = "", size = 64, caption }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handle = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const dx = (event.clientX - cx) / bounds.width;
      const dy = (event.clientY - cy) / bounds.height;
      node.style.setProperty("--ascii-tilt-x", `${dy * -6}deg`);
      node.style.setProperty("--ascii-tilt-y", `${dx * 8}deg`);
    };
    node.addEventListener("pointermove", handle);
    return () => node.removeEventListener("pointermove", handle);
  }, []);

  return (
    <div ref={ref} className={`ascii-title ${className}`} style={{ ["--ascii-size" as never]: `${size}px` }}>
      <div className="ascii-title-inner">
        <span className="ascii-title-text">{text}</span>
        <span aria-hidden className="ascii-title-ghost">{text}</span>
      </div>
      {caption ? <p className="ascii-title-caption">{caption}</p> : null}
    </div>
  );
}

