"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { exportNodeToPng } from "@/lib/exportPng";
import { Download, Play, Square } from "lucide-react";
import type { BoardData } from "@/data/vertical-types";

interface Props {
  ui: BoardData["ui"];
  /** Noeud à exporter en PNG (board complet ou cadre de section). */
  targetRef: RefObject<HTMLElement>;
  fileName: string;
  /** Lance le défilement automatiquement avec cette durée (secondes). */
  autoStart?: number;
  ready: boolean;
  hidden: boolean;
}

export function Toolbar({ ui, targetRef, fileName, autoStart, ready, hidden }: Props) {
  const [duration, setDuration] = useState(Math.min(60, Math.max(20, autoStart ?? 30)));
  const [scrolling, setScrolling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setScrolling(false);
  }, []);

  const start = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    window.scrollTo(0, 0);
    setScrolling(true);
    const t0 = performance.now();
    const ms = duration * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      // Easing linéaire : vitesse constante du haut vers le bas.
      window.scrollTo(0, Math.round(max * p));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else stop();
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, stop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stop]);

  useEffect(() => {
    if (!autoStart || !ready || startedRef.current) return;
    startedRef.current = true;
    const id = window.setTimeout(start, 1000);
    return () => window.clearTimeout(id);
  }, [autoStart, ready, start]);

  const exportPng = useCallback(async () => {
    const node = targetRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      await exportNodeToPng(node, fileName, 2, "#F7F8FB");
    } finally {
      setExporting(false);
    }
  }, [targetRef, fileName, exporting]);

  if (hidden || scrolling) return null;

  return (
    <div
      data-toolbar
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 rounded-2xl border border-[#E3E6EE] bg-white/95 p-4 text-[22px] text-navy shadow-card backdrop-blur"
      style={{ width: 360 }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={!ready}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2 font-bold text-white disabled:opacity-40"
        >
          <Play size={22} /> {ui.autoScroll}
        </button>
        <button
          type="button"
          onClick={exportPng}
          disabled={!ready || exporting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo px-4 py-2 font-bold text-white disabled:opacity-40"
        >
          <Download size={22} /> {exporting ? ui.exporting : ui.exportPng}
        </button>
      </div>
      <label className="flex items-center gap-3">
        <span className="shrink-0 font-semibold">{ui.duration}</span>
        <input
          type="range"
          min={20}
          max={60}
          step={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="flex-1 accent-[#4F6BFF]"
        />
        <span className="w-16 text-right font-bold tabular-nums">
          {duration} {ui.seconds}
        </span>
      </label>
      <div className="flex items-start gap-2 text-[22px] leading-snug text-slate">
        <Square size={18} className="mt-1 shrink-0" />
        <span>{ui.hint}</span>
      </div>
    </div>
  );
}
