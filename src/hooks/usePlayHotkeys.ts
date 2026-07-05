"use client";

import { useEffect } from "react";

export type PlayHotkeyHandlers = {
  onPauseToggle: () => void;
  onRestart: () => void;
};

/**
 * Listens for ESC (pause), R (restart) at the document level and dispatches
 * the matching intent. The game loop pauses itself; this hook is intentionally
 * tiny so other components can compose around it without pulling heavy deps.
 */
export function usePlayHotkeys(handlers: PlayHotkeyHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "p" || event.key === "P") {
        event.preventDefault();
        handlers.onPauseToggle();
        return;
      }
      if (event.key === "r" || event.key === "R") {
        if (event.metaKey || event.ctrlKey) return; // browser reload
        event.preventDefault();
        handlers.onRestart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers, enabled]);
}
