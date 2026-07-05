"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export type MissionVoiceKey =
  | "targetLocked"
  | "approach"
  | "entry"
  | "atmosphere"
  | "landingTransition"
  | "fragileWarning"
  | "hazardWarning"
  | "respawn"
  | "sample"
  | "touchdown";

type PlayOptions = {
  cooldownMs?: number;
  interrupt?: boolean;
  volume?: number;
};

const VOICE_SOURCES: Record<MissionVoiceKey, string> = {
  targetLocked: "/audio/tts/target-locked.mp3",
  approach: "/audio/tts/approach.mp3",
  entry: "/audio/tts/entry.mp3",
  atmosphere: "/audio/tts/atmosphere.mp3",
  landingTransition: "/audio/tts/landing-transition.mp3",
  fragileWarning: "/audio/tts/fragile-warning.mp3",
  hazardWarning: "/audio/tts/hazard-warning.mp3",
  respawn: "/audio/tts/respawn-warning.mp3",
  sample: "/audio/tts/sample-collected.mp3",
  touchdown: "/audio/tts/touchdown.mp3"
};

function createAudio(src: string) {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
}

export function useMissionVoice(enabled: boolean) {
  const unlockedRef = useRef(false);
  const audioMapRef = useRef<Partial<Record<MissionVoiceKey, HTMLAudioElement>>>({});
  const currentRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<Partial<Record<MissionVoiceKey, number>>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextMap: Partial<Record<MissionVoiceKey, HTMLAudioElement>> = {};
    (Object.keys(VOICE_SOURCES) as MissionVoiceKey[]).forEach((key) => {
      nextMap[key] = createAudio(VOICE_SOURCES[key]);
    });
    audioMapRef.current = nextMap;

    return () => {
      Object.values(nextMap).forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const unlock = useCallback(() => {
    unlockedRef.current = true;
  }, []);

  const stop = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current.currentTime = 0;
      currentRef.current = null;
    }
  }, []);

  const speak = useCallback((key: MissionVoiceKey, options?: PlayOptions) => {
    if (!enabled || !unlockedRef.current) return;
    const audio = audioMapRef.current[key];
    if (!audio) return;

    const now = performance.now();
    const cooldownMs = options?.cooldownMs ?? 0;
    const lastPlayed = lastPlayedRef.current[key] ?? 0;
    if (cooldownMs > 0 && now - lastPlayed < cooldownMs) return;
    lastPlayedRef.current[key] = now;

    const interrupt = options?.interrupt ?? true;
    if (interrupt && currentRef.current && currentRef.current !== audio) {
      currentRef.current.pause();
      currentRef.current.currentTime = 0;
    }

    audio.volume = options?.volume ?? 0.92;
    audio.currentTime = 0;
    currentRef.current = audio;
    audio.play().catch(() => {});
  }, [enabled]);

  const preloadSources = useMemo(() => Object.values(VOICE_SOURCES), []);

  return useMemo(() => ({
    preloadSources,
    speak,
    stop,
    unlock
  }), [preloadSources, speak, stop, unlock]);
}
